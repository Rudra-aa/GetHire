/**
 * src/main.tsx
 * ------------
 * React application entry point.
 *
 * Responsibilities:
 * - Mount the React tree to the DOM
 * - Import global styles (Tailwind + custom base styles)
 * - Wrap the app in providers (Router, etc.)
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@/styles/globals.css";
import App from "./App";

// ── Mount ────────────────────────────────────────────────────────────────

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element with id='root' was not found in the document. " +
      "Check your index.html."
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
