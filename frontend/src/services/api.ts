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
// In Docker Compose / local dev with Vite proxy, VITE_API_BASE_URL is empty so
// requests route to the same origin.
// In production (Vercel), VITE_API_BASE_URL points to the Render backend service.
export const PRODUCTION_RENDER_API_URL = "https://gethire-api.onrender.com";

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, "");
    if (clean.endsWith("/api/v1")) {
      clean = clean.substring(0, clean.length - "/api/v1".length);
    }
    return clean.replace(/\/+$/, "");
  }

  // Robust Production Fallback:
  // Prevent any production build from silently falling back to the Vercel domain.
  if (
    import.meta.env.PROD ||
    (typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1"))
  ) {
    return PRODUCTION_RENDER_API_URL;
  }

  return "";
};

export const API_BASE_URL = getApiBaseUrl();

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
        // Trigger refresh token rotation (cookie sent automatically + header/body fallback)
        const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("gethire_refresh_token") : null;
        const headers: Record<string, string> = {};
        if (storedRefreshToken) {
          headers["x-refresh-token"] = storedRefreshToken;
        }

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          storedRefreshToken ? { refresh_token: storedRefreshToken } : {},
          { withCredentials: true, headers }
        );

        const { access_token, refresh_token: newRefreshToken } = refreshResponse.data.data;
        if (newRefreshToken && typeof window !== "undefined") {
          localStorage.setItem("gethire_refresh_token", newRefreshToken);
        }

        // Update store state with new token
        useAuthStore.setState({ accessToken: access_token });

        // Retry the original request with the new access token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshErr) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("gethire_refresh_token");
        }
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
