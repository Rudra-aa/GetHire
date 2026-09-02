import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import AppShell from "@/layouts/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const InterviewPage = lazy(() => import("@/pages/InterviewPage").then((m) => ({ default: m.InterviewPage })));
const EvaluationPage = lazy(() => import("@/pages/EvaluationPage").then((m) => ({ default: m.EvaluationPage })));
const AssessmentPage = lazy(() => import("@/pages/AssessmentPage").then((m) => ({ default: m.AssessmentPage })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-t-[#39FF88] animate-spin" />
        </div>
        <p className="text-xs text-[#39FF88] font-mono tracking-widest font-semibold">
          LOADING GETHIRE AI OS...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { checkSession, loading, isInitializing } = useAuthStore();

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  if (isInitializing || loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing & Authentication routes */}
        <Route element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected OS App Shell (AppShell owns sidebar layout reservation) */}
        <Route element={<ProtectedRoute allowedRoles={["candidate", "admin"]} />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/assessment/:sessionId" element={<AssessmentPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/interview/:sessionId" element={<InterviewPage />} />
            <Route path="/interview/:sessionId/evaluation" element={<EvaluationPage />} />
          </Route>
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
}
