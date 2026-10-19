import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

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

def create_leaf_canvas(size=(224, 224), bg_color=(235, 238, 230)):
    img = Image.new("RGB", size, bg_color)
    draw = ImageDraw.Draw(img)
    w, h = size
    # Draw oval leaf polygon
    leaf_bbox = [int(w * 0.15), int(h * 0.1), int(w * 0.85), int(h * 0.9)]
    return img, draw, leaf_bbox

def draw_leaf_base(draw, bbox, base_color=(45, 120, 40), vein_color=(60, 150, 50)):
    # Draw organic leaf shape
    draw.ellipse(bbox, fill=base_color, outline=(30, 85, 25), width=2)
    # Draw main central vein
    cx = (bbox[0] + bbox[2]) // 2
    y0 = bbox[1] + 10
    y1 = bbox[3] - 10
    draw.line([(cx, y0), (cx, y1)], fill=vein_color, width=3)
    # Lateral veins
    for y in range(y0 + 20, y1 - 10, 25):
        draw.line([(cx, y), (bbox[0] + 15, y - 12)], fill=vein_color, width=1)
        draw.line([(cx, y), (bbox[2] - 15, y - 12)], fill=vein_color, width=1)

def apply_symptoms(img, draw, bbox, class_name, rng):
    w, h = img.size
    cx = (bbox[0] + bbox[2]) // 2
    cy = (bbox[1] + bbox[3]) // 2

    if "healthy" in class_name:
        # Healthy: pristine leaf, subtle natural gradient
        return

    elif "Early_blight" in class_name:
        # Concentric rings / target board brown/black spots
        num_spots = rng.randint(4, 9)
        for _ in range(num_spots):
            sx = rng.randint(bbox[0] + 25, bbox[2] - 25)
            sy = rng.randint(bbox[1] + 30, bbox[3] - 30)
            rad = rng.randint(10, 22)
            # Outer yellow halo
            draw.ellipse([sx - rad - 4, sy - rad - 4, sx + rad + 4, sy + rad + 4], fill=(185, 175, 45))
            # Dark brown necrotic core
            draw.ellipse([sx - rad, sy - rad, sx + rad, sy + rad], fill=(65, 38, 20))
            # Concentric rings
            draw.ellipse([sx - rad//2, sy - rad//2, sx + rad//2, sy + rad//2], outline=(110, 70, 35), width=2)
            draw.ellipse([sx - 2, sy - 2, sx + 2, sy + 2], fill=(25, 15, 10))

    elif "Late_blight" in class_name:
        # Large water-soaked irregularly shaped dark lesions with pale mold edge
        num_patches = rng.randint(2, 4)
        for _ in range(num_patches):
            px = rng.randint(bbox[0] + 30, bbox[2] - 30)
            py = rng.randint(bbox[1] + 35, bbox[3] - 35)
            rw = rng.randint(25, 45)
            rh = rng.randint(20, 35)
            # Pale mildew halo
            draw.ellipse([px - rw - 5, py - rh - 5, px + rw + 5, py + rh + 5], fill=(170, 180, 160))
            # Dark purplish-brown/black necrotic zone
            draw.ellipse([px - rw, py - rh, px + rw, py + rh], fill=(40, 35, 30))

    elif "Bacterial_spot" in class_name or "Apple_scab" in class_name:
        # Small angular necrotic spots with yellow chlorotic halos
        num_spots = rng.randint(15, 28)
        for _ in range(num_spots):
            sx = rng.randint(bbox[0] + 20, bbox[2] - 20)
            sy = rng.randint(bbox[1] + 25, bbox[3] - 25)
            r = rng.randint(3, 7)
            # Yellow halo
            draw.ellipse([sx - r - 2, sy - r - 2, sx + r + 2, sy + r + 2], fill=(205, 195, 55))
            # Black/brown scab
            draw.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(30, 25, 20))

    elif "Black_rot" in class_name or "Black_spot" in class_name:
        # Distinct round black spots with fringed edges
        num_spots = rng.randint(5, 12)
        for _ in range(num_spots):
            sx = rng.randint(bbox[0] + 20, bbox[2] - 20)
            sy = rng.randint(bbox[1] + 25, bbox[3] - 25)
            r = rng.randint(8, 16)
            # Yellow surrounding zone
            draw.ellipse([sx - r - 3, sy - r - 3, sx + r + 3, sy + r + 3], fill=(190, 180, 50))
            # Black spot
            draw.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(20, 20, 20))

    elif "Powdery_mildew" in class_name:
        # Superficial white/gray talcum powder-like fungal patches
        num_patches = rng.randint(4, 8)
        for _ in range(num_patches):
            px = rng.randint(bbox[0] + 20, bbox[2] - 20)
            py = rng.randint(bbox[1] + 25, bbox[3] - 25)
            r = rng.randint(12, 28)
            draw.ellipse([px - r, py - r, px + r, py + r], fill=(225, 230, 228))

    elif "Rust" in class_name:
        # Bright cinnamon-orange / reddish pustules
        num_pustules = rng.randint(20, 35)
        for _ in range(num_pustules):
            px = rng.randint(bbox[0] + 20, bbox[2] - 20)
            py = rng.randint(bbox[1] + 25, bbox[3] - 25)
            r = rng.randint(3, 6)
            draw.ellipse([px - r, py - r, px + r, py + r], fill=(210, 95, 20))

    elif "Nitrogen_deficiency" in class_name:
        # Uniform pale yellow-green chlorosis
        draw.ellipse([bbox[0] + 10, bbox[1] + 15, bbox[2] - 10, bbox[3] - 15], fill=(175, 195, 65))
        # Faint green veins
        draw.line([(cx, bbox[1] + 15), (cx, bbox[3] - 15)], fill=(130, 165, 45), width=2)

    elif "Iron_deficiency" in class_name:
        # Interveinal chlorosis: intense yellow lamina with dark green veins
        draw.ellipse([bbox[0] + 8, bbox[1] + 12, bbox[2] - 8, bbox[3] - 12], fill=(215, 215, 65))
        draw.line([(cx, bbox[1] + 12), (cx, bbox[3] - 12)], fill=(35, 110, 30), width=4)
        for y in range(bbox[1] + 25, bbox[3] - 15, 20):
            draw.line([(cx, y), (bbox[0] + 15, y - 10)], fill=(35, 110, 30), width=2)
            draw.line([(cx, y), (bbox[2] - 15, y - 10)], fill=(35, 110, 30), width=2)

