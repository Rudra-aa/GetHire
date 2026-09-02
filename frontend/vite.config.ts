import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ── Backend target for the dev proxy ──────────────────────────────────────
// Inside Docker Compose:  Set VITE_BACKEND_HOST=backend
// Running locally (no Docker): Defaults to localhost:8000
const backendHost = process.env["VITE_BACKEND_HOST"] ?? "127.0.0.1";
const backendPort = process.env["VITE_BACKEND_PORT"] ?? "8000";
const backendTarget = `http://${backendHost}:${backendPort}`;

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
    host: "127.0.0.1",  // Listen on IPv4 loopback
    port: 5173,
    strictPort: false,   // Fall back to next available port if busy

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
