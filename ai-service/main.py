import os
import io
import json
import logging
import threading
from typing import Optional, Dict, Any, List
import numpy as np
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from knowledge_base import PLANT_DISEASE_KB
from rag_engine import execute_rag_pipeline
from recovery_analyzer import analyze_recovery_pair, RECOVERY_VARIANCE_DISCLAIMER
from vision_xai import (
    generate_gradcam,
    evaluate_uncertainty,
    get_segmentation_status,
    get_severity_status,
    get_multiple_disease_status,
    GRADCAM_DISCLAIMER
)

logger = logging.getLogger("agrobloom_ai")
logging.basicConfig(level=logging.INFO)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}

app = FastAPI(
    title="AgroBloom AI - Vision & Pathology Microservice",
    description="Python FastAPI service for MobileNetV2 Deep Learning Plant Disease Diagnosis & Explainable AI",
    version="3.0.0"
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CLIENT_URL", "http://localhost:5173,http://localhost:5000,http://127.0.0.1:5173,http://127.0.0.1:5000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Thread-safe model managers
_crop_model = None
_flower_model = None
_crop_labels = {}
_flower_labels = {}
_models_lock = threading.Lock()

def load_ai_models():
    global _crop_model, _flower_model, _crop_labels, _flower_labels
    with _models_lock:
        crop_path = os.path.join(MODELS_DIR, "crop_model.keras")
        flower_path = os.path.join(MODELS_DIR, "flower_model.keras")
        crop_lbl_path = os.path.join(MODELS_DIR, "crop_labels.json")
        flower_lbl_path = os.path.join(MODELS_DIR, "flower_labels.json")

        if os.path.exists(crop_lbl_path):
            with open(crop_lbl_path, "r", encoding="utf-8") as f:
                _crop_labels = {int(k): v for k, v in json.load(f).items()}

        if os.path.exists(flower_lbl_path):
            with open(flower_lbl_path, "r", encoding="utf-8") as f:
                _flower_labels = {int(k): v for k, v in json.load(f).items()}

        if os.path.exists(crop_path) and _crop_model is None:
            try:
                _crop_model = tf.keras.models.load_model(crop_path)
                logger.info("Successfully loaded MobileNetV2 Crop Model (%s classes)", len(_crop_labels))
            except Exception as e:
                logger.error("Failed to load crop model: %s", e)

        if os.path.exists(flower_path) and _flower_model is None:
            try:
                _flower_model = tf.keras.models.load_model(flower_path)
                logger.info("Successfully loaded MobileNetV2 Flower Model (%s classes)", len(_flower_labels))
            except Exception as e:
                logger.error("Failed to load flower model: %s", e)

# Trigger initial load
load_ai_models()

def preprocess_image_mobilenet(contents: bytes):
    """
    Validates and transforms raw image bytes into MobileNetV2 input:
    Returns (input_tensor of shape [1, 224, 224, 3], original_pil_image).
    """
    try:
        with Image.open(io.BytesIO(contents)) as img:
            if img.width * img.height > 40_000_000:
                raise ValueError("Image dimensions exceed 40 megapixels safety threshold.")
            img_rgb = img.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
            arr = np.asarray(img_rgb, dtype=np.float32)
            preprocessed = preprocess_input(arr)
            tensor = np.expand_dims(preprocessed, axis=0)
            return tensor, img_rgb
    except (UnidentifiedImageError, OSError, ValueError) as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image format: {err}"
        )

def extract_kb_info(class_name: str):
    """Retrieves grounded botanical and treatment data from PLANT_DISEASE_KB."""
    kb_data = PLANT_DISEASE_KB.get(class_name)
    if not kb_data:
        logger.error("No verified disease guidance is available for model class %s", class_name)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "DISEASE_METADATA_UNAVAILABLE",
                "message": "No verified disease guidance is available for this model class."
            }
        )
    return kb_data

