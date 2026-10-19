# AgroBloom AI — Advanced Crop & Flower Plant Disease Detection System
### Master of Computer Applications (MCA) Final Year Major Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.110.0-teal.svg)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-v2.15%2Fv2.21-orange.svg)](https://tensorflow.org/)
[![React](https://img.shields.io/badge/React-v18.x-blue.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Automated%20Tests-92%2F92%20Passing-brightgreen.svg)](c:/miniproject/TESTING_REPORT.md)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Capable-purple.svg)](c:/miniproject/OFFLINE_INFERENCE_REPORT.md)

---

## 📌 Project Overview

**AgroBloom AI** is a state-of-the-art agricultural pathology platform engineered to diagnose, monitor, and treat crop and flowering plant diseases. Designed specifically to overcome rural connectivity barriers, agronomist shortages, and diagnostic delays, AgroBloom AI combines:
- **Genuine Deep Convolutional Neural Networks:** Multi-architecture benchmarks comparing **MobileNetV2**, **EfficientNetB0**, and **ResNet50**.
- **Explainable Artificial Intelligence (XAI):** Visual gradient-weighted class activation mapping (**Grad-CAM**) highlighting localized foliar lesions.
- **Quantitative Lesion Segmentation:** Automated color-space HSV necrosis thresholding estimating disease severity percentage ($0\% - 100\%$).
- **Zero-Connectivity Edge PWA:** In-browser on-device inference using `@tensorflow/tfjs` and IndexedDB local caching with cloud batch synchronization.
- **Farmer Assistance Ecosystem:** Extension-verified treatment regimens, longitudinal recovery tracking, trilingual support (English, Kannada, Hindi), voice assistant, community peer forum, and certified agronomist tele-consultation.

---

## 🏗️ System Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER (REACT PWA)                                   |
|                                                                                                    |
|  +---------------------+   +---------------------+   +---------------------+   +----------------+  |
|  | Disease Detectors   |   | Explainable AI View |   | AI Chatbot & Care   |   | Offline Studio |  |
|  | (Crop, Flower, Cam) |   | (Grad-CAM, Segment) |   | (RAG, Care Plans)   |   | (PWA + TF.js)  |  |
|  +---------------------+   +---------------------+   +---------------------+   +----------------+  |
|  | Multilingual Engine |   | Farmer Forum        |   | Expert Consultation |   | Telemetry View |  |
|  | (EN, KN, HI, TTS)   |   | (Threads, Replies)  |   | (Tickets, Agronomy) |   | (Benchmarks)   |  |
|  +---------------------+   +---------------------+   +---------------------+   +----------------+  |
+----------------------------------------------------------------------------------------------------+
                   |                                                                  |
                   | (HTTP REST / JSON / Multipart)                                   | (On-Device Local)
                   v                                                                  v
+-------------------------------------------------------+               +----------------------------+
|        APPLICATION & GATEWAY TIER (NODE.JS EXPRESS)   |               |   IndexedDB Local Store    |
|                                                       |               |   (AgroBloomOfflineDB)     |
|  - JWT Authentication & RBAC (Farmer/Agronomist/Admin)|               +----------------------------+
|  - Rate Limiting, Helmet, Multer File Validation     |                              ^
|  - PDF Pathology Report Generation (PDFKit)           |                              |
|  - Offline Record Batch Synchronization Handler       |------------------------------+ (When Online)
|  - Reverse Proxy to Python AI Deep Learning Engine    |
+-------------------------------------------------------+
        |                                       |
        | (Mongoose ODM)                        | (Internal HTTP Proxy: Port 8000)
        v                                       v
+-----------------------------+     +-------------------------------------------------------+
|   DATABASE TIER (MONGODB)   |     |      AI COMPUTATIONAL MICROSERVICE (PYTHON FASTAPI)   |
|                             |     |                                                       |
|  - Users & Profiles         |     |  - Preprocessing & Bilinear Foliar Normalization      |
|  - Detections & Reports     |     |  - MobileNetV2, EfficientNetB0, ResNet50 Models       |
|  - Plants & Diseases        |     |  - Grad-CAM Heatmap Generation (Last Conv Layer)      |
|  - Care Plans & Reminders   |     |  - HSV Foliar Lesion Color Segmentation & Severity %  |
|  - Forum Posts & Comments   |     |  - RAG Agronomic Knowledge Retrieval Engine           |
|  - Consultation Tickets     |     |  - Multi-Architecture Empirical Benchmarking API      |
+-----------------------------+     +-------------------------------------------------------+
```

---

## 📊 Empirical Deep Learning Benchmarks

Three architectures were trained and evaluated on strictly isolated test partitions under identical experimental protocols:

### PlantVillage Crop Models (11 Classes, 324 Held-Out Test Samples)
| Architecture | Role | Accuracy | Macro F1 | Specificity | CPU Latency | Parameters | File Size |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV2** | **Edge & Offline PWA Champion** | **90.12%** | 90.07% | 99.01% | **79.34 ms** | **2,429,003** | **20.25 MB** |
| **EfficientNetB0** | **Cloud Production Baseline** | **93.83%** | 93.76% | 99.38% | 87.99 ms | 4,220,590 | 28.46 MB |
| **ResNet50** | **Deep Residual Baseline** | **93.83%** | 93.81% | 99.38% | 120.95 ms | 23,860,107 | 161.77 MB |

### Rose Floriculture Models (4 Classes, 40 Held-Out Test Samples)
| Architecture | Role | Accuracy | Macro F1 | Specificity | CPU Latency | Parameters | File Size |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV2** | **Edge & Offline PWA Champion** | **75.00%** | 66.67% | 91.67% | **88.53 ms** | **2,428,100** | **20.24 MB** |
| **EfficientNetB0** | **Compound Scaled Baseline** | **75.00%** | 66.67% | 91.67% | 120.81 ms | 4,219,687 | 28.45 MB |
| **ResNet50** | **Deep Residual Baseline** | **75.00%** | 66.67% | 91.67% | 122.83 ms | 23,859,204 | 161.76 MB |

---

## 🧪 Comprehensive Test Coverage (92/92 PASS — 100%)

Run the unified monorepo test suite with a single command:
```bash
npm test
```

- **Frontend Client (30 Tests):** Vitest + React Testing Library (`client/src/App.test.jsx`) $\rightarrow$ **30 / 30 PASS**
- **Backend Server (33 Tests):** Node.js Test Runner + Supertest (`server/tests/api.test.js`) $\rightarrow$ **33 / 33 PASS**
- **AI Microservice (29 Tests):** Pytest + Starlette TestClient (`ai-service/test_ai_endpoints.py`) $\rightarrow$ **29 / 29 PASS**

---

## 🚀 Quickstart & Installation

### Option 1: Bare-Metal Development (Single Root Command)

1. **Clone repository:**
   ```bash
   git clone <repo_url> c:\miniproject
   cd c:\miniproject
   ```
2. **Install all dependencies:**
   ```bash
   npm run install:all
   pip install -r ai-service/requirements.txt
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   cp ai-service/.env.example ai-service/.env
   ```
4. **Boot the complete monorepo:**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000 (Health: http://localhost:5000/api/health)
   - AI Microservice: http://localhost:8000 (Docs: http://localhost:8000/docs)

### Option 2: Containerized Production Launch (Docker Compose)

```bash
docker-compose up --build -d
```
All four services (`mongo`, `ai-service`, `backend`, `frontend`) initialize automatically with built-in health probes.

---

## 📚 Complete Project Documentation Index

- [PROJECT_ARCHITECTURE.md](c:/miniproject/PROJECT_ARCHITECTURE.md) — System architecture, component communication, and data flow.
- [DATABASE_SCHEMA.md](c:/miniproject/DATABASE_SCHEMA.md) — Mongoose schemas, relationships, and indexing.
- [API_DOCUMENTATION.md](c:/miniproject/API_DOCUMENTATION.md) — REST API specifications across all tiers.
- [AI_MODEL_DOCUMENTATION.md](c:/miniproject/AI_MODEL_DOCUMENTATION.md) — Deep learning mathematics, Grad-CAM, and HSV segmentation.
- [DATASET_DOCUMENTATION.md](c:/miniproject/DATASET_DOCUMENTATION.md) — PlantVillage & Rose Leaf dataset provenance.
- [DEPLOYMENT_GUIDE.md](c:/miniproject/DEPLOYMENT_GUIDE.md) — Production operations and DevOps runbook.
- [TESTING_REPORT.md](c:/miniproject/TESTING_REPORT.md) — Test suites, assertions, and verification results.
- [SECURITY_REPORT.md](c:/miniproject/SECURITY_REPORT.md) — OWASP Top 10 mitigations, RBAC, and threat modeling.
- [PERFORMANCE_REPORT.md](c:/miniproject/PERFORMANCE_REPORT.md) — Latency histograms, memory usage, and throughput telemetry.
- [MODEL_COMPARISON_REPORT.md](c:/miniproject/MODEL_COMPARISON_REPORT.md) — In-depth architectural trade-off analysis.
- [OFFLINE_INFERENCE_REPORT.md](c:/miniproject/OFFLINE_INFERENCE_REPORT.md) — PWA, Service Worker, and IndexedDB engine.
- [MCA_FINAL_PROJECT_REPORT.md](c:/miniproject/MCA_FINAL_PROJECT_REPORT.md) — Complete 26-chapter academic dissertation.
- [MCA_PRESENTATION_CONTENT.md](c:/miniproject/MCA_PRESENTATION_CONTENT.md) — 12-slide presentation structure.
- [MCA_VIVA_QUESTIONS.md](c:/miniproject/MCA_VIVA_QUESTIONS.md) — Comprehensive technical defense Q&A.
- [PROJECT_DEMO_GUIDE.md](c:/miniproject/PROJECT_DEMO_GUIDE.md) — Step-by-step examiner walkthrough.

