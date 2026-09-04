/**
 * frontend/src/store/authStore.ts
 * -------------------------------
 * Zustand Auth Store for GetHire Production IAM Foundation.
 */

import { create } from "zustand";
import apiClient from "@/services/api";

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
  profile_photo: string | null;
  resume_uploaded: boolean;
  onboarding_completed: boolean;
  role: string;
  target_role: string | null;
  experience_level: string | null;
  linkedin_url: string | null;
  // Aliases for component convenience
  email_verified?: boolean;
  avatar_url?: string | null;
}

export interface AuthState {
  accessToken: string | null;
  user: UserSummary | null;
  loading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateUserState: (updatedFields: Partial<UserSummary>) => void;
  clearError: () => void;
}

// ── Zustand Store ──────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  loading: true,
  isInitializing: true,
  error: null,

  login: async (email, password) => {
    set({ error: null });
    try {
      const response = await apiClient.post("/api/v1/auth/login", { email, password });
      const { access_token, user, refresh_token } = response.data.data;

      if (refresh_token && typeof window !== "undefined") {
        localStorage.setItem("gethire_refresh_token", refresh_token);
      }

      // Ensure convenience aliases
      const normalizedUser: UserSummary = {
        ...user,
        email_verified: user.is_verified,
        avatar_url: user.profile_photo,
      };

      set({
        accessToken: access_token,
        user: normalizedUser,
        loading: false,
        isInitializing: false,
      });
      return true;
    } catch (err: any) {
      console.error("Login submission failed:", err);
      const data = err.response?.data;
      let errMsg = "Login failed. Check your credentials.";

      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        errMsg = data.errors.map((e: any) => e.message || e.msg).filter(Boolean).join(". ");
      } else if (Array.isArray(data?.detail) && data.detail.length > 0) {
        errMsg = data.detail.map((d: any) => d.msg || d.message).filter(Boolean).join(". ");
      } else if (typeof data?.detail === "string" && data.detail.trim()) {
        errMsg = data.detail;
      } else if (typeof data?.detail?.message === "string" && data.detail.message.trim()) {
        errMsg = data.detail.message;
      } else if (typeof data?.error?.message === "string" && data.error.message.trim()) {
        errMsg = data.error.message;
      } else if (typeof data?.message === "string" && data.message.trim()) {
        errMsg = data.message;
      } else if (err.message) {
        errMsg = err.message;
      }

      set({ error: errMsg });
      return false;
    }
  },

  logout: async () => {
    try {
      const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("gethire_refresh_token") : null;
      await apiClient.post(
        "/api/v1/auth/logout",
        storedRefreshToken ? { refresh_token: storedRefreshToken } : {},
        storedRefreshToken ? { headers: { "x-refresh-token": storedRefreshToken } } : {}
      );
    } catch {
      // Ignore network errors during logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("gethire_refresh_token");
      }
      set({
        accessToken: null,
        user: null,
        loading: false,
        isInitializing: false,
        error: null,
      });
    }
  },

  checkSession: async () => {
    set({ isInitializing: true, loading: true });
    try {
      // 1. Refresh token first using HttpOnly cookie (or localStorage fallback header/body)
      const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("gethire_refresh_token") : null;
      const headers: Record<string, string> = {};
      if (storedRefreshToken) {
        headers["x-refresh-token"] = storedRefreshToken;
      }

      const refreshRes = await apiClient.post(
        "/api/v1/auth/refresh",
        storedRefreshToken ? { refresh_token: storedRefreshToken } : {},
        { headers }
      );
      const { access_token, refresh_token: newRefreshToken } = refreshRes.data.data;

      if (newRefreshToken && typeof window !== "undefined") {
        localStorage.setItem("gethire_refresh_token", newRefreshToken);
      }

      if (access_token) {
        set({ accessToken: access_token });

        // 2. Fetch authenticated user profile using active access token
        const sessionRes = await apiClient.get("/api/v1/auth/session");
        const { authenticated, user } = sessionRes.data.data;

        if (authenticated && user) {
          const normalizedUser: UserSummary = {
            ...user,
            email_verified: user.is_verified,
            avatar_url: user.profile_photo,
          };

          set({
            user: normalizedUser,
            accessToken: access_token,
            loading: false,
            isInitializing: false,
          });
          return;
        }
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("gethire_refresh_token");
      }
      set({ user: null, accessToken: null, loading: false, isInitializing: false });
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("gethire_refresh_token");
      }
      set({ user: null, accessToken: null, loading: false, isInitializing: false });
    }
  },

  updateUserState: (updatedFields) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null,
    }));
  },

  clearError: () => set({ error: null }),
}));
