# AgroBloom AI — System Architecture

**Project:** AgroBloom AI – Advanced Crop and Flower Plant Disease Detection System  
**Framework:** React (Vite) + Tailwind CSS + Node.js (Express) + MongoDB + Python (FastAPI, TensorFlow)

---

## 1. Monorepo Organization

```
miniproject/
├── client/                 # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Footer
│   │   ├── context/        # AuthContext, LanguageContext, ThemeContext
│   │   ├── pages/          # 12 Core Module Layouts + Auth Pages
│   │   └── services/       # Axios API client wrapper
│   ├── index.html
│   ├── vite.config.js      # Proxies /api to Node (5000)
│   └── package.json
│
├── server/                 # Node.js + Express + Mongoose Backend
│   ├── config/             # MongoDB database connection (db.js)
│   ├── controllers/        # Auth, Detection controllers
│   ├── middleware/         # JWT verification (auth.js), Multer upload (upload.js)
│   ├── models/             # Mongoose schemas:
│   │                       # User, Plant, Disease, Detection, Post, Consultation, Reminder
│   ├── routes/             # auth.routes, plant_disease.routes, community.routes, etc.
│   ├── tests/              # Node test runner automated suites
│   ├── server.js           # Express main server entry point (Port 5000)
│   └── package.json
│
├── ai-service/             # Python FastAPI Microservice (Port 8000)
│   ├── main.py             # FastAPI entry point (/health, /model/status, /predict/image)
│   ├── knowledge_base.py   # Grounded plant pathology knowledge base
│   ├── vision_xai.py       # Grad-CAM and lesion segmentation modules
│   ├── test_ai_endpoints.py # Pytest test suite
│   └── requirements.txt
│
├── docs/                   # Engineering and API documentation
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── SETUP_GUIDE.md
│   └── PHASE_1_SUMMARY.md
│
└── package.json            # Monorepo orchestration (npm run dev)
```

---

## 2. Microservice Communication & Ports

| Service | Technology | Port | Responsibilities |
|---|---|---|---|
| **Client** | React + Vite + Tailwind | `5173` | UI, Dark/Light mode, i18n, Audio/Camera capture |
| **Server** | Node.js + Express | `5000` | Auth, MongoDB persistence, Image validation, Business logic |
| **AI Service** | Python + FastAPI | `8000` | MobileNetV2 image preprocessing, inference, Grad-CAM, NLP chat |
| **Database** | MongoDB | `27017` | Users, Plants, Diseases, Detections, Posts, Consultations, Reminders |

---

## 3. Data Flow Diagram

```
[ User Browser ]
       │
       ▼ (HTTP / REST)
[ Vite Client : 5173 ] ──── /api proxy ───► [ Express Server : 5000 ]
                                                    │
                                     ┌──────────────┴──────────────┐
                                     ▼                             ▼
                            [ MongoDB : 27017 ]         [ FastAPI AI : 8000 ]
                            - Users                     - /health
                            - Plants & Diseases         - /model/status
                            - Detections                - /predict/image
                            - Reminders                 - /api/chat
                            - Forum Posts
                            - Consultations
```

