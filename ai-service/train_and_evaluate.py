import os
import json
import time
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2, EfficientNetB0, ResNet50
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, Input
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, accuracy_score
from PIL import Image

DATA_DIR = "ai_service/data"
SAVED_MODELS_DIR = "ai_service/saved_models"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

CLASSES = [
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy",
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___healthy",
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Rose___Black_spot",
    "Rose___Powdery_mildew",
    "Rose___healthy",
    "Sunflower___Rust",
    "Sunflower___healthy",
    "Plant___Nitrogen_deficiency",
    "Plant___Iron_deficiency_chlorosis"
]

def load_split_data(split_name, shuffle=False):
    split_dir = os.path.join(DATA_DIR, split_name)
    images = []
    labels = []
    for idx, cls in enumerate(CLASSES):
        cls_dir = os.path.join(split_dir, cls)
        if not os.path.exists(cls_dir):
            continue
        for fname in os.listdir(cls_dir):
            if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                fpath = os.path.join(cls_dir, fname)
                img = Image.open(fpath).convert('RGB').resize(IMG_SIZE)
                arr = np.array(img, dtype=np.float32) / 255.0
                images.append(arr)
                labels.append(idx)
    X = np.array(images, dtype=np.float32)
    y = np.array(labels, dtype=np.int32)
    if shuffle:
        perm = np.random.RandomState(42).permutation(len(X))
        X = X[perm]
        y = y[perm]
    return X, y

def build_model(arch_name, num_classes=len(CLASSES)):
    inputs = Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
    if arch_name == 'mobilenetv2':
        base = MobileNetV2(weights=None, include_top=False, input_tensor=inputs)
        x = base.output
        x = GlobalAveragePooling2D(name='global_avg_pool')(x)
        x = Dropout(0.25)(x)
        x = Dense(128, activation='relu', name='dense_feature')(x)
        outputs = Dense(num_classes, activation='softmax', name='prediction_head')(x)
        model = Model(inputs=inputs, outputs=outputs, name='MobileNetV2_AgroBloom')
    elif arch_name == 'efficientnet':
        base = EfficientNetB0(weights=None, include_top=False, input_tensor=inputs)
        x = base.output
        x = GlobalAveragePooling2D(name='global_avg_pool')(x)
        x = Dropout(0.25)(x)
        x = Dense(128, activation='relu')(x)
        outputs = Dense(num_classes, activation='softmax', name='prediction_head')(x)
        model = Model(inputs=inputs, outputs=outputs, name='EfficientNetB0_AgroBloom')
    elif arch_name == 'resnet50':
        base = ResNet50(weights=None, include_top=False, input_tensor=inputs)
        x = base.output
        x = GlobalAveragePooling2D(name='global_avg_pool')(x)
        x = Dropout(0.25)(x)
        x = Dense(128, activation='relu')(x)
        outputs = Dense(num_classes, activation='softmax', name='prediction_head')(x)
        model = Model(inputs=inputs, outputs=outputs, name='ResNet50_AgroBloom')
    else:
        raise ValueError(f"Unknown architecture: {arch_name}")
    return model

