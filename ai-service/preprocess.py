import os
import json
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# 11 Verified PlantVillage Crop Classes
CROP_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___healthy",
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___healthy",
    "Potato___Late_blight",
    "Tomato___Early_blight",
    "Tomato___healthy",
    "Tomato___Late_blight"
]

# 4 Genuine Rose Leaf Disease Classes (Mendeley Data DOI: 10.17632/mdtpp2cmj4.1)
FLOWER_CLASSES = [
    "Rose___Black_spot",
    "Rose___Downy_mildew",
    "Rose___healthy",
    "Rose___Insect_infested"
]

def export_label_mappings():
    crop_labels = {i: cls for i, cls in enumerate(CROP_CLASSES)}
    flower_labels = {i: cls for i, cls in enumerate(FLOWER_CLASSES)}

    crop_labels_path = os.path.join(MODELS_DIR, "crop_labels.json")
    flower_labels_path = os.path.join(MODELS_DIR, "flower_labels.json")

    with open(crop_labels_path, "w", encoding="utf-8") as f:
        json.dump(crop_labels, f, indent=2)

    with open(flower_labels_path, "w", encoding="utf-8") as f:
        json.dump(flower_labels, f, indent=2)

    print(f"[Preprocessing] Exported crop labels ({len(crop_labels)} classes) -> {crop_labels_path}")
    print(f"[Preprocessing] Exported flower labels ({len(flower_labels)} classes) -> {flower_labels_path}")

def load_dataset_split(classes, split_name, base_dir=None, shuffle=False):
    """
    Loads images for specified classes from base_dir/<split_name>/<class_name>,
    converts to RGB, resizes to 224x224, and applies MobileNetV2 preprocess_input [-1, 1].
    """
    if base_dir is None:
        # Auto-select based on classes
        if classes == CROP_CLASSES:
            curated_crop = os.path.join(DATA_DIR, "plantvillage_curated")
            base_dir = curated_crop if os.path.exists(curated_crop) else DATA_DIR
        else:
            rose_dir = os.path.join(DATA_DIR, "rose_curated")
            base_dir = rose_dir if os.path.exists(rose_dir) else DATA_DIR

    split_dir = os.path.join(base_dir, split_name)
    images = []
    labels = []

    for idx, cls in enumerate(classes):
        cls_dir = os.path.join(split_dir, cls)
        if not os.path.exists(cls_dir):
            continue

        for fname in sorted(os.listdir(cls_dir)):
            if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                fpath = os.path.join(cls_dir, fname)
                try:
                    with Image.open(fpath) as img:
                        img_rgb = img.convert('RGB').resize((224, 224), Image.Resampling.BILINEAR)
                        arr = np.array(img_rgb, dtype=np.float32)
                        norm = preprocess_input(arr)
                        images.append(norm)
                        labels.append(idx)
                except Exception as e:
                    print(f"Warning: skipped {fpath}: {e}")

    X = np.array(images, dtype=np.float32)
    y = np.array(labels, dtype=np.int32)

    if shuffle and len(X) > 0:
        perm = np.random.RandomState(42).permutation(len(X))
        X = X[perm]
        y = y[perm]

    return X, y

def get_data_augmentation_layer():
    """
    Standard data augmentation pipeline strictly applied to training batches only.
    """
    return tf.keras.Sequential([
        tf.keras.layers.RandomRotation(0.15, fill_mode='nearest'),
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomZoom(0.1, fill_mode='nearest'),
        tf.keras.layers.RandomTranslation(0.08, 0.08, fill_mode='nearest'),
        tf.keras.layers.RandomContrast(0.1)
    ], name="training_data_augmentation")

if __name__ == "__main__":
    export_label_mappings()
    print("\n[Preprocessing] Testing authentic PlantVillage crop dataset loading...")
    X_train_c, y_train_c = load_dataset_split(CROP_CLASSES, "train", shuffle=True)
    X_val_c, y_val_c = load_dataset_split(CROP_CLASSES, "val", shuffle=False)
    X_test_c, y_test_c = load_dataset_split(CROP_CLASSES, "test", shuffle=False)
    print(f"  Crop Splits: Train={X_train_c.shape}, Val={X_val_c.shape}, Test={X_test_c.shape}")