def generate_sample(class_name, seed):
    rng = np.random.RandomState(seed)
    img, draw, bbox = create_leaf_canvas()
    
    # Base color variation depending on species
    if "Tomato" in class_name:
        base_color = (48, 125, 42)
    elif "Apple" in class_name:
        base_color = (42, 115, 48)
    elif "Pepper" in class_name:
        base_color = (38, 130, 45)
    elif "Potato" in class_name:
        base_color = (52, 120, 38)
    elif "Rose" in class_name:
        base_color = (35, 105, 40)
    elif "Sunflower" in class_name:
        base_color = (65, 140, 45)
    else:
        base_color = (45, 120, 40)
        
    draw_leaf_base(draw, bbox, base_color=base_color)
    apply_symptoms(img, draw, bbox, class_name, rng)
    
    # Apply subtle realistic smoothing and noise
    img = img.filter(ImageFilter.SMOOTH_MORE)
    
    # Add subtle Gaussian camera noise
    arr = np.array(img, dtype=np.float32)
    noise = rng.normal(0, 3.5, arr.shape)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def build_dataset(base_dir="ai_service/data"):
    print("[Dataset] Building structured crop, flower & nutrient dataset...")
    splits = {
        "train": 40,  # 40 samples per class = 720 training samples
        "val": 10,    # 10 samples per class = 180 validation samples
        "test": 10    # 10 samples per class = 180 test samples
    }
    
    total_images = 0
    seed = 1000
    for split, count in splits.items():
        for cls in CLASSES:
            split_cls_dir = os.path.join(base_dir, split, cls)
            os.makedirs(split_cls_dir, exist_ok=True)
            for i in range(count):
                seed += 1
                img = generate_sample(cls, seed)
                img.save(os.path.join(split_cls_dir, f"{cls}_{i:03d}.jpg"), quality=95)
                total_images += 1
                
    # Also generate non-plant Out-Of-Distribution (OOD) test set
    ood_dir = os.path.join(base_dir, "ood_test")
    os.makedirs(ood_dir, exist_ok=True)
    rng = np.random.RandomState(999)
    for i in range(25):
        # Create non-plant geometric patterns, furniture, paper, or random noise
        arr = rng.randint(0, 256, (224, 224, 3), dtype=np.uint8)
        img = Image.fromarray(arr)
        img.save(os.path.join(ood_dir, f"ood_sample_{i:03d}.jpg"))
        
    print(f"[Dataset] Generated {total_images} dataset samples across {len(CLASSES)} classes + OOD samples.")

if __name__ == "__main__":
    build_dataset()

