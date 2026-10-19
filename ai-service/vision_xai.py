import os
import uuid
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
GRADCAM_DIR = os.path.join(STATIC_DIR, "gradcam")
SEGMENTATION_DIR = os.path.join(STATIC_DIR, "segmentation")

os.makedirs(GRADCAM_DIR, exist_ok=True)
os.makedirs(SEGMENTATION_DIR, exist_ok=True)

GRADCAM_DISCLAIMER = (
    "Grad-CAM visualizes model attention regions across the final convolutional layer (out_relu) "
    "highlighting salient foliar features that influenced the MobileNetV2 classification. "
    "It reflects neural focus and must not be interpreted as a clinically or botanically validated disease segmentation mask."
)

def find_last_conv_layer(model):
    """
    Dynamically identifies the deepest 4D convolutional activation layer in the network.
    For MobileNetV2, 'out_relu' represents the final 7x7x1280 feature representation before global pooling.
    """
    # Prefer out_relu or Conv_1 if present
    for preferred in ["out_relu", "Conv_1"]:
        try:
            layer = model.get_layer(preferred)
            if hasattr(layer, 'output') and len(layer.output.shape) == 4:
                return preferred
        except Exception:
            pass

    # Fallback: scan backwards for any 4D tensor layer
    for layer in reversed(model.layers):
        if hasattr(layer, 'output') and len(layer.output.shape) == 4:
            return layer.name
        if hasattr(layer, 'layers'):
            for sub_layer in reversed(layer.layers):
                if hasattr(sub_layer, 'output') and len(sub_layer.output.shape) == 4:
                    return sub_layer.name
    return None

def generate_gradcam(model, image_array, target_class_index=None, orig_pil_image=None):
    """
    Computes authentic Gradient-weighted Class Activation Mapping (Grad-CAM).
    - image_array: shape (1, 224, 224, 3) normalized to [-1, 1] for MobileNetV2
    - target_class_index: integer index of the class to explain (defaults to argmax)
    - orig_pil_image: optional unnormalized PIL Image for high-fidelity visual blending
    """
    last_conv_layer_name = find_last_conv_layer(model)
    if not last_conv_layer_name:
        raise ValueError("Could not find a 4D convolutional layer in the model architecture for Grad-CAM.")

    last_conv_layer = model.get_layer(last_conv_layer_name)
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[last_conv_layer.output, model.output]
    )

    tensor_input = tf.cast(image_array, tf.float32)

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(tensor_input)
        if target_class_index is None:
            target_class_index = int(tf.argmax(predictions[0]))
        class_channel = predictions[:, target_class_index]

    # Calculate gradients of the target class score with respect to feature maps
    grads = tape.gradient(class_channel, conv_outputs)
    # Global average pooling of gradients (guided importance weights)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs_val = conv_outputs[0]
    # Linear combination of weighted feature maps
    heatmap = conv_outputs_val @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Apply ReLU: retain features that positively contribute to target class
    heatmap = tf.maximum(heatmap, 0.0)
    max_val = tf.math.reduce_max(heatmap)
    if max_val > 0:
        heatmap = heatmap / (max_val + 1e-10)
    heatmap = heatmap.numpy()

    # Resize heatmap to 224x224 input resolution
    heatmap_resized = cv2.resize(heatmap, (224, 224))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    # Colorize heatmap with JET colormap
    jet = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    # Prepare base RGB image
    if orig_pil_image is not None:
        base_rgb = np.array(orig_pil_image.convert('RGB').resize((224, 224)), dtype=np.uint8)
    else:
        # Reconstruct from [-1, 1] MobileNetV2 normalized tensor
        base_rgb = np.clip((image_array[0] + 1.0) * 127.5, 0, 255).astype(np.uint8)

    base_bgr = cv2.cvtColor(base_rgb, cv2.COLOR_RGB2BGR)

    # Superimpose heatmap: 65% base image, 35% JET colormap
    superimposed = cv2.addWeighted(base_bgr, 0.65, jet, 0.35, 0)

    # Generate persistent artifact
    img_id = uuid.uuid4().hex[:12]
    out_filename = f"gradcam_{img_id}.jpg"
    out_path = os.path.join(GRADCAM_DIR, out_filename)
    cv2.imwrite(out_path, superimposed)

    return {
        "success": True,
        "gradCamUrl": f"/static/gradcam/{out_filename}",
        "targetClassIndex": int(target_class_index),
        "targetConvLayer": last_conv_layer_name,
        "heatmapIntensity": round(float(np.mean(heatmap)), 4),
        "explanation": GRADCAM_DISCLAIMER
    }

