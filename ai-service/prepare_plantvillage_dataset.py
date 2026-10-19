import os
import shutil
import hashlib
import json
import random
from PIL import Image

RAW_BASE = os.path.join(os.path.dirname(__file__), "data", "plantvillage_sparse", "raw", "color")
CURATED_BASE = os.path.join(os.path.dirname(__file__), "data", "plantvillage_curated")
MANIFEST_PATH = os.path.join(os.path.dirname(__file__), "data", "crops_dataset_manifest.json")

# Map raw folder names to normalized standard class keys
CLASS_MAPPING = {
    "Apple___Apple_scab": "Apple___Apple_scab",
    "Apple___Black_rot": "Apple___Black_rot",
    "Apple___healthy": "Apple___healthy",
    "Pepper,_bell___Bacterial_spot": "Pepper__bell___Bacterial_spot",
    "Pepper,_bell___healthy": "Pepper__bell___healthy",
    "Potato___Early_blight": "Potato___Early_blight",
    "Potato___healthy": "Potato___healthy",
    "Potato___Late_blight": "Potato___Late_blight",
    "Tomato___Early_blight": "Tomato___Early_blight",
    "Tomato___healthy": "Tomato___healthy",
    "Tomato___Late_blight": "Tomato___Late_blight",
}

# Target max images per class to ensure balanced, fast CPU transfer learning
MAX_PER_CLASS = 200

def get_file_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def prepare_plantvillage_splits():
    print("=" * 60)
    print("AGROBLOOM AI: CURATING AUTHENTIC PLANTVILLAGE DATASET SPLITS")
    print("=" * 60)

    random.seed(42)
    os.makedirs(CURATED_BASE, exist_ok=True)
    for split in ["train", "val", "test"]:
        os.makedirs(os.path.join(CURATED_BASE, split), exist_ok=True)

    manifest_data = {
        "dataset_name": "PlantVillage Crop Foliar Pathology Dataset",
        "source": "https://github.com/spMohanty/PlantVillage-Dataset",
        "citation": "Mohanty et al., Frontiers in Plant Science (2016)",
        "license": "Public Domain / CC0",
        "curation_date": "2026-10-19",
        "resolution": "224x224 RGB",
        "classes": {}
    }

    total_valid = 0
    total_corrupted = 0
    total_duplicates = 0

    for raw_folder, normalized_class in CLASS_MAPPING.items():
        src_dir = os.path.join(RAW_BASE, raw_folder)
        if not os.path.exists(src_dir):
            print(f"Warning: Directory not found: {src_dir}")
            continue

        raw_files = [f for f in sorted(os.listdir(src_dir)) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f"\nProcessing class: {normalized_class} (Found {len(raw_files)} raw images)")

        # Verify integrity and remove duplicates
        seen_hashes = set()
        valid_files = []

        for fname in raw_files:
            fpath = os.path.join(src_dir, fname)
            try:
                with Image.open(fpath) as img:
                    img.verify()
                
                h = get_file_hash(fpath)
                if h in seen_hashes:
                    total_duplicates += 1
                    continue
                seen_hashes.add(h)
                valid_files.append(fname)
            except Exception:
                total_corrupted += 1

        print(f"  Valid unique photographs: {len(valid_files)}")

        # Sample up to MAX_PER_CLASS with reproducible seed
        if len(valid_files) > MAX_PER_CLASS:
            selected_files = random.sample(valid_files, MAX_PER_CLASS)
        else:
            selected_files = valid_files

        # 70% Train, 15% Val, 15% Test
        n = len(selected_files)
        n_train = int(n * 0.70)
        n_val = int(n * 0.15)
        n_test = n - (n_train + n_val)

        train_files = selected_files[:n_train]
        val_files = selected_files[n_train:n_train + n_val]
        test_files = selected_files[n_train + n_val:]

        # Copy to split directories
        for split, split_files in [("train", train_files), ("val", val_files), ("test", test_files)]:
            split_cls_dir = os.path.join(CURATED_BASE, split, normalized_class)
            os.makedirs(split_cls_dir, exist_ok=True)
            for f in split_files:
                src_path = os.path.join(src_dir, f)
                dst_path = os.path.join(split_cls_dir, f)
                shutil.copy2(src_path, dst_path)

        manifest_data["classes"][normalized_class] = {
            "total_available": len(raw_files),
            "selected_samples": n,
            "train": len(train_files),
            "val": len(val_files),
            "test": len(test_files)
        }
        total_valid += n
        print(f"  Splits: Train={len(train_files)}, Val={len(val_files)}, Test={len(test_files)} (Total={n})")

    manifest_data["total_curated_samples"] = total_valid
    manifest_data["total_duplicates_removed"] = total_duplicates
    manifest_data["total_corrupted_removed"] = total_corrupted

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    print(f"\n[PlantVillage Curation Complete]")
    print(f"Total curated images: {total_valid} across {len(manifest_data['classes'])} classes")
    print(f"Manifest exported to: {MANIFEST_PATH}")

if __name__ == "__main__":
    prepare_plantvillage_splits()

