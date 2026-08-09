/**
 * src/layouts/RootLayout.tsx
 * --------------------------
 * Root layout wrapper that wraps all pages.
 *
 * In Sprint 0 this is minimal — just renders the page outlet.
 * In Sprint 1 this will include the navigation header and footer.
 */

import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <>
      {/* Sprint 1: <Header /> will be added here */}
      <Outlet />
      {/* Sprint 1: <Footer /> will be added here */}
    </>
  );
}