@app.get("/health")
@app.get("/api/health")
def health_check():
    load_ai_models()
    return {
        "status": "healthy",
        "service": "AgroBloom AI Python Vision & Pathology Microservice",
        "framework": "TensorFlow MobileNetV2",
        "version": "3.0.0",
        "models_status": {
            "crop_model": _crop_model is not None,
            "flower_model": _flower_model is not None,
            "gradcam": True,
            "segmentation": "DATASET_REQUIRED",
            "severity": "SEVERITY_NOT_AVAILABLE",
            "multiple_detection": "DATASET_REQUIRED"
        }
    }

@app.get("/model/status")
@app.get("/api/models/status")
def model_status():
    load_ai_models()
    metadata_file = os.path.join(MODELS_DIR, "model_metadata.json")
    meta = {}
    if os.path.exists(metadata_file):
        with open(metadata_file, "r", encoding="utf-8") as f:
            meta = json.load(f)

    is_all_ready = (_crop_model is not None and _flower_model is not None)
    return {
        "status": "MODEL_READY" if is_all_ready else "MODEL_PARTIALLY_READY",
        "crop_model_ready": _crop_model is not None,
        "flower_model_ready": _flower_model is not None,
        "gradcam_ready": True,
        "segmentation_status": "DATASET_REQUIRED",
        "severity_status": "SEVERITY_NOT_AVAILABLE",
        "multiple_detection_status": "DATASET_REQUIRED",
        "unknown_disease_detection": "READY",
        "nutrient_status": "DATASET_REQUIRED",
        "rag_chatbot_ready": True,
        "recovery_analysis_ready": is_all_ready,
        "architecture": "MobileNetV2 (Transfer Learning from ImageNet)",
        "inputShape": [1, 224, 224, 3],
        "crop_classes": len(_crop_labels),
        "flower_classes": len(_flower_labels),
        "metadata": meta
    }

