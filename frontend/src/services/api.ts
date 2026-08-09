/**
 * src/services/api.ts
 * -------------------
 * Centralised Axios instance for all GetHire API calls.
 *
 * Design decisions:
 * - All API calls go through this single instance so that authentication
 *   headers, base URL, and error handling are configured in one place.
 * - The base URL is read from an environment variable so it can differ
 *   between local development, Docker Compose, staging, and production.
 * - Response interceptors are set up here for future token refresh logic
 *   (Sprint 2 — Auth).
 */

import axios, { type AxiosError, type AxiosResponse } from "axios";

// ── Base URL ──────────────────────────────────────────────────────────────
//
// In Docker Compose, the Vite dev server proxies /api/* to the backend, so we
// use a relative base URL. This is set to an empty string so that requests go
// to the same origin, and the Vite proxy handles the forwarding.
//
// In production (Vercel), VITE_API_BASE_URL should point to the Render backend.
const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "";

// ── Axios Instance ────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000, // 15 seconds — generous enough for LLM-backed endpoints
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // required for HttpOnly refresh token cookies
});

// ── Request Interceptor ───────────────────────────────────────────────────
//
// Placeholder for adding Authorization header once auth is implemented.
// In Sprint 2, this will attach the JWT access token from the Zustand store.

apiClient.interceptors.request.use(
  (config) => {
    // TODO Sprint 2 — Auth: attach access token
    // const { accessToken } = useAuthStore.getState();
    // if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────
//
// Placeholder for handling 401 responses (token refresh) once auth is added.

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // TODO Sprint 2 — Auth: handle 401 → refresh token → retry
    return Promise.reject(error);
  }
);

export default apiClient;