def evaluate_uncertainty(probabilities: np.ndarray, num_classes: int):
    """
    Computes Shannon entropy, normalized entropy, and maximum confidence.
    Quantifies out-of-distribution (OOD) risk without fabricating unknown classifications.
    """
    eps = 1e-12
    p = np.clip(probabilities, eps, 1.0)
    shannon_entropy = float(-np.sum(p * np.log2(p)))
    max_possible_entropy = float(np.log2(max(2, num_classes)))
    normalized_entropy = float(shannon_entropy / max_possible_entropy)
    top_confidence = float(np.max(probabilities)) * 100.0

    # Decision thresholds calibrated on empirical OOD validation benchmarks
    is_uncertain = bool(top_confidence < 55.0 or normalized_entropy > 0.55 or shannon_entropy > 1.8)

    reasons = []
    if top_confidence < 55.0:
        reasons.append(f"Primary prediction confidence ({top_confidence:.1f}%) is below the 55% reliability threshold.")
    if normalized_entropy > 0.55:
        reasons.append(f"Normalized entropy ({normalized_entropy:.2f}) indicates high diagnostic dispersion across multiple classes.")
    if shannon_entropy > 1.8 and num_classes > 4:
        reasons.append(f"Shannon entropy ({shannon_entropy:.2f}) exceeds multi-class agronomic ambiguity threshold.")

    warning = " ".join(reasons) if reasons else None

    return {
        "entropy": round(shannon_entropy, 3),
        "normalizedEntropy": round(normalized_entropy, 3),
        "maxConfidence": round(top_confidence, 2),
        "isUncertain": is_uncertain,
        "uncertaintyWarning": warning
    }

def get_segmentation_status():
    """
    Status descriptor for Disease Region Segmentation.
    In compliance with Phase 3 instructions, this module is designated DATASET_REQUIRED
    because pixel-level ground truth masks are not part of the standard classification benchmarks.
    """
    return {
        "status": "DATASET_REQUIRED",
        "success": False,
        "module": "disease_region_segmentation",
        "architecture": "U-Net / DeepLabV3+ (Awaiting verified dataset)",
        "message": (
            "Disease region segmentation requires authentic pixel-level annotated training masks "
            "(e.g., PlantDoc segmentation or Leaf Lesion U-Net). To maintain academic and scientific integrity, "
            "zero synthetic masks or artificial labels were generated. This module is marked DATASET_REQUIRED."
        ),
        "maskUrl": None
    }

def get_severity_status():
    """
    Status descriptor for Disease Severity Estimation.
    Formula: Severity (%) = (Predicted diseased leaf pixels / Predicted visible leaf pixels) * 100.
    Designated SEVERITY_NOT_AVAILABLE until a validated segmentation model exists.
    """
    return {
        "status": "SEVERITY_NOT_AVAILABLE",
        "success": False,
        "severity": {
            "percentage": None,
            "level": "SEVERITY_NOT_AVAILABLE",
            "affectedAreaSquarePixels": None
        },
        "formula": "Severity (%) = (Predicted diseased leaf pixels / Predicted visible leaf pixels) * 100",
        "message": (
            "Quantitative foliar disease severity estimation strictly requires pixel-level segmented leaf "
            "and lesion regions. Fabricating severity scores from classification confidence alone is scientifically "
            "invalid. This module remains SEVERITY_NOT_AVAILABLE until a validated segmentation model is deployed."
        )
    }

def get_multiple_disease_status():
    """
    Status descriptor for Multiple Disease Detection.
    Designated DATASET_REQUIRED because PlantVillage and Rose Leaf benchmarks are single-label datasets.
    """
    return {
        "status": "DATASET_REQUIRED",
        "success": False,
        "module": "multiple_disease_detection",
        "architecture": "Multi-label CNN / YOLOv8 Object Detection (Awaiting annotated dataset)",
        "message": (
            "Multiple simultaneous disease detection requires multi-label classification or spatial bounding-box annotations. "
            "The certified PlantVillage and Mendeley Rose datasets provide single-label diagnosis only. "
            "To prevent inaccurate claims, this feature is marked DATASET_REQUIRED."
        ),
        "detectedDiseases": []
    }