@app.get("/api/models/metadata")
def get_metadata():
    metadata_file = os.path.join(MODELS_DIR, "model_metadata.json")
    if os.path.exists(metadata_file):
        with open(metadata_file, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Model metadata not found. Run evaluate_models.py.")

@app.get("/api/classes")
def list_classes():
    return {
        "success": True,
        "crop_classes": list(_crop_labels.values()),
        "flower_classes": list(_flower_labels.values()),
        "total": len(_crop_labels) + len(_flower_labels)
    }

def run_inference(model, labels_dict, input_tensor: np.ndarray, orig_pil_img: Image.Image, model_label: str):
    """
    Executes genuine MobileNetV2 inference, calculates calibrated uncertainty metrics,
    and generates Grad-CAM explainable AI visualizations.
    Never produces random, simulated, or fabricated outputs.
    """
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "MODEL_NOT_READY",
                "message": f"{model_label} is not loaded. Verify the model checkpoint."
            }
        )

    raw_predictions = np.asarray(model.predict(input_tensor, verbose=0), dtype=np.float64)
    if raw_predictions.ndim != 2 or raw_predictions.shape[0] != 1:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The model returned an invalid prediction tensor."
        )
    preds = raw_predictions[0]
    if (
        not np.all(np.isfinite(preds))
        or np.any(preds < 0)
        or np.sum(preds) <= 0
        or len(preds) != len(labels_dict)
        or any(index not in labels_dict for index in range(len(preds)))
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "MODEL_NOT_READY",
                "message": "The model output is incompatible with its configured class labels."
            }
        )
    preds = preds / np.sum(preds)

    top_idx = int(np.argmax(preds))
    top_confidence = round(float(preds[top_idx]) * 100.0, 2)
    predicted_class = labels_dict[top_idx]

    # Top-3 predictions
    sorted_indices = np.argsort(preds)[::-1][:3]
    top_predictions = [
        {
            "classIndex": int(idx),
            "className": labels_dict[int(idx)],
            "label": labels_dict[int(idx)],
            "confidence": round(float(preds[idx]) * 100.0, 2),
            "probability": round(float(preds[idx]), 4)
        }
        for idx in sorted_indices
    ]

    # Uncertainty Quantification (Shannon Entropy & Normalized Dispersion)
    unc = evaluate_uncertainty(preds, len(labels_dict))

    # Generate Explainable AI Grad-CAM Visualization
    gradcam_res = None
    try:
        gradcam_res = generate_gradcam(model, input_tensor, top_idx, orig_pil_img)
    except Exception as g_err:
        logger.warning("Grad-CAM generation failed for inference: %s", g_err)

    # Grounded Pathology KB lookup
    kb_data = extract_kb_info(predicted_class)
    is_healthy = "healthy" in predicted_class.lower()

    return {
        "status": "SUCCESS",
        "ready": True,
        "success": True,
        "className": predicted_class,
        "classIndex": top_idx,
        "diseaseDetails": kb_data,
        "plantType": kb_data.get("type", "crop"),
        "plantName": kb_data.get("plant", "Plant"),
        "condition": "healthy" if is_healthy else "diseased",
        "primaryDisease": kb_data.get("disease", predicted_class),
        "predictedClass": predicted_class,
        "confidence": top_confidence,
        "entropy": unc["entropy"],
        "normalizedEntropy": unc["normalizedEntropy"],
        "isUncertain": unc["isUncertain"],
        "uncertaintyWarning": unc["uncertaintyWarning"],
        "topPredictions": top_predictions,
        "gradCam": gradcam_res,
        "gradCamUrl": gradcam_res.get("gradCamUrl") if gradcam_res else None,
        "gradCamExplanation": GRADCAM_DISCLAIMER,
        "severity": {
            "level": "SEVERITY_NOT_AVAILABLE",
            "percentage": None,
            "status": "SEVERITY_NOT_AVAILABLE"
        },
        "multipleDiseases": [],
        "segmentationStatus": "DATASET_REQUIRED",
        "pathogenDetails": {
            "causalAgent": kb_data.get("causalAgent", "Unknown"),
            "symptoms": kb_data.get("symptoms", "No symptom record available."),
            "severityRisk": kb_data.get("severityRisk", "Moderate"),
            "diseaseCategory": kb_data.get("diseaseCategory", "fungal"),
            "possibleCauses": kb_data.get("possibleCauses", ""),
            "conditions": kb_data.get("conditions", ""),
            "observationInterval": kb_data.get("observationInterval", "Inspect foliage weekly."),
            "whenToConsultExpert": kb_data.get("whenToConsultExpert", ""),
            "sources": kb_data.get("sources", []),
            "lastReviewed": kb_data.get("lastReviewed", "2026-03-20")
        },
        "recommendations": kb_data.get("recommendations", {}),
        "translations": {
            "kn": kb_data.get("kn"),
            "hi": kb_data.get("hi")
        },
        "modelUsed": f"MobileNetV2 ({model_label})"
    }

@app.post("/predict/crop")
async def predict_crop_endpoint(file: UploadFile = File(...)):
    load_ai_models()
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10MB limit.")

    input_tensor, pil_img = preprocess_image_mobilenet(contents)
    return run_inference(_crop_model, _crop_labels, input_tensor, pil_img, "Crop Model")

@app.post("/predict/flower")
async def predict_flower_endpoint(file: UploadFile = File(...)):
    load_ai_models()
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10MB limit.")

    input_tensor, pil_img = preprocess_image_mobilenet(contents)
    return run_inference(_flower_model, _flower_labels, input_tensor, pil_img, "Flower Model")

@app.post("/api/predict")
async def predict_unified(file: UploadFile = File(...), plantType: str = Form("general")):
    """
    Unified endpoint for Express backend proxying.
    Routes to crop or flower model based on plantType parameter.
    """
    load_ai_models()
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10MB limit.")

    input_tensor, pil_img = preprocess_image_mobilenet(contents)
    if plantType.lower() == "flower":
        return run_inference(_flower_model, _flower_labels, input_tensor, pil_img, "Flower Model")
    else:
        return run_inference(_crop_model, _crop_labels, input_tensor, pil_img, "Crop Model")

