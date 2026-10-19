# AGROBLOOM AI — REST API SPECIFICATION & DOCUMENTATION
## Complete Endpoint Reference for Backend Gateway and AI Microservices

**Project:** AgroBloom AI — Advanced Crop and Flower Plant Disease Detection System  
**Academic Level:** Master of Computer Applications (MCA) Major Project  
**Author:** AgroBloom AI Backend & AI Engineering Team  
**Date:** October 2026  

---

### 1. General Architectural Conventions

- **Backend Base URL:** `http://localhost:5000/api`
- **AI Microservice Base URL:** `http://localhost:8000`
- **Authentication Scheme:** `Authorization: Bearer <JWT_TOKEN>` in HTTP Request Headers.
- **Content Types:** `application/json` (standard payloads) or `multipart/form-data` (image uploads).
- **Standard Success Response Format:**
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": { ... }
  }
  ```
- **Standard Error Response Format:**
  ```json
  {
    "success": false,
    "message": "Descriptive error message",
    "errors": [ ... ]
  }
  ```

---

### 2. Node.js Express Backend Endpoints

#### 2.1 Authentication & User Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Registers a new user. Rejects administrative role assignment. Returns JWT token. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials with bcrypt and returns signed JWT token. |
| `GET` | `/api/auth/me` | User | Retrieves currently authenticated profile and permissions. |
| `PUT` | `/api/auth/profile` | User | Updates user name, phone, language preference, and location. |

#### 2.2 Disease Detection & Diagnostic History (`/api/detections`)
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/detections/crop` | User | Uploads crop leaf image, queries AI service, persists record, returns diagnosis + Grad-CAM. |
| `POST` | `/api/detections/flower`| User | Uploads flower leaf image, queries AI service, persists record, returns diagnosis. |
| `POST` | `/api/detections/offline-sync` | User | Receives array of offline PWA diagnoses and stores in MongoDB with duplicate checks. |
| `GET` | `/api/detections/history` | User | Returns paginated, searchable, date-filterable detection history for user. |
| `GET` | `/api/detections/:id` | User | Retrieves full diagnostic detail, XAI heatmap, and treatment regimens for an ID. |
| `GET` | `/api/detections/:id/report` | User | Generates dynamic PDF pathology report via PDFKit stream. |

#### 2.3 Deep Learning Model Benchmarks (`/api/models`)
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/models/comparison` | Public | Returns multi-architecture metrics (MobileNetV2, EfficientNetB0, ResNet50) for crops and flowers. |
| `GET` | `/api/models/metrics` | Public | Returns current production model validation metrics and latency telemetry. |
| `GET` | `/api/models/versions` | Public | Returns active model binary versions and release changelog. |
| `GET` | `/api/models/offline-manifest` | Public | Returns cache asset list and hashes for client-side PWA pre-caching. |

#### 2.4 Agricultural Community Forum (`/api/forum`)
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/forum/posts` | Public | Lists community discussions with search, category filtering, and pagination. |
| `POST` | `/api/forum/posts` | User | Creates new forum discussion post with optional crop photo attachment. |
| `GET` | `/api/forum/posts/:id` | Public | Retrieves post details, comments, and nested replies. |
| `POST` | `/api/forum/posts/:id/comments` | User | Adds reply or answer to an existing discussion thread. |
| `PATCH`| `/api/forum/posts/:id/solve` | Author | Marks discussion as resolved and designates accepted solution. |
| `POST` | `/api/forum/posts/:id/react` | User | Toggles upvote reaction on post (enforces 1 reaction per user). |

#### 2.5 Expert Agronomist Consultations (`/api/consultations`)
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/consultations/tickets` | Farmer | Initiates formal consultation ticket referencing a previous detection. |
| `GET` | `/api/consultations/tickets` | User | Lists tickets submitted by farmer or assigned to agronomist. |
| `POST` | `/api/consultations/tickets/:id/messages` | Participant | Appends multi-turn advisory message to ticket. |
| `PATCH`| `/api/consultations/tickets/:id/prescribe`| Agronomist | Submits formal agronomic prescription and treatment plan. |
| `GET` | `/api/consultations/experts` | Public | Directory of verified agronomists and plant pathologists. |
| `POST` | `/api/consultations/apply` | User | Submits credentials and license for agronomist verification. |

#### 2.6 Care Plans, Chatbot, & Reminders (`/api/care-plans`, `/api/chat`, `/api/reminders`)
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/care-plans` | User | Retrieves active longitudinal recovery tracking plans. |
| `POST` | `/api/care-plans` | User | Generates new care plan for plant disease recovery. |
| `PATCH`| `/api/care-plans/:id/tasks/:taskIdx` | User | Toggles completion of treatment checklist task. |
| `POST` | `/api/chat` | User | Submits query to RAG conversational chatbot; returns extension-verified guidance. |
| `GET` | `/api/reminders` | User | Lists agricultural spraying, watering, and inspection reminders. |

---

### 3. Python FastAPI AI Service Endpoints

| Method | Endpoint | Parameters | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/health` | None | Returns operational health status, loaded models, and memory telemetry. |
| `GET` | `/model/status` | None | Reports readiness flag, model versions, and warm-up state. |
| `POST` | `/predict` | `file: UploadFile`, `plant_type: str` | Executes full foliar diagnostic pipeline (inference + Grad-CAM + severity). |
| `POST` | `/predict/unknown-check` | `file: UploadFile` | Evaluates entropy and softmax probability thresholding for outlier detection. |
| `POST` | `/gradcam` | `file: UploadFile`, `plant_type: str` | Computes localized class activation gradients and overlays heatmap. |
| `POST` | `/segment` | `file: UploadFile` | Computes HSV foliar necrosis segmentation mask and calculates diseased surface area %. |
| `GET` | `/api/models/comparison` | None | Serves JSON benchmarks for MobileNetV2, EfficientNetB0, and ResNet50. |
| `GET` | `/api/models/offline-manifest` | None | Serves file manifests and byte lengths for browser PWA caching. |

---

### 4. Sample Diagnostic Request & Response

#### Request:
```http
POST /api/detections/crop HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="tomato_leaf.jpg"
Content-Type: image/jpeg

[RAW BINARY DATA]
------WebKitFormBoundary--
```

#### Response:
```json
{
  "success": true,
  "message": "Diagnosis generated successfully",
  "data": {
    "id": "67140f7b92a34b21098e94a1",
    "plantType": "crop",
    "plantName": "Tomato",
    "primaryDisease": "Tomato Early Blight",
    "confidence": 96.84,
    "severity": "Moderate",
    "severityPercentage": 14.8,
    "gradCamUrl": "/uploads/gradcam_1729384918231.png",
    "treatmentPlan": {
      "organic": [
        "Apply copper octanoate fungicide or Bacillus subtilis biopesticide at first sign of concentric lesions.",
        "Remove lower infected foliage and mulch around the base of the tomato plant to avoid splash dispersal."
      ],
      "chemical": [
        "Chlorothalonil or Mancozeb applied every 7-10 days under humid conditions."
      ],
      "preventative": [
        "Maintain 3-year crop rotation avoiding Solanaceae family members.",
        "Implement drip irrigation instead of overhead sprinkling."
      ]
    },
    "createdAt": "2026-10-20T02:26:15.000Z"
  }
}
```

