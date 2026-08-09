import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ── Backend target for the dev proxy ──────────────────────────────────────
// Inside Docker Compose:  backend (the service name resolves via Docker DNS)
// Running locally (no Docker): localhost
//
// Set VITE_BACKEND_HOST=localhost in your shell when running outside Docker:
//   VITE_BACKEND_HOST=localhost npm run dev
const backendHost = process.env["VITE_BACKEND_HOST"] ?? "backend";
const backendTarget = `http://${backendHost}:8000`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path alias — allows `import { foo } from "@/components/foo"` instead of
  // relative paths like `../../components/foo`.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Development server configuration
  server: {
    host: "0.0.0.0",    // Listen on all interfaces inside Docker
    port: 5173,
    strictPort: true,   // Fail if port 5173 is already in use

    // Proxy /api/* → FastAPI backend.
    // Eliminates CORS issues in the browser during local development.
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