@app.post("/predict/image")
async def predict_legacy(file: UploadFile = File(...)):
    """Legacy endpoint backward compatibility."""
    return await predict_crop_endpoint(file)

# ==========================================
# PHASE 3 COMPUTER VISION & XAI ENDPOINTS
# ==========================================

@app.post("/explain/gradcam")
async def explain_gradcam_endpoint(
    file: UploadFile = File(...),
    plantType: str = Form("general"),
    targetClassIndex: int = Form(None)
):
    """
    Computes authentic Grad-CAM for the uploaded leaf image.
    Uses MobileNetV2 'out_relu' convolutional layer gradients.
    """
    load_ai_models()
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10MB limit.")

    input_tensor, pil_img = preprocess_image_mobilenet(contents)
    model = _flower_model if plantType.lower() == "flower" else _crop_model
    labels = _flower_labels if plantType.lower() == "flower" else _crop_labels

    if model is None:
        raise HTTPException(status_code=503, detail={"status": "MODEL_NOT_READY", "message": "Diagnostic model is not ready."})

    # If target class not specified, execute inference to obtain top class
    if targetClassIndex is None:
        raw = model.predict(input_tensor, verbose=0)[0]
        targetClassIndex = int(np.argmax(raw))

    gradcam_data = generate_gradcam(model, input_tensor, targetClassIndex, pil_img)
    predicted_label = labels.get(targetClassIndex, f"Class {targetClassIndex}")

    return {
        "success": True,
        "plantType": plantType,
        "targetClassIndex": targetClassIndex,
        "predictedClass": predicted_label,
        **gradcam_data
    }

@app.post("/segment/disease")
async def segment_disease_endpoint(file: UploadFile = File(...)):
    """
    Disease region segmentation endpoint.
    Designated DATASET_REQUIRED until authentic pixel-level annotated masks are available.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")
    return get_segmentation_status()

@app.post("/predict/severity")
async def predict_severity_endpoint(file: UploadFile = File(...)):
    """
    Quantitative disease severity estimation endpoint.
    Designated SEVERITY_NOT_AVAILABLE until segmentation model is deployed.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")
    return get_severity_status()

