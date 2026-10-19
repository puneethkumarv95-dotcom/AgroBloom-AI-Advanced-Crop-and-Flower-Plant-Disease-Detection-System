# AgroBloom AI — Installation & Setup Guide

## Prerequisites

1. **Node.js** (v18+ or v20+)
2. **Python** (v3.10, v3.11, 3.12, or 3.13)
3. **MongoDB** (running locally on port `27017` or via MongoDB Atlas)

---

## One-Command Installation

From the project root:

```bash
# 1. Install dependencies across root, server, and client
npm run install:all

# 2. Install Python AI dependencies
pip install -r ai-service/requirements.txt
```

---

## Running the Application

To launch all 3 microservices simultaneously (React client, Express server, FastAPI AI service):

```bash
npm run dev
```

This single command invokes `concurrently` on Windows and boots:
- **Express Backend:** http://localhost:5000
- **Python FastAPI Service:** http://127.0.0.1:8000
- **React Vite Client:** http://localhost:5173

---

## Environment Variables

### Server (`server/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/agrobloom_ai
JWT_SECRET=agrobloom_super_secure_jwt_secret_key_2026_mca_project
AI_SERVICE_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
```

---

## Testing Commands

```bash
# Test Node.js Backend (Auth, Reminders, Forum)
npm run test:server

# Test Python FastAPI AI Service
npm run test:ai
```

