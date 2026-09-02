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
import { useAuthStore } from "@/store/authStore";

// ── Base URL ──────────────────────────────────────────────────────────────
//
// In Docker Compose, the Vite dev server proxies /api/* to the backend, so we
// use a relative base URL. This is set to an empty string so that requests go
// to the same origin, and the Vite proxy handles the forwarding.
//
// In production (Vercel), VITE_API_BASE_URL should point to the Render backend.
const rawApiUrl = (import.meta as any).env["VITE_API_BASE_URL"] ?? "";
const API_BASE_URL = typeof rawApiUrl === "string" ? rawApiUrl.trim().replace(/\/+$/, "") : "";

// ── Axios Instance ────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45_000, // 45 seconds — robust for multi-signal LLM turn processing and evaluations
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // required for HttpOnly refresh token cookies
});

// ── Request Interceptor ───────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────

interface CustomAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig & typeof error.config;
    const requestUrl = originalRequest?.url || "";

    const isAuthEndpoint =
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/logout");

    // Check if error is 401 (Unauthorized), not retried yet, and not an auth endpoint
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Trigger refresh token rotation (cookie sent automatically)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = refreshResponse.data.data;

        // Update store state with new token
        useAuthStore.setState({ accessToken: access_token });

        // Retry the original request with the new access token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Refresh token failed (e.g. expired or revoked)
        useAuthStore.setState({
          accessToken: null,
          user: null,
          loading: false,
          isInitializing: false,
          error: "Your session has expired. Please log in again.",
        });

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
