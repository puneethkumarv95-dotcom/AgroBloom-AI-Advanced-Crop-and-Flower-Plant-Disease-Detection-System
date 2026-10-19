# AGROBLOOM AI — SYSTEM TESTING & QUALITY ASSURANCE REPORT
## Comprehensive Verification Matrix, Automated Test Suites, and Regression Analysis

**Project:** AgroBloom AI — Advanced Crop and Flower Plant Disease Detection System  
**Academic Level:** Master of Computer Applications (MCA) Major Project  
**Author:** AgroBloom AI Quality Assurance & Automation Group  
**Date:** October 2026  

---

### 1. Quality Assurance Strategy & Test Pyramid

AgroBloom AI employs a multi-tiered test automation methodology spanning all three layers of the application stack:

```
                  / \
                 /   \
                / E2E \       <-- Full Diagnostic Workflows & Sync
               /-------\
              /  Integ  \     <-- REST API Contracts, DB Transactions, Supertest
             /-----------\
            /  Unit Tests \   <-- Preprocessing, Model Inferences, Contexts, UI
           /---------------\
```

- **Frontend Tier:** Vitest with `@testing-library/react` and `@testing-library/user-event` simulating realistic user interactions, navigation, speech events, offline states, and authentication guards.
- **Backend Tier:** Node.js native test runner (`node --test`) paired with `supertest` executing integration requests against a live MongoDB database instance.
- **AI Microservice Tier:** Pytest with Starlette `TestClient` verifying FastAPI routing, image decoding, Grad-CAM generation, HSV segmentation, and error boundary handling.

---

### 2. Monorepo Test Summary (100% Pass Rate)

| Subsystem | Test Harness | Total Tests | Passed | Failed | Skipped | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Frontend Client** | Vitest 4.1.12 | 30 | 30 | 0 | 0 | **PASS** |
| **Backend Express** | Node 20 Test Runner + Supertest | 33 | 33 | 0 | 0 | **PASS** |
| **AI FastAPI Service**| Pytest 8.x + TestClient | 29 | 29 | 0 | 0 | **PASS** |
| **Complete System** | `npm test` | **92** | **92** | **0** | **0** | **100% PASS** |

---

### 3. Granular Test Suite Breakdown

#### 3.1 AI Microservice Test Suite (`ai-service/test_ai_endpoints.py` — 29 Tests)
- `test_health_endpoint`: Asserts HTTP 200, system uptime, and loaded model flags.
- `test_model_status_endpoint`: Asserts model readiness and active architecture names.
- `test_predict_crop_valid_image`: Verifies inference on valid crop leaf images, checking prediction labels, probability distributions, and confidence calculations.
- `test_predict_flower_valid_image`: Verifies inference on valid rose leaf images across healthy and disease classes.
- `test_predict_unsupported_plant_type`: Verifies HTTP 400 validation error on invalid plant categories.
- `test_predict_invalid_image_data`: Verifies graceful 422 error on corrupted or non-image byte uploads.
- `test_gradcam_endpoint`: Asserts generation of base64-encoded Grad-CAM activation heatmap overlay.
- `test_segmentation_endpoint`: Asserts HSV color mask generation and numerical severity percentage ($0\% - 100\%$).
- `test_unknown_disease_detection`: Tests entropy-based thresholding for anomalous non-foliar images.
- `test_model_comparison_endpoint`: Validates empirical JSON benchmarking payload containing MobileNetV2, EfficientNetB0, and ResNet50 metrics.
- `test_offline_manifest_endpoint`: Validates cache manifest file list, mime types, and byte lengths.
*(plus 18 additional boundary, parameter, and edge case assertions)*.

#### 3.2 Backend Express Test Suite (`server/tests/api.test.js` — 33 Tests)
- **Health & Authentication (7 tests):** Express service heartbeat, user registration validation, prevention of privilege escalation, bcrypt hash verification, duplicate email rejection, login credential validation, malformed JWT rejection.
- **User Profile & RBAC (2 tests):** Profile retrieval and authenticated profile update.
- **Botanical Taxonomies (1 test):** Plant and disease collection read/write contracts.
- **Diagnostic Inferences (5 tests):** AI proxy image upload filtering, rejection of unsupported MIME types, handling of AI service downtime without fabricating results, genuine MongoDB persistence of diagnoses, detection history scoping by user ID.
- **Computer Vision & XAI (1 test):** Phase 3 Grad-CAM and severity response validation.
- **Plant Care & RAG Chatbot (5 tests):** University extension fact validation, multi-turn RAG chat persistence, recovery timeline progress tracking, care plan task completion toggle, nutrient deficiency dataset requirement enforcement.
- **Agricultural Community Forum (3 tests):** Post creation, comments, nested replies, single-reaction enforcement, accepted answer designation, `isSolved` toggling.
- **Expert Consultations (3 tests):** Agronomist credential application workflow, administrative verification and role upgrade, ticket messaging and formal prescription submission.
- **Utilities & Reports (3 tests):** Dynamic PDF pathology report stream generation, in-app notification synchronization and unread count, smart plant search with pagination and suggestions.
- **Model Comparison & Offline Sync (2 tests):** Proxying multi-architecture benchmark JSON, batch synchronization of offline PWA diagnoses with duplicate prevention.

#### 3.3 Frontend Client Test Suite (`client/src/App.test.jsx` — 30 Tests)
- **Navigation & Routing (14 tests):** Verification of all primary page routes (`/crop-detection`, `/flower-detection`, `/camera`, `/chatbot`, `/recovery`, `/plant-care`, `/disease-library`, `/history`, `/analytics`, `/forum`, `/consultations`, `/settings`, `/offline`, `/voice`).
- **Security & Session (4 tests):** Redirection of unauthenticated visits from protected routes, native HTML5 form validation, login submission and token storage, server error rendering.
- **Accessibility & Customization (2 tests):** Dark mode persistence, multilingual UI switching across English, Kannada, and Hindi.
- **Intelligent Features (6 tests):** Notification center badge updates, smart disease library filtering, date-range detection history queries, forum discussion submission, expert consultation directory.
- **Offline & Benchmarking (4 tests):** Offline PWA diagnosis studio rendering, local IndexedDB record sync tab, multi-architecture benchmark dashboard rendering, confusion matrix heatmap display.

---

### 4. Regression Analysis

Throughout all 8 project phases, zero regressions were introduced:
- All original Phase 1 authentication contracts remained fully operational.
- Phase 2 genuine datasets and models remained unmodified.
- Phase 3 Grad-CAM and segmentation algorithms remained active.
- Phase 4 recovery tracking and care plans operated seamlessly alongside Phase 6 forums and Phase 7 offline scanning.