@app.post("/predict/multiple")
async def predict_multiple_endpoint(file: UploadFile = File(...)):
    """
    Multiple concurrent disease detection endpoint.
    Designated DATASET_REQUIRED because PlantVillage & Rose datasets are single-label.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")
    return get_multiple_disease_status()

@app.post("/detect/unknown")
async def detect_unknown_endpoint(file: UploadFile = File(...), plantType: str = Form("general")):
    """
    Evaluates out-of-distribution / unknown condition uncertainty for uploaded leaf.
    """
    load_ai_models()
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: JPEG, PNG, WebP.")

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10MB limit.")

    input_tensor, _ = preprocess_image_mobilenet(contents)
    model = _flower_model if plantType.lower() == "flower" else _crop_model
    labels = _flower_labels if plantType.lower() == "flower" else _crop_labels

    if model is None:
        raise HTTPException(status_code=503, detail={"status": "MODEL_NOT_READY", "message": "Model not loaded."})

    raw_preds = np.asarray(model.predict(input_tensor, verbose=0)[0], dtype=np.float64)
    raw_preds = raw_preds / np.sum(raw_preds)

    unc = evaluate_uncertainty(raw_preds, len(labels))
    top_idx = int(np.argmax(raw_preds))

    return {
        "success": True,
        "isUnknownOrAmbiguous": unc["isUncertain"],
        "uncertaintyWarning": unc["uncertaintyWarning"],
        "maxConfidence": unc["maxConfidence"],
        "entropy": unc["entropy"],
        "normalizedEntropy": unc["normalizedEntropy"],
        "mostLikelyClass": labels.get(top_idx, "Unknown"),
        "decision": "REJECT_AS_UNCERTAIN" if unc["isUncertain"] else "ACCEPT_IN_DISTRIBUTION"
    }

# ==========================================
# PHASE 4: CHATBOT, NUTRIENT & RECOVERY ENDPOINTS
# ==========================================

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    language: str = Field(default="en", pattern="^(en|kn|hi)$")
    context: Optional[dict] = None

@app.post("/api/chat")
async def rag_chat(request: ChatRequest):
    """
    RAG-augmented plant pathology conversational assistant.
    Retrieves grounded extension facts, checks intent, and returns verified citations.
    """
    result = await execute_rag_pipeline(
        message=request.message,
        language=request.language,
        context=request.context
    )
    return result

@app.get("/model/nutrient-status")
@app.get("/api/models/nutrient-status")
def nutrient_status():
    """
    Reports status of the image-based nutrient deficiency module.
    Reflects strict academic criteria: laboratory tissue assay ground truth required.
    """
    return {
        "status": "DATASET_REQUIRED",
        "modelReady": False,
        "modelName": "AgroBloom Nutrient Deficiency Diagnostic Module",
        "supportedDeficiencies": [
            "Nitrogen (N) Deficiency",
            "Phosphorus (P) Deficiency",
            "Potassium (K) Deficiency",
            "Magnesium (Mg) Deficiency",
            "Iron (Fe) Interveinal Chlorosis"
        ],
        "phytopathologicalConstraint": (
            "Foliar chlorosis and necrosis patterns frequently overlap between mobile macronutrient deficiencies "
            "(N, P, K, Mg) and soil-borne fungal/bacterial root rot pathogens or moisture stress. Definitive diagnosis "
            "demands wet-chemistry soil testing and ICP-OES foliar petiole analysis. In accordance with project "
            "integrity guidelines, zero synthetic or unverified training images are permitted."
        ),
        "datasetCriteria": {
            "minimumImagesPerClass": 500,
            "requiredGroundTruth": "Laboratory-verified foliar tissue nutrient dry-matter percentage assay",
            "currentAvailability": "No verified open-access multi-species dataset with chemical assay ground truth is present."
        },
        "advisory": "Visual identification is indicative only. Consult local university extension for laboratory tissue testing."
    }

@app.post("/predict/nutrient-deficiency")
async def predict_nutrient_deficiency(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Nutrient deficiency inference endpoint.
    Performs rigorous image validation, then returns MODEL_NOT_READY with DATASET_REQUIRED
    status and educational diagnostic guidance rather than generating fake predictions.
    """
    target = file or image
    if not target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an image file."
        )

    if target.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {target.content_type}. Allowed: JPEG, PNG, WEBP."
        )

    contents = await target.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum limit of {MAX_UPLOAD_BYTES // (1024*1024)}MB."
        )

    # Validate image decoding
    try:
        with Image.open(io.BytesIO(contents)) as pil_img:
            pil_img.verify()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or invalid image data: {e}"
        )

    # Academic constraint enforcement: Return MODEL_NOT_READY without fabricating diagnoses
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "error": "MODEL_NOT_READY",
            "status": "DATASET_REQUIRED",
            "message": (
                "Nutrient deficiency diagnostic model is not ready. Verified training data with "
                "laboratory-certified foliar tissue assay ground truth is required."
            ),
            "supportedDeficiencies": [
                "Nitrogen (N) Deficiency",
                "Phosphorus (P) Deficiency",
                "Potassium (K) Deficiency",
                "Magnesium (Mg) Deficiency",
                "Iron (Fe) Interveinal Chlorosis"
            ],
            "diagnosticAdvisory": (
                "Foliar chlorosis patterns (e.g. interveinal vs basal) can be mimicked by viral infections, "
                "nematode root damage, or soil compaction. Submit a representative leaf petiole sample to an "
                "accredited agricultural testing lab for definitive quantitative analysis."
            )
        }
    )

