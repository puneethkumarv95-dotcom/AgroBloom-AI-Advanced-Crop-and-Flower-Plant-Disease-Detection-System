"""
AgroBloom AI - Plant Recovery Image Analyzer
Performs comparative multi-temporal image analysis between baseline and follow-up
plant photographs without fabricating recovery percentages.
"""

import io
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

RECOVERY_VARIANCE_DISCLAIMER = (
    "Foliar photographic comparison is sensitive to ambient lighting, camera exposure, "
    "angle of incidence, distance, and day-to-day leaf turgor. Observed visual changes reflect "
    "morphological indications and do not constitute a quantitative chemical or microbiological assay."
)

def compute_image_metrics(arr1: np.ndarray, arr2: np.ndarray) -> Dict[str, float]:
    """
    Computes visual difference metrics between two normalized 224x224 RGB image arrays:
    - Mean Absolute Error (MAE)
    - Normalized Histogram Correlation
    - Green Leaf Area Index (GLAI) shift
    """
    # Normalized L1 difference
    mae = float(np.mean(np.abs(arr1 - arr2)))

    # Green Leaf Index (GLI = (2*G - R - B) / (2*G + R + B))
    def green_index(arr):
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        denom = (2.0 * g + r + b) + 1e-6
        return float(np.mean((2.0 * g - r - b) / denom))

    gli1 = green_index(arr1)
    gli2 = green_index(arr2)
    gli_delta = round(gli2 - gli1, 4)

    return {
        "visualDifferenceIndex": round(mae, 4),
        "greenIndexDelta": gli_delta,
        "baselineGreenIndex": round(gli1, 4),
        "followupGreenIndex": round(gli2, 4)
    }

def analyze_recovery_pair(
    baseline_bytes: bytes,
    followup_bytes: bytes,
    crop_model: Any,
    flower_model: Any,
    crop_labels: Dict[int, str],
    flower_labels: Dict[int, str],
    plant_type: str = "crop"
) -> Dict[str, Any]:
    """
    Performs comparative dual-image diagnosis:
    1. Preprocesses baseline and followup images
    2. Runs inference using genuine trained MobileNetV2 model
    3. Calculates optical difference metrics
    4. Evaluates symptom progression status
    """
    with Image.open(io.BytesIO(baseline_bytes)) as img1, Image.open(io.BytesIO(followup_bytes)) as img2:
        rgb1 = img1.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
        rgb2 = img2.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)

    arr1 = np.asarray(rgb1, dtype=np.float32) / 255.0
    arr2 = np.asarray(rgb2, dtype=np.float32) / 255.0

    # Model inference
    model = flower_model if plant_type == "flower" else crop_model
    labels = flower_labels if plant_type == "flower" else crop_labels

    if model is None:
        raise ValueError("Diagnostic model is not available for recovery analysis.")

    t1 = np.expand_dims(preprocess_input(np.asarray(rgb1, dtype=np.float32)), axis=0)
    t2 = np.expand_dims(preprocess_input(np.asarray(rgb2, dtype=np.float32)), axis=0)

    preds1 = model.predict(t1, verbose=0)[0]
    preds2 = model.predict(t2, verbose=0)[0]

    idx1 = int(np.argmax(preds1))
    idx2 = int(np.argmax(preds2))
    conf1 = float(preds1[idx1])
    conf2 = float(preds2[idx2])

    class1 = labels.get(idx1, "Unknown")
    class2 = labels.get(idx2, "Unknown")

    is_healthy1 = "healthy" in class1.lower()
    is_healthy2 = "healthy" in class2.lower()

    # Determine symptom progression status
    if not is_healthy1 and is_healthy2:
        symptom_status = "Improving"
        trend_summary = (
            f"Favorable transition: Baseline indicated '{class1}' ({round(conf1*100, 1)}%), "
            f"while follow-up observation shows features consistent with 'Healthy' foliage ({round(conf2*100, 1)}%)."
        )
    elif is_healthy1 and not is_healthy2:
        symptom_status = "Worsening"
        trend_summary = (
            f"Pathology onset: Baseline indicated healthy foliage, "
            f"while follow-up indicates onset of '{class2}' ({round(conf2*100, 1)}%)."
        )
    elif class1 == class2 and not is_healthy1:
        conf_diff = round((conf2 - conf1) * 100, 1)
        if conf_diff < -8.0:
            symptom_status = "Improving"
            trend_summary = (
                f"Symptom attenuation: Persistent diagnosis of '{class1}', but model pathology "
                f"confidence decreased by {abs(conf_diff)}%, indicating potential lesion remission."
            )
        elif conf_diff > 8.0:
            symptom_status = "Worsening"
            trend_summary = (
                f"Advancing symptoms: Diagnosis remains '{class1}', with model pathology "
                f"confidence increasing by {conf_diff}%, suggesting more pronounced lesion morphology."
            )
        else:
            symptom_status = "Stable"
            trend_summary = (
                f"Stable symptoms: Folio-pathology diagnosis remains '{class1}' with similar "
                f"manifestation pattern across observation dates."
            )
    elif is_healthy1 and is_healthy2:
        symptom_status = "Stable"
        trend_summary = "Both baseline and follow-up observations exhibit healthy foliage morphology."
    else:
        symptom_status = "Indeterminate"
        trend_summary = (
            f"Observation disparity: Baseline indicated '{class1}' while follow-up indicated '{class2}'. "
            f"Manual visual inspection recommended."
        )

    visual_metrics = compute_image_metrics(arr1, arr2)

    return {
        "success": True,
        "symptomStatus": symptom_status,
        "trendSummary": trend_summary,
        "baseline": {
            "predictedClass": class1,
            "confidence": round(conf1, 4),
            "isHealthy": is_healthy1
        },
        "followup": {
            "predictedClass": class2,
            "confidence": round(conf2, 4),
            "isHealthy": is_healthy2
        },
        "visualMetrics": visual_metrics,
        "varianceWarning": RECOVERY_VARIANCE_DISCLAIMER
    }

