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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-[#D0DCE8]" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-[#A8D8C3] border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-[#5A6E8C] font-sans tracking-widest font-semibold uppercase">
            Authenticating Session...
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