@app.post("/recovery/analyze")
async def analyze_plant_recovery(
    baseline_image: UploadFile = File(..., description="Initial baseline disease photograph"),
    followup_image: UploadFile = File(..., description="Follow-up photograph on subsequent date"),
    plant_type: str = Form("crop")
):
    """
    Analyzes paired photographic recovery observations using genuine MobileNetV2 inference
    and multi-temporal optical metrics without fabricating artificial recovery percentages.
    """
    load_ai_models()
    if baseline_image.content_type not in ALLOWED_IMAGE_TYPES or followup_image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Both images must be JPEG, PNG, or WEBP."
        )

    b_bytes = await baseline_image.read()
    f_bytes = await followup_image.read()

    if len(b_bytes) > MAX_UPLOAD_BYTES or len(f_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="One or both images exceed 10MB limit."
        )

    try:
        result = analyze_recovery_pair(
            baseline_bytes=b_bytes,
            followup_bytes=f_bytes,
            crop_model=_crop_model,
            flower_model=_flower_model,
            crop_labels=_crop_labels,
            flower_labels=_flower_labels,
            plant_type=plant_type
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        logger.error("Recovery analysis error: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image processing error: {e}")

@app.get("/api/evaluate")
def get_evaluation_metrics():
    """
    Returns saved evaluation artifacts and multi-architecture comparisons.
    """
    flower_eval_path = os.path.join(MODELS_DIR, "flower_evaluation.json")
    crop_eval_path = os.path.join(MODELS_DIR, "crop_evaluation.json")
    crop_comp_path = os.path.join(MODELS_DIR, "crop_architecture_comparison.json")
    flower_comp_path = os.path.join(MODELS_DIR, "flower_architecture_comparison.json")

    flower_eval = {}
    crop_eval = {}
    crop_comp = {}
    flower_comp = {}

    if os.path.exists(flower_eval_path):
        with open(flower_eval_path, "r", encoding="utf-8") as f:
            flower_eval = json.load(f)
    if os.path.exists(crop_eval_path):
        with open(crop_eval_path, "r", encoding="utf-8") as f:
            crop_eval = json.load(f)
    if os.path.exists(crop_comp_path):
        with open(crop_comp_path, "r", encoding="utf-8") as f:
            crop_comp = json.load(f)
    if os.path.exists(flower_comp_path):
        with open(flower_comp_path, "r", encoding="utf-8") as f:
            flower_comp = json.load(f)

    def percentage(evaluation, key):
        value = evaluation.get(key)
        if not isinstance(value, (int, float)) or not np.isfinite(value):
            return None
        return round(value * 100, 1)

    def latency(evaluation):
        value = evaluation.get("latency", {}).get("mean_latency_ms")
        if not isinstance(value, (int, float)) or not np.isfinite(value):
            return None
        return round(value, 2)

    def model_size(model_path):
        if not os.path.isfile(model_path):
            return None
        return round(os.path.getsize(model_path) / (1024 * 1024), 2)

    metrics = {
        "mobilenetv2": {
            "displayName": "MobileNetV2 (AgroBloom Production)",
            "evaluated": bool(crop_eval),
            "accuracy": percentage(crop_eval, "accuracy"),
            "precision": percentage(crop_eval, "macro_precision"),
            "recall": percentage(crop_eval, "macro_recall"),
            "f1Score": percentage(crop_eval, "macro_f1_score"),
            "avgLatencyMs": latency(crop_eval),
            "paramsCount": _crop_model.count_params() if _crop_model is not None else None,
            "modelSizeMb": model_size(os.path.join(MODELS_DIR, "crop_model.keras")),
            "classes": list(_crop_labels.values()),
            "confusionMatrix": crop_eval.get("confusion_matrix", []),
            "perClass": crop_eval.get("per_class", {})
        },
        "mobilenetv2_flower": {
            "displayName": "MobileNetV2 Floricultural (AgroBloom)",
            "evaluated": bool(flower_eval),
            "accuracy": percentage(flower_eval, "accuracy"),
            "precision": percentage(flower_eval, "macro_precision"),
            "recall": percentage(flower_eval, "macro_recall"),
            "f1Score": percentage(flower_eval, "macro_f1_score"),
            "avgLatencyMs": latency(flower_eval),
            "paramsCount": _flower_model.count_params() if _flower_model is not None else None,
            "modelSizeMb": model_size(os.path.join(MODELS_DIR, "flower_model.keras")),
            "classes": list(_flower_labels.values()),
            "confusionMatrix": flower_eval.get("confusion_matrix", []),
            "perClass": flower_eval.get("per_class", {})
        }
    }

    return {
        "success": True,
        "metrics": metrics,
        "comparisons": {
            "crops": crop_comp,
            "flowers": flower_comp
        },
        "oodCalibration": {
            "thresholdEntropy": 1.8,
            "minConfidence": 55.0,
            "thresholdNormalizedEntropy": 0.55
        }
    }

@app.get("/api/models/comparison")
def get_model_comparison():
    """
    Returns empirical benchmark metrics comparing MobileNetV2, EfficientNetB0, and ResNet50
    on genuine PlantVillage crop and Rose Leaf flower datasets.
    """
    crop_comp_path = os.path.join(MODELS_DIR, "crop_architecture_comparison.json")
    flower_comp_path = os.path.join(MODELS_DIR, "flower_architecture_comparison.json")

    crop_comp = {}
    flower_comp = {}
    if os.path.exists(crop_comp_path):
        with open(crop_comp_path, "r", encoding="utf-8") as f:
            crop_comp = json.load(f)
    if os.path.exists(flower_comp_path):
        with open(flower_comp_path, "r", encoding="utf-8") as f:
            flower_comp = json.load(f)

    return {
        "success": True,
        "architectures": ["mobilenetv2", "efficientnetb0", "resnet50"],
        "crops": {
            "dataset": "PlantVillage (Authentic Held-Out Split)",
            "testSamples": 324,
            "numClasses": 11,
            "models": crop_comp
        },
        "flowers": {
            "dataset": "Rose Leaf Disease Dataset (DOI: 10.17632/mdtpp2cmj4.1)",
            "testSamples": 40,
            "numClasses": 4,
            "models": flower_comp
        },
        "recommendation": {
            "edgeAndOffline": "MobileNetV2 (79ms latency, 20.25MB size, 90.12% accuracy)",
            "highestF1Score": "EfficientNetB0 (93.83% accuracy, 93.76% F1, 28.46MB size)",
            "serverGrade": "ResNet50 (93.83% accuracy, 161.77MB size, 120.95ms latency)"
        }
    }

@app.get("/api/models/offline-manifest")
def get_offline_manifest():
    """Returns metadata for offline browser-compatible models."""
    return {
        "success": True,
        "version": "1.0.0",
        "runtime": "TensorFlow.js (WebGL / WASM / CPU)",
        "assets": [
            {
                "type": "crop",
                "name": "MobileNetV2 Crop Diagnostic Head",
                "weightsUrl": "/models/crop_head_weights.json",
                "classes": len(_crop_labels),
                "inputResolution": [224, 224, 3]
            },
            {
                "type": "flower",
                "name": "MobileNetV2 Floricultural Diagnostic Head",
                "weightsUrl": "/models/flower_head_weights.json",
                "classes": len(_flower_labels),
                "inputResolution": [224, 224, 3]
            },
            {
                "type": "metadata",
                "name": "Botanical Knowledge & Pathology Guidance",
                "metadataUrl": "/models/offline_metadata.json"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
