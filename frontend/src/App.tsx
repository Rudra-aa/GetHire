/**
 * src/App.tsx
 * -----------
 * Root application component.
 *
 * Responsibilities:
 * - Define the application route tree
 * - Wrap pages in the root layout
 *
 * Routes will expand significantly in Sprint 1 (auth pages, dashboard, etc.).
 */

import { Routes, Route } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import LandingPage from "@/pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        {/* Future routes will be added here as sprints progress:
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interview/:sessionId" element={<InterviewPage />} />
        */}
      </Route>
    </Routes>
  );
}
