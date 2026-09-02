import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { accessToken, user, isInitializing, loading } = useAuthStore();
  const location = useLocation();

  if (isInitializing || loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-t-[#39FF88] animate-spin" />
          </div>
          <p className="text-xs text-[#39FF88] font-mono tracking-widest font-semibold">
            AUTHENTICATING SESSION...
          </p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
