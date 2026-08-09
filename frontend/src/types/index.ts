/**
 * src/types/index.ts
 * ------------------
 * Shared TypeScript type definitions for GetHire.
 *
 * These types mirror the API response schemas documented in docs/API_SPEC.md.
 * As the API evolves, update these types to match.
 */

// ── Health Check ──────────────────────────────────────────────────────────

export interface ServiceStatus {
  /** MongoDB connectivity: "connected" | "unreachable" */
  database: string;
  /** Redis connectivity: "connected" | "unreachable" */
  redis: string;
}

export interface HealthResponse {
  /** Overall status: "healthy" | "degraded" | "unhealthy" */
  status: "healthy" | "degraded" | "unhealthy";
  /** Application name */
  service: string;
  /** Semantic version string */
  version: string;
  /** Runtime environment */
  environment: string;
  /** Seconds since the backend process started */
  uptime_seconds: number;
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** Individual dependency statuses */
  services: ServiceStatus;
}

// ── API Error Envelope ────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown>;
  request_id: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
