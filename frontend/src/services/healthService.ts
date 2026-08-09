/**
 * src/services/healthService.ts
 * ------------------------------
 * API calls for the health check endpoint.
 *
 * Consumed by the LandingPage component to display backend and database
 * status in the development dashboard.
 */

import apiClient from "./api";
import type { HealthResponse } from "@/types";

/**
 * Fetch the backend health status.
 *
 * Returns the parsed HealthResponse on success, or null if the backend
 * is unreachable (network error, DNS failure, etc.).
 */
export async function fetchHealth(): Promise<HealthResponse | null> {
  try {
    const response = await apiClient.get<HealthResponse>("/api/v1/health");
    return response.data;
  } catch {
    // Backend is unreachable — return null so the UI can show a clear error
    return null;
  }
}