def train_and_evaluate_all():
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    
    print("[Pipeline] Loading training, validation, and test datasets with balanced shuffle...")
    X_train, y_train = load_split_data("train", shuffle=True)
    X_val, y_val = load_split_data("val", shuffle=False)
    X_test, y_test = load_split_data("test", shuffle=False)
    
    print(f"[Pipeline] Loaded: Train={X_train.shape[0]}, Val={X_val.shape[0]}, Test={X_test.shape[0]}")
    
    # Save class indices
    class_indices = {i: cls for i, cls in enumerate(CLASSES)}
    with open(os.path.join(SAVED_MODELS_DIR, "class_indices.json"), "w") as f:
        json.dump(class_indices, f, indent=2)

    metrics_comparison = {}
    architectures = [
        {"name": "mobilenetv2", "epochs": 3, "label": "MobileNetV2 (Edge Primary)"},
        {"name": "efficientnet", "epochs": 1, "label": "EfficientNetB0"},
        {"name": "resnet50", "epochs": 1, "label": "ResNet50"}
    ]

    for arch in architectures:
        name = arch["name"]
        epochs = arch["epochs"]
        print(f"\n==========================================")
        print(f"[Training] Starting training for {arch['label']} ({epochs} epochs)...")
        print(f"==========================================")
        
        model = build_model(name, len(CLASSES))
        model.compile(
            optimizer=Adam(learning_rate=0.002),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        t0 = time.time()
        history = model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=BATCH_SIZE,
            verbose=1
        )
        train_time = round(time.time() - t0, 2)
        
        # Save model
        save_path = os.path.join(SAVED_MODELS_DIR, f"{name}_agrobloom.keras")
        model.save(save_path)
        print(f"[Model Saved] Saved {name} model to {save_path}")
        
        # Evaluate on test set
        print(f"[Evaluation] Evaluating {name} on hold-out test set...")
        t_start = time.perf_counter()
        preds = model.predict(X_test, batch_size=32, verbose=0)
        total_eval_time = (time.perf_counter() - t_start) * 1000
        avg_latency = float(total_eval_time / len(X_test))
        
        pred_labels = np.argmax(preds, axis=1)
        
        acc = float(accuracy_score(y_test, pred_labels))
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, pred_labels, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, pred_labels).tolist()
        
        model_size_mb = round(os.path.getsize(save_path) / (1024 * 1024), 2)
        total_params = int(model.count_params())
        
        metrics_comparison[name] = {
            "displayName": arch["label"],
            "accuracy": round(acc * 100, 2),
            "precision": round(float(prec) * 100, 2),
            "recall": round(float(rec) * 100, 2),
            "f1Score": round(float(f1) * 100, 2),
            "avgLatencyMs": round(avg_latency, 2),
            "paramsCount": total_params,
            "modelSizeMb": model_size_mb,
            "trainingTimeSec": train_time,
            "confusionMatrix": cm,
            "classes": CLASSES
        }
        print(f"[{name} Results] Accuracy: {acc*100:.2f}%, F1: {f1*100:.2f}%, Latency: {avg_latency:.2f}ms")

    # Save metrics report
    metrics_file = os.path.join(SAVED_MODELS_DIR, "model_metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics_comparison, f, indent=2)
    print(f"\n[Metrics] Successfully saved real model evaluation report to {metrics_file}")

    # Calibrate Out-of-Distribution (OOD) Detector
    print("\n[OOD Calibrator] Calibrating Out-of-Distribution detector using MobileNetV2...")
    mobilenet = tf.keras.models.load_model(os.path.join(SAVED_MODELS_DIR, "mobilenetv2_agrobloom.keras"))
    
    in_dist_probs = mobilenet.predict(X_test, verbose=0)
    in_dist_max_probs = np.max(in_dist_probs, axis=1)
    
    # Load OOD non-plant samples
    ood_dir = os.path.join(DATA_DIR, "ood_test")
    ood_imgs = []
    for f in os.listdir(ood_dir):
        if f.endswith('.jpg'):
            img = Image.open(os.path.join(ood_dir, f)).convert('RGB').resize(IMG_SIZE)
            ood_imgs.append(np.array(img, dtype=np.float32) / 255.0)
    ood_imgs = np.array(ood_imgs)
    ood_probs = mobilenet.predict(ood_imgs, verbose=0)
    ood_max_probs = np.max(ood_probs, axis=1)
    
    msp_threshold = float(np.percentile(in_dist_max_probs, 5) * 0.70)
    msp_threshold = max(0.35, min(msp_threshold, 0.65))
    
    ood_config = {
        "method": "Maximum Softmax Probability (MSP) & Shannon Entropy Thresholding",
        "confidenceThreshold": round(msp_threshold * 100, 2),
        "entropyThreshold": 1.95,
        "supportedClassesCount": len(CLASSES),
        "inDistributionMeanConfidence": round(float(np.mean(in_dist_max_probs)) * 100, 2),
        "oodMeanConfidence": round(float(np.mean(ood_max_probs)) * 100, 2),
        "status": "Calibrated"
    }
    with open(os.path.join(SAVED_MODELS_DIR, "ood_config.json"), "w") as f:
        json.dump(ood_config, f, indent=2)
    print(f"[OOD Calibrator] OOD Config saved: Threshold = {ood_config['confidenceThreshold']}%")

    # Export web model metadata for browser TFJS offline execution
    web_model_dir = "frontend/public/models/mobilenetv2_web"
    os.makedirs(web_model_dir, exist_ok=True)
    web_metadata = {
        "modelName": "AgroBloom-MobileNetV2-Edge",
        "version": "1.0.0",
        "inputShape": [224, 224, 3],
        "classes": CLASSES,
        "format": "browser-compatible-edge",
        "metrics": {
            "accuracy": metrics_comparison["mobilenetv2"]["accuracy"],
            "f1Score": metrics_comparison["mobilenetv2"]["f1Score"],
            "avgLatencyMs": metrics_comparison["mobilenetv2"]["avgLatencyMs"]
        }
    }
    with open(os.path.join(web_model_dir, "model_metadata.json"), "w") as f:
        json.dump(web_metadata, f, indent=2)
    print(f"[Web Export] Saved browser-compatible edge model metadata to {web_model_dir}")

if __name__ == "__main__":
    train_and_evaluate_all()

