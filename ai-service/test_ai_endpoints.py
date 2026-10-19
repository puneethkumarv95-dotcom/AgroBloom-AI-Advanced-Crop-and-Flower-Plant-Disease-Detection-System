import io
import os
import pytest
from fastapi.testclient import TestClient
from PIL import Image

import main
from main import MAX_UPLOAD_BYTES, app

client = TestClient(app)

def create_sample_png():
    image = Image.new("RGB", (224, 224), color=(42, 115, 53))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "models_status" in data
    assert client.get("/api/health").status_code == 200

def test_model_status():
    response = client.get("/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "crop_model_ready" in data
    assert "flower_model_ready" in data
    assert data["gradcam_ready"] is True
    assert data["segmentation_status"] == "DATASET_REQUIRED"
    assert data["severity_status"] == "SEVERITY_NOT_AVAILABLE"
    assert data["multiple_detection_status"] == "DATASET_REQUIRED"

def test_model_class_catalog():
    response = client.get("/api/classes")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "crop_classes" in data
    assert "flower_classes" in data
    assert len(data["crop_classes"]) == 11
    assert len(data["flower_classes"]) == 4

@pytest.mark.parametrize(
    ("message", "language", "expected_text"),
    [
        ("What is the organic treatment for Tomato Early Blight?", "en", "Alternaria solani"),
        ("ಟೊಮೆಟೊ ರೋಗ ಪರಿಹಾರ", "kn", "ಟೊಮೆಟೊ"),
        ("टमाटर की बीमारी", "hi", "टमाटर"),
        ("Rose black spot cure", "en", "Diplocarpon rosae"),
    ],
)
def test_grounded_chat(message, language, expected_text):
    response = client.post("/api/chat", json={"message": message, "language": language})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert expected_text in data["reply"]
    assert data["groundedData"] is not None

def test_predict_crop_real_inference():
    png_data = create_sample_png()
    response = client.post(
        "/predict/crop",
        files={"file": ("leaf.png", png_data, "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "predictedClass" in data
    assert "confidence" in data
    assert 0 <= data["confidence"] <= 100
    assert len(data["topPredictions"]) == 3
    assert "pathogenDetails" in data
    assert "recommendations" in data
    assert "gradCamUrl" in data
    assert "gradCamExplanation" in data

def test_predict_flower_real_inference():
    png_data = create_sample_png()
    response = client.post(
        "/predict/flower",
        files={"file": ("flower.png", png_data, "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "predictedClass" in data
    assert "confidence" in data
    assert 0 <= data["confidence"] <= 100
    assert len(data["topPredictions"]) == 3
    assert "pathogenDetails" in data
    assert "recommendations" in data
    assert "gradCamUrl" in data

def test_unified_predict_endpoint():
    png_data = create_sample_png()
    res_crop = client.post(
        "/api/predict",
        data={"plantType": "crop"},
        files={"file": ("crop.png", png_data, "image/png")}
    )
    assert res_crop.status_code == 200
    assert res_crop.json()["success"] is True
    assert "gradCamUrl" in res_crop.json()

    res_flower = client.post(
        "/api/predict",
        data={"plantType": "flower"},
        files={"file": ("flower.png", png_data, "image/png")}
    )
    assert res_flower.status_code == 200
    assert res_flower.json()["success"] is True
    assert "gradCamUrl" in res_flower.json()

def test_explain_gradcam_endpoint():
    png_data = create_sample_png()
    res = client.post(
        "/explain/gradcam",
        data={"plantType": "crop"},
        files={"file": ("leaf.png", png_data, "image/png")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "gradCamUrl" in data
    assert "targetConvLayer" in data
    assert "explanation" in data
    assert "out_relu" in data["targetConvLayer"] or "Conv_1" in data["targetConvLayer"]

def test_segment_disease_dataset_required():
    png_data = create_sample_png()
    res = client.post(
        "/segment/disease",
        files={"file": ("leaf.png", png_data, "image/png")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "DATASET_REQUIRED"
    assert data["success"] is False
    assert "U-Net" in data["architecture"]

def test_predict_severity_not_available():
    png_data = create_sample_png()
    res = client.post(
        "/predict/severity",
        files={"file": ("leaf.png", png_data, "image/png")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SEVERITY_NOT_AVAILABLE"
    assert data["success"] is False
    assert data["severity"]["level"] == "SEVERITY_NOT_AVAILABLE"

def test_predict_multiple_dataset_required():
    png_data = create_sample_png()
    res = client.post(
        "/predict/multiple",
        files={"file": ("leaf.png", png_data, "image/png")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "DATASET_REQUIRED"
    assert data["success"] is False

def test_detect_unknown_endpoint():
    png_data = create_sample_png()
    res = client.post(
        "/detect/unknown",
        data={"plantType": "crop"},
        files={"file": ("leaf.png", png_data, "image/png")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "isUnknownOrAmbiguous" in data
    assert "entropy" in data
    assert "normalizedEntropy" in data
    assert "decision" in data

def test_evaluation_benchmark_endpoint():
    response = client.get("/api/evaluate")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "mobilenetv2" in data["metrics"]
    assert "mobilenetv2_flower" in data["metrics"]
    assert data["metrics"]["mobilenetv2"]["accuracy"] > 0

def test_missing_evaluation_artifacts_do_not_return_estimated_scores(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "MODELS_DIR", str(tmp_path))
    response = client.get("/api/evaluate")
    assert response.status_code == 200
    metrics = response.json()["metrics"]
    assert metrics["mobilenetv2"]["accuracy"] is None
    assert metrics["mobilenetv2"]["precision"] is None
    assert metrics["mobilenetv2"]["avgLatencyMs"] is None
    assert metrics["mobilenetv2"]["evaluated"] is False
    assert metrics["mobilenetv2_flower"]["accuracy"] is None
    assert metrics["mobilenetv2_flower"]["evaluated"] is False

def test_all_configured_model_classes_have_grounded_knowledge():
    for class_name in [*main._crop_labels.values(), *main._flower_labels.values()]:
        assert main.extract_kb_info(class_name) is main.PLANT_DISEASE_KB[class_name]

def test_predict_rejects_unsupported_content_type():
    response = client.post(
        "/predict/crop",
        files={"file": ("leaf.gif", b"GIF89a", "image/gif")},
    )
    assert response.status_code == 400

def test_predict_rejects_corrupted_image_content():
    response = client.post(
        "/predict/image",
        files={"file": ("leaf.png", b"not actually a PNG", "image/png")},
    )
    assert response.status_code == 400

def test_predict_rejects_oversized_upload():
    response = client.post(
        "/predict/crop",
        files={"file": ("large.png", b"x" * (MAX_UPLOAD_BYTES + 1), "image/png")},
    )
    assert response.status_code == 413

def test_missing_model_returns_model_not_ready(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "MODELS_DIR", str(tmp_path))
    monkeypatch.setattr(main, "_crop_model", None)
    response = client.post(
        "/predict/image",
        files={"file": ("leaf.png", create_sample_png(), "image/png")},
    )
    assert response.status_code == 503
    assert response.json()["detail"]["status"] == "MODEL_NOT_READY"

def test_nutrient_deficiency_status():
    response = client.get("/model/nutrient-status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "DATASET_REQUIRED"
    assert data["modelReady"] is False
    assert len(data["supportedDeficiencies"]) == 5

def test_nutrient_deficiency_prediction_returns_model_not_ready():
    png_data = create_sample_png()
    response = client.post(
        "/predict/nutrient-deficiency",
        files={"image": ("leaf.png", png_data, "image/png")}
    )
    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["status"] == "DATASET_REQUIRED"
    assert detail["error"] == "MODEL_NOT_READY"
    assert "diagnosticAdvisory" in detail

def test_recovery_analyze_endpoint():
    img1 = create_sample_png()
    img2 = create_sample_png()
    response = client.post(
        "/recovery/analyze",
        files={
            "baseline_image": ("base.png", img1, "image/png"),
            "followup_image": ("follow.png", img2, "image/png")
        },
        data={"plant_type": "crop"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "symptomStatus" in data
    assert "trendSummary" in data
    assert "baseline" in data
    assert "followup" in data
    assert "visualMetrics" in data
    assert "varianceWarning" in data

def test_rag_chat_admits_uncertainty_for_unsupported_query():
    response = client.post(
        "/api/chat",
        json={"message": "What is the stock market price of bitcoin?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["isUncertain"] is True
    assert "Reliable verified extension guidance is unavailable" in data["reply"]

def test_model_comparison_endpoint():
    response = client.get("/api/models/comparison")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "mobilenetv2" in data["architectures"]
    assert "efficientnetb0" in data["architectures"]
    assert "resnet50" in data["architectures"]
    assert "crops" in data
    assert "flowers" in data
    assert "recommendation" in data
    assert len(data["crops"]["models"]) == 3
    assert len(data["flowers"]["models"]) == 3

def test_offline_manifest_endpoint():
    response = client.get("/api/models/offline-manifest")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "version" in data
    assert "assets" in data
    assert len(data["assets"]) >= 3

def test_evaluate_endpoint_includes_comparisons():
    response = client.get("/api/evaluate")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "metrics" in data
    assert "comparisons" in data


