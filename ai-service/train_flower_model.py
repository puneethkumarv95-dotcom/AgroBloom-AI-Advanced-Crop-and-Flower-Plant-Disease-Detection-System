import os
import json
import time
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, regularizers
from tensorflow.keras.applications import MobileNetV2
from preprocess import FLOWER_CLASSES, load_dataset_split, get_data_augmentation_layer, MODELS_DIR

def build_flower_model(num_classes):
    """
    Constructs MobileNetV2 transfer learning architecture for Flower Disease Classification.
    Features:
    - Base: Pre-trained MobileNetV2 (ImageNet)
    - Head: GlobalAveragePooling2D -> BatchNormalization -> Dropout(0.3) -> Dense(96, relu) -> Dropout(0.2) -> Softmax
    """
    inputs = layers.Input(shape=(224, 224, 3), name="flower_image_input")
    aug_layer = get_data_augmentation_layer()
    augmented = aug_layer(inputs)

    base_model = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_tensor=augmented
    )
    base_model.trainable = False

    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(base_model.output)
    x = layers.BatchNormalization(name="head_bn1")(x)
    x = layers.Dropout(0.3, name="head_dropout1")(x)
    x = layers.Dense(96, activation="relu", kernel_regularizer=regularizers.l2(1e-4), name="dense_features")(x)
    x = layers.BatchNormalization(name="head_bn2")(x)
    x = layers.Dropout(0.2, name="head_dropout2")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="flower_classification_head")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="AgroBloom_Flower_MobileNetV2")
    return model, base_model

def train_flower_model(epochs_phase1=4, epochs_phase2=3, batch_size=20):
    print("=" * 60)
    print("AGROBLOOM AI: TRAINING FLOWER DISEASE DETECTION MODEL (MobileNetV2)")
    print("=" * 60)
    start_time = time.time()

    print("[1/5] Loading and preprocessing verified flower dataset splits...")
    X_train, y_train = load_dataset_split(FLOWER_CLASSES, "train", shuffle=True)
    X_val, y_val = load_dataset_split(FLOWER_CLASSES, "val", shuffle=False)
    print(f"  Training samples: {len(X_train)}, Validation samples: {len(X_val)}")
    num_classes = len(FLOWER_CLASSES)
    print(f"  Target Classes ({num_classes}): {FLOWER_CLASSES}")

    print("[2/5] Building MobileNetV2 architecture with custom classification head...")
    model, base_model = build_flower_model(num_classes)

    # Phase 1: Train classification head with frozen backbone
    print("\n[3/5] Phase 1: Training classification head (Backbone Frozen)...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    history_phase1 = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs_phase1,
        batch_size=batch_size,
        verbose=1
    )

    # Phase 2: Fine-tune top layers of base model
    print("\n[4/5] Phase 2: Fine-Tuning Top 20 Layers of MobileNetV2 Backbone...")
    base_model.trainable = True
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    for layer in base_model.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=5e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6)
    ]

    history_phase2 = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs_phase2,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )

    total_time = round(time.time() - start_time, 2)
    print(f"\n[5/5] Training Completed in {total_time} seconds.")

    # Save trained model
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_save_path = os.path.join(MODELS_DIR, "flower_model.keras")
    model.save(model_save_path)
    print(f"  Successfully saved trained flower model to: {model_save_path}")

    # Save training history summary
    history_summary = {
        "model_name": "AgroBloom_Flower_MobileNetV2",
        "num_classes": num_classes,
        "classes": FLOWER_CLASSES,
        "training_samples": int(len(X_train)),
        "validation_samples": int(len(X_val)),
        "training_time_seconds": total_time,
        "final_train_acc": float(history_phase2.history["accuracy"][-1]),
        "final_val_acc": float(history_phase2.history["val_accuracy"][-1]),
        "final_train_loss": float(history_phase2.history["loss"][-1]),
        "final_val_loss": float(history_phase2.history["val_loss"][-1])
    }
    history_path = os.path.join(MODELS_DIR, "flower_training_history.json")
    with open(history_path, "w", encoding="utf-8") as f:
        json.dump(history_summary, f, indent=2)
    print(f"  Exported training history to: {history_path}")

    return model, history_summary

if __name__ == "__main__":
    train_flower_model()

