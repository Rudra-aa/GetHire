# GetHire Cloud Deployment Guide: Vercel & Render

This guide provides the complete, step-by-step instructions to deploy GetHire in production:
- **Frontend**: Hosted on **Vercel** (Global Edge CDN)
- **Backend**: Hosted on **Render** (FastAPI Python Web Service)
- **Database**: Hosted on **MongoDB Atlas** (Cloud Database)
- **AI Engine**: **Google Gemini 2.5 Flash / Pro**

---

## 1. Architecture & URL Flow

```
┌────────────────────────────────────────────────────────┐
│                   User's Browser                       │
│        https://get-hire.vercel.app                     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       Static Assets & UI          API / WebSocket / LLM Calls
                │                        │
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│     Vercel CDN Edge    │      │     Render Backend     │
│   (Vite + React SPA)   │      │ (FastAPI / Python 3.11)│
│                        │      │  https://*.onrender.com│
└────────────────────────┘      └───────────┬────────────┘
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                  │ MongoDB Atlas │ │ Google Gemini │ │ Upstash Redis │
                  │  (Production) │ │   (AI Core)   │ │  (Optional)   │
                  └───────────────┘ └───────────────┘ └───────────────┘
```

---

## 2. Prerequisites & Accounts

Before starting, ensure you have:
1. **GitHub Repository**: [Rudra-aa/GetHire](https://github.com/Rudra-aa/GetHire) with the latest commits pushed to `main`.
2. **MongoDB Atlas Account**: [cloud.mongodb.com](https://cloud.mongodb.com) (Free Shared Tier M0 is sufficient).
3. **Google AI Studio Key**: [aistudio.google.com](https://aistudio.google.com) (Gemini API key).
4. **Render Account**: [render.com](https://render.com).
5. **Vercel Account**: [vercel.com](https://vercel.com).

---

## 3. Database Setup (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com) and create a free **M0 Cluster** (choose AWS or Google Cloud, closest region to your users).
2. **Configure Database User**:
   - Go to **Database Access** -> **Add New Database User**.
   - Select **Password Authentication**.
   - Choose a username (e.g. `gethire_admin`) and generate a secure password.
   - Under **Database User Privileges**, select **Read and write to any database**.
3. **Configure Network Access**:
   - Go to **Network Access** -> **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   > [!IMPORTANT]
   > Render uses dynamic cloud IPs. You must allow `0.0.0.0/0` so Render instances can connect to Atlas.
4. **Get Connection String**:
   - Click **Connect** on your cluster -> **Drivers** -> **Python**.
   - Copy the URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/gethire?retryWrites=true&w=majority&appName=GetHire
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

---

## 4. Backend Deployment on Render

### Option A: 1-Click Blueprint (Recommended)

1. Open [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Select your GitHub repository: `Rudra-aa/GetHire`.
4. Render will automatically detect `render.yaml`.
5. Under **Environment Variables**, provide the values for the prompted keys:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string.
   - `GEMINI_API_KEY`: Paste your Google Gemini API key.
   - `REDIS_URL`: *(Optional)* If you have Upstash Redis or a Render Redis instance, paste the URI. If you do not have Redis, leave it blank; the backend automatically degrades gracefully and runs without caching.
6. Click **Apply**.
7. Wait ~2-3 minutes for the build and deployment to complete.
8. Note down your backend URL (e.g., `https://gethire-backend.onrender.com`).

---

### Option B: Manual Web Service Setup

If you prefer configuring the Web Service manually:
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository: `Rudra-aa/GetHire`.
3. Configure the following fields:
   - **Name**: `gethire-backend`
   - **Region**: Closest to your MongoDB Atlas cluster (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan Type**: Free or Starter
4. Under **Advanced** -> **Health Check Path**, enter:
   ```text
   /healthz
   ```
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.9` | Ensures compatible Python runtime |
   | `ENVIRONMENT` | `production` | Enables security middlewares |
   | `ALLOWED_HOSTS` | `*` | Or comma-separated hostnames |
   | `CORS_ORIGINS` | `["https://*.vercel.app","http://localhost:5173"]` | Supports Vercel preview & production URLs |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `MONGODB_DB_NAME` | `gethire` | Database name |
   | `GEMINI_API_KEY` | `AIzaSy...` | Gemini AI API key |
   | `SECRET_KEY` | *(Click Generate)* | Minimum 32-character random string |
   | `REDIS_URL` | *(Optional)* | Redis URL or leave blank |
6. Click **Create Web Service**.

---

### Verify Backend Deployment

Open your terminal or browser:
```bash
# 1. Instant liveness probe
curl https://<your-backend-name>.onrender.com/healthz
# Expected: {"status":"ok","service":"GetHire"}

# 2. Deep dependency health check
curl https://<your-backend-name>.onrender.com/api/v1/health
# Expected: {"status":"healthy", "services": {"database":"connected", ...}}

# 3. Interactive API documentation
# Open in browser: https://<your-backend-name>.onrender.com/docs
```

---

## 5. Frontend Deployment on Vercel

### Step 1: Import Project

1. Open [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Rudra-aa/GetHire`.

### Step 2: Configure Project Settings

In the **Configure Project** screen:
- **Framework Preset**: `Vite`
- **Root Directory**: Click **Edit** and choose `frontend` (or leave as `./` — root `package.json` and `vercel.json` will automatically build the frontend).
- If Root Directory is set to `frontend`:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### Step 3: Add Environment Variables

Expand **Environment Variables** and add:
| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-backend-name>.onrender.com` |

> [!CAUTION]
> Do NOT append a trailing slash to `VITE_API_BASE_URL` (use `https://gethire-backend.onrender.com`, not `https://gethire-backend.onrender.com/`).

### Step 4: Deploy & Configure Deployment Protection

1. Click **Deploy**.
2. Wait ~60 seconds for the build to finish.
3. **Public Access & Deployment Protection**:
   - If your Vercel project is created under a Team account (such as `rp-ai`), Vercel may enable **Deployment Protection** by default on preview URLs, requiring a Vercel login.
   - To make your interview portal publicly accessible to candidates:
     1. In Vercel, go to **Settings** -> **Deployment Protection**.
     2. Under **Vercel Authentication**, toggle it **Disabled** (or configure it only for internal branches).
     3. Save changes.

---

## 6. End-to-End Verification & Smoke Test

Once both backend and frontend are deployed:

1. **Visit Frontend URL**: Open `https://<your-app>.vercel.app` in your browser.
2. **Register a Candidate Account**:
   - Click **Get Started** / **Register**.
   - Fill in name, email, and a password (with uppercase, lowercase, number, special char).
   - Verify that account creation succeeds and redirects to onboarding/dashboard.
3. **Test Session Persistence**:
   - Refresh the browser page (`Cmd+R` / `F5`).
   - The user session should remain active (verified via cross-origin cookie and fallback token).
4. **Launch AI Interview**:
   - Go to **Dashboard** -> select a role (e.g. *Frontend Developer* or *Backend Developer*).
   - Start interview, allow camera/mic permissions, and answer the initial prompt.
   - Verify that Gemini generates conversational AI interview follow-ups.
5. **View & Download Report**:
   - Complete the interview turns and view the radar evaluation breakdown.
   - Click **Download Audit Report (PDF)** to verify server-side PyMuPDF report generation.

---

## 7. Troubleshooting & FAQ

### Cold Starts on Render Free Tier
- Render Free tier instances spin down after 15 minutes of inactivity.
- The first request after spin-down may take **30 to 50 seconds** to wake up.
- Solution: For instantaneous zero-latency responses in production, upgrade the Render web service to the **Starter Plan ($7/mo)** or ping `/healthz` using a free uptime monitor (e.g. UptimeRobot or Cron-job.org) every 10 minutes.

### CORS Errors
- If you see `Access to XMLHttpRequest at '...' from origin 'https://...' has been blocked by CORS policy`:
  1. Check backend `render.yaml` or Render dashboard environment variable `CORS_ORIGINS`.
  2. The backend automatically matches all `https://*.vercel.app` domains via regex in `backend/app/main.py`.
  3. If you are using a custom domain (e.g. `https://myhire.com`), add `https://myhire.com` to `CORS_ORIGINS` in your Render Environment Variables.

### Third-Party Cookies Blocked (Safari / Brave)
- GetHire implements dual-layer session management:
  1. Primary: Secure HttpOnly cookie with `SameSite=None; Secure=True`.
  2. Fallback: Automated token rotation via `x-refresh-token` header and secure local storage.
  Even if the user's browser blocks third-party cookies completely, the session will remain authenticated seamlessly.
