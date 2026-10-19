import os
import json
import time
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, accuracy_score
from preprocess import CROP_CLASSES, FLOWER_CLASSES, load_dataset_split, MODELS_DIR

def compute_detailed_metrics(y_true, y_pred, classes):
    """
    Computes real Multi-class Accuracy, Precision, Recall/Sensitivity, Specificity (One-vs-Rest),
    F1-score, and Confusion Matrix.
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec, rec, f1, support = precision_recall_fscore_support(y_true, y_pred, labels=list(range(len(classes))), zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(classes))))

    # Specificity One-vs-Rest: TN / (TN + FP)
    per_class_metrics = {}
    specificities = []
    for i, cls in enumerate(classes):
        tp = cm[i, i]
        fp = cm[:, i].sum() - tp
        fn = cm[i, :].sum() - tp
        tn = cm.sum() - (tp + fp + fn)

        spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
        specificities.append(spec)

        per_class_metrics[cls] = {
            "class_index": i,
            "precision": round(float(prec[i]), 4),
            "recall_sensitivity": round(float(rec[i]), 4),
            "specificity": round(spec, 4),
            "f1_score": round(float(f1[i]), 4),
            "support": int(support[i]),
            "true_positives": int(tp),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_negatives": int(tn)
        }

    macro_prec = float(np.mean(prec))
    macro_rec = float(np.mean(rec))
    macro_f1 = float(np.mean(f1))
    macro_spec = float(np.mean(specificities))

    return {
        "accuracy": round(acc, 4),
        "macro_precision": round(macro_prec, 4),
        "macro_recall": round(macro_rec, 4),
        "macro_specificity": round(macro_spec, 4),
        "macro_f1_score": round(macro_f1, 4),
        "per_class": per_class_metrics,
        "confusion_matrix": cm.tolist()
    }

def benchmark_latency(model, sample_input, iterations=50):
    """
    Measures genuine inference latency per image over multiple warm iterations.
    """
    # Warmup
    for _ in range(5):
        _ = model.predict(sample_input[:1], verbose=0)

    latencies = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = model.predict(sample_input[:1], verbose=0)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0) # in ms

    return {
        "iterations": iterations,
        "mean_latency_ms": round(float(np.mean(latencies)), 2),
        "min_latency_ms": round(float(np.min(latencies)), 2),
        "max_latency_ms": round(float(np.max(latencies)), 2),
        "std_latency_ms": round(float(np.std(latencies)), 2)
    }

def evaluate_crop_model():
    print("\n" + "=" * 60)
    print("AGROBLOOM AI: EVALUATING CROP DISEASE MODEL ON UNSEEN TEST SET")
    print("=" * 60)
    model_path = os.path.join(MODELS_DIR, "crop_model.keras")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Crop model not found at {model_path}. Train it first.")

    model = tf.keras.models.load_model(model_path)
    X_test, y_test = load_dataset_split(CROP_CLASSES, "test", shuffle=False)
    print(f"Loaded {len(X_test)} unseen test images across {len(CROP_CLASSES)} crop classes.")

    raw_preds = model.predict(X_test, verbose=1)
    y_pred = np.argmax(raw_preds, axis=1)

    metrics = compute_detailed_metrics(y_test, y_pred, CROP_CLASSES)
    print("\n=== Crop Model Evaluation Summary ===")
    print(f"  Test Accuracy:        {metrics['accuracy'] * 100:.2f}%")
    print(f"  Macro Precision:      {metrics['macro_precision'] * 100:.2f}%")
    print(f"  Macro Recall:         {metrics['macro_recall'] * 100:.2f}%")
    print(f"  Macro Specificity:    {metrics['macro_specificity'] * 100:.2f}%")
    print(f"  Macro F1-Score:       {metrics['macro_f1_score'] * 100:.2f}%")

    print("\nMeasuring inference latency...")
    latency = benchmark_latency(model, X_test)
    print(f"  Average Inference Latency: {latency['mean_latency_ms']} ms/image")
    metrics["latency"] = latency

    # Export json
    out_json = os.path.join(MODELS_DIR, "crop_evaluation.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Exported crop metrics to {out_json}")

    # Export CSV confusion matrix
    cm_csv = os.path.join(MODELS_DIR, "crop_confusion_matrix.csv")
    with open(cm_csv, "w", encoding="utf-8") as f:
        f.write("True_Class," + ",".join(CROP_CLASSES) + "\n")
        for idx, row in enumerate(metrics["confusion_matrix"]):
            f.write(f"{CROP_CLASSES[idx]}," + ",".join(map(str, row)) + "\n")
    print(f"Exported crop confusion matrix CSV to {cm_csv}")

    return metrics

def evaluate_flower_model():
    print("\n" + "=" * 60)
    print("AGROBLOOM AI: EVALUATING FLOWER DISEASE MODEL ON UNSEEN TEST SET")
    print("=" * 60)
    model_path = os.path.join(MODELS_DIR, "flower_model.keras")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Flower model not found at {model_path}. Train it first.")

    model = tf.keras.models.load_model(model_path)
    X_test, y_test = load_dataset_split(FLOWER_CLASSES, "test", shuffle=False)
    print(f"Loaded {len(X_test)} unseen test images across {len(FLOWER_CLASSES)} flower classes.")

    raw_preds = model.predict(X_test, verbose=1)
    y_pred = np.argmax(raw_preds, axis=1)

    metrics = compute_detailed_metrics(y_test, y_pred, FLOWER_CLASSES)
    print("\n=== Flower Model Evaluation Summary ===")
    print(f"  Test Accuracy:        {metrics['accuracy'] * 100:.2f}%")
    print(f"  Macro Precision:      {metrics['macro_precision'] * 100:.2f}%")
    print(f"  Macro Recall:         {metrics['macro_recall'] * 100:.2f}%")
    print(f"  Macro Specificity:    {metrics['macro_specificity'] * 100:.2f}%")
    print(f"  Macro F1-Score:       {metrics['macro_f1_score'] * 100:.2f}%")

    print("\nMeasuring inference latency...")
    latency = benchmark_latency(model, X_test)
    print(f"  Average Inference Latency: {latency['mean_latency_ms']} ms/image")
    metrics["latency"] = latency

    # Export json
    out_json = os.path.join(MODELS_DIR, "flower_evaluation.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Exported flower metrics to {out_json}")

    # Export CSV confusion matrix
    cm_csv = os.path.join(MODELS_DIR, "flower_confusion_matrix.csv")
    with open(cm_csv, "w", encoding="utf-8") as f:
        f.write("True_Class," + ",".join(FLOWER_CLASSES) + "\n")
        for idx, row in enumerate(metrics["confusion_matrix"]):
            f.write(f"{FLOWER_CLASSES[idx]}," + ",".join(map(str, row)) + "\n")
    print(f"Exported flower confusion matrix CSV to {cm_csv}")

    return metrics

def export_model_metadata(crop_metrics, flower_metrics):
    """
    Consolidates metadata for FastAPI and React dashboard consumption.
    """
    metadata = {
        "system": "AgroBloom AI Multi-Model Diagnostic Engine",
        "architecture": "MobileNetV2 Transfer Learning (Pre-trained on ImageNet)",
        "input_dimensions": [224, 224, 3],
        "preprocessing": "tf.keras.applications.mobilenet_v2.preprocess_input [-1, 1]",
        "models": {
            "crop_model": {
                "status": "ready",
                "format": "Keras (.keras)",
                "classes_count": len(CROP_CLASSES),
                "classes": CROP_CLASSES,
                "accuracy": crop_metrics["accuracy"],
                "macro_f1": crop_metrics["macro_f1_score"],
                "macro_precision": crop_metrics["macro_precision"],
                "macro_recall": crop_metrics["macro_recall"],
                "macro_specificity": crop_metrics["macro_specificity"],
                "mean_latency_ms": crop_metrics["latency"]["mean_latency_ms"]
            },
            "flower_model": {
                "status": "ready",
                "format": "Keras (.keras)",
                "classes_count": len(FLOWER_CLASSES),
                "classes": FLOWER_CLASSES,
                "accuracy": flower_metrics["accuracy"],
                "macro_f1": flower_metrics["macro_f1_score"],
                "macro_precision": flower_metrics["macro_precision"],
                "macro_recall": flower_metrics["macro_recall"],
                "macro_specificity": flower_metrics["macro_specificity"],
                "mean_latency_ms": flower_metrics["latency"]["mean_latency_ms"]
            }
        },
        "hardware": "Optimized CPU with oneDNN multi-threading",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"\nExported consolidated metadata to: {meta_path}")

if __name__ == "__main__":
    crop_m = evaluate_crop_model()
    flower_m = evaluate_flower_model()
    export_model_metadata(crop_m, flower_m)

