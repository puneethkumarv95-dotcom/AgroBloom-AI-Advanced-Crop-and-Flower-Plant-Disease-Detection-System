# AgroBloom AI — REST API Documentation

## Server Endpoints (Express : Port 5000)

### 1. Health & Telemetry
- `GET /api/health` — Checks Express backend status and database connectivity.
- `GET /api/ai/status` — Proxies FastAPI model readiness status (`MODEL_NOT_READY` or `MODEL_READY`).

### 2. User Authentication
- `POST /api/auth/register`
  - Body: `{ name, email, password, role, farmLocation, phone, preferredLanguage }`
  - Response: `{ success: true, token: "<JWT>", user: {...} }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ success: true, token: "<JWT>", user: {...} }`
- `GET /api/auth/me` (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, user: {...} }`
- `PUT /api/auth/profile` (Protected)
  - Body: `{ name, farmLocation, phone, bio, preferredLanguage }`
  - Response: `{ success: true, user: {...} }`

### 3. Plants & Diseases
- `GET /api/plants` — Returns list of all cataloged crops and flowers.
- `POST /api/plants` (Protected) — Creates a new botanical host profile.
- `GET /api/diseases` — Returns list of plant diseases with pathogen profiles.
- `POST /api/diseases` (Protected) — Creates a new disease entity with remedies.

### 4. AI Image Ingestion & Validation
- `POST /api/ai/predict`
  - Multipart Form: `image` (JPEG/PNG/WebP, max 10MB)
  - Validates image dimensions, passes to FastAPI, returns `MODEL_NOT_READY` in Phase 1.

### 5. Community Forum
- `GET /api/community/posts` — Fetches discussions with category & search filters.
- `POST /api/community/posts` (Protected) — Creates post with optional photo upload.
- `POST /api/community/posts/:id/comments` (Protected) — Submits peer reply.
- `POST /api/community/posts/:id/upvote` (Protected) — Toggles discussion upvote.

### 6. Plant Care Reminders
- `GET /api/reminders` (Protected) — Returns logged care reminders.
- `POST /api/reminders` (Protected) — Creates new care task (spraying, watering, pruning).
- `PATCH /api/reminders/:id/toggle` (Protected) — Toggles completion flag.
- `DELETE /api/reminders/:id` (Protected) — Removes reminder.

### 7. Expert Consultations
- `GET /api/consultations` (Protected) — Returns farmer consultation tickets.
- `POST /api/consultations` (Protected) — Submits urgent review ticket to agronomists.

---

## AI Microservice Endpoints (FastAPI : Port 8000)

- `GET /health` — FastAPI health check.
- `GET /model/status` — Returns `MODEL_NOT_READY` or `MODEL_READY`.
- `POST /predict/image` — Preprocesses input image to MobileNetV2 `(1, 224, 224, 3)` tensor. Returns `MODEL_NOT_READY` status until Phase 2 training completes.

