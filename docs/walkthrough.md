# Sprint 1 Walkthrough — Identity & Access Management (IAM)

This walkthrough documents the technical architecture, implementation, and verification steps of Sprint 1 (IAM) for the GetHire platform.

---

## 1. Technical Accomplishments

We have successfully implemented a complete, secure authentication and authorization system using **FastAPI Native Dependency Injection** and a future-proof **separated MongoDB database schema**.

### 🗄️ Database Changes (MongoDB)
We split the user representation into 5 distinct collections to keep authentication details, profile info, sessions, and audits independent:
1. **`users`:** Holds security credentials (email, bcrypt password hash, role="candidate", status="active", `email_verified=False`, `refresh_token_version=1`).
2. **`user_profiles`:** Stores candidate profiles (`full_name`, `avatar_url`, `target_role`, `experience_level`, `linkedin_url`).
3. **`auth_refresh_tokens`:** Stores rotated refresh tokens with generation family tracker (`jti`, `token_family`, `expires_at`, `is_revoked`).
4. **`user_sessions`:** Logs active logins with device indicators (`device_name`, `browser`, `operating_system`, `ip_address`, `country`, `is_active`).
5. **`audit_logs`:** Generic, immutable, append-only logs for all modules (`event`, `module`, `severity`, `user_id`, `metadata`, `timestamp`).

### 🔑 Security & Authentication (FastAPI)
- **FastAPI Dependency Injection:** Integrated `get_current_user`, `get_current_active_user`, `require_roles`, and `get_current_session_info` using FastAPI `Depends()`. Auth runs strictly on protected endpoints.
- **Access Tokens:** Signed with HS256, 15-minute expiration, containing `sub` (user_id), `role`, `jti`, and `exp`. Stored strictly in-memory on the client.
- **Refresh Tokens:** Signed with HS256, 7-day expiration, containing `token_family`. Stored inside `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- **Refresh Token Rotation (RTR) & Replay Prevention:** If an already-rotated refresh token JTI is reused, the entire token family is invalidated and all sessions for the user are immediately revoked.
- **Password Protection:** Plaintext passwords are never stored; hashing and verification are performed using strong `bcrypt` salts.
- **Redis Rate Limiting:** Global rate limit middleware intercepts requests to `/auth/login` (max 10/min), `/auth/register` (max 5/hr), `/auth/refresh` (max 30/hr).

### 🖥️ Frontend (React & TypeScript)
- **Zustand Auth Store:** Manages `accessToken` state in-memory. Hydrates user and active session data on boot using `checkSession` calling `/auth/session`.
- **Axios Interceptors:**
  - *Request:* Automatically attaches `Authorization: Bearer <token>` to protected API calls.
  - *Response:* Catches `401 Unauthorized` responses and silently requests `/auth/refresh` to rotate tokens and retry the original request.
- **Forms & Validation:** Integrated Zod validation schemas for Login, Register (including target job role drop-down), and Profile pages.
- **ProtectedRoute Guard:** Prevents unauthorized navigation to pages and supports RBAC checks.

---

## 2. API Endpoint Implementations

All endpoints return a standardized success or error envelope.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Public | Account creation (auto-assigns "candidate" role, sets target role). |
| `/api/v1/auth/login` | `POST` | Public | Credentials verify, issues JWTs, sets HttpOnly cookie, logs session. |
| `/api/v1/auth/refresh` | `POST` | Public | Cookie-based refresh token rotation. |
| `/api/v1/auth/logout` | `POST` | Private | Revokes active token, terminates session, deletes cookie. |
| `/api/v1/auth/session` | `GET` | Public | Hydration endpoint returning login state and session info. |
| `/api/v1/users/me` | `GET` | Private | Returns active user and profile details. |
| `/api/v1/users/me` | `PATCH` | Private | Updates editable profile fields. |

---

## 3. Manual Verification Steps

Verify your local environment using the following checklist:

1. **Start Environment:**
   ```bash
   cp env.example .env
   docker compose up --build
   ```
2. **Access Frontend:**
   Go to [http://localhost:5173](http://localhost:5173). You will see the new **Register**, **Sign In**, and **Go to Profile** options.
3. **Register Candidate:**
   Select **Register**, fill in details, select a Target Job Role, and click Sign Up.
4. **Sign In:**
   Log in with the registered credentials. You will be redirected to the Profile Page.
5. **Verify Cookie Security:**
   Open Chrome DevTools → Application → Cookies. Verify `refresh_token` has:
   - `HttpOnly` checked
   - `Secure` checked
   - `SameSite` set to `Lax`
6. **Rehydrate Session:**
   Refresh the profile page tab. Verify that the app hydrates state silently by calling `/auth/session` and `/auth/refresh` without prompting you to log in again.
7. **Logout:**
   Click Sign Out. Verify the cookie is deleted and you are redirected to the login page.
