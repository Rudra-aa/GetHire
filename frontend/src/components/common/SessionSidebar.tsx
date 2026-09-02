import { useNavigate } from "react-router-dom";
import { LogOut, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

export function SessionSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const avatarUrl = user?.profile_photo || user?.avatar_url;
  const fullName = user?.full_name || "GetHire Candidate";
  const isVerified = user?.is_verified ?? user?.email_verified ?? false;

  return (
    <div className="glass-card-luxury p-6 rounded-3xl flex flex-col gap-6 h-full">
      {/* Avatar details */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-20 h-20 rounded-full border border-white/10 bg-bg-secondary overflow-hidden flex items-center justify-center text-3xl font-bold text-gold-400">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            fullName[0]?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <h2 className="text-base font-bold text-neutral-50">
            {fullName}
          </h2>
          <span className="eyebrow-pill text-[10px] py-0.5 px-2.5 mt-2 inline-flex">
            {user?.target_role || user?.role || "Candidate"}
          </span>
        </div>
      </div>

      {/* Account Details */}
      <div className="flex flex-col gap-3.5 border-t border-white/10 pt-5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500">Email</span>
          <span className="text-neutral-200 font-medium truncate max-w-[140px]" title={user?.email}>
            {user?.email}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-500">Verified</span>
          <span className={`font-semibold flex items-center gap-1 ${isVerified ? "text-emerald-400" : "text-amber-400"}`}>
            {isVerified ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Verified
              </>
            ) : (
              <>
                <ShieldAlert className="h-3 w-3" /> Pending
              </>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-500">Level</span>
          <span className="text-neutral-300 capitalize">
            {user?.experience_level || "Entry"}
          </span>
        </div>
      </div>

      {/* Logout Action */}
      <Button
        variant="danger"
        size="sm"
        onClick={handleLogout}
        className="w-full mt-auto"
        icon={<LogOut className="h-3.5 w-3.5" />}
      >
        Sign Out
      </Button>
    </div>
  );
}

export default SessionSidebar;
