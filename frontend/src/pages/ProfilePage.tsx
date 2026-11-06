import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SessionSidebar } from "@/components/common/SessionSidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ResetProgressModal } from "@/components/dashboard/ResetProgressModal";
import { Save, User, ArrowLeft, RotateCcw } from "lucide-react";

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  avatarUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  targetRole: z.string().min(1, "Please select a target job role"),
  experienceLevel: z.enum(["entry", "mid", "senior"]),
  linkedinUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

type ProfileFields = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUserState } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.full_name || "",
      avatarUrl: user?.profile_photo || user?.avatar_url || "",
      targetRole: user?.target_role || "Frontend Developer",
      experienceLevel: (user?.experience_level as "entry" | "mid" | "senior") || "entry",
      linkedinUrl: user?.linkedin_url || "",
    },
  });

  async function onSubmit(data: ProfileFields) {
    setApiError(null);
    setSuccessMsg(null);
    try {
      const response = await apiClient.patch("/api/v1/users/me", {
        full_name: data.fullName,
        profile_photo: data.avatarUrl || null,
        target_role: data.targetRole,
        experience_level: data.experienceLevel,
        linkedin_url: data.linkedinUrl || null,
      });

      const { user: updatedUser } = response.data.data;
      updateUserState(updatedUser);
      setSuccessMsg("Your profile was updated successfully.");
    } catch (err: any) {
      const errMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update profile.";
      setApiError(errMsg);
    }
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 relative z-10 text-[#263D68]">
      {/* Top Back Control */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E4EDF5]">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-xs font-semibold text-[#263D68] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Workspace</span>
        </button>
        <span className="text-xs font-mono text-[#5A6E8C]">Settings & Profile</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Summary */}
        <div className="md:col-span-1">
          <SessionSidebar />
        </div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2"
        >
          <div className="bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass p-8 rounded-2xl flex flex-col gap-6 h-full">
            <div>
              <h1 className="text-xl font-bold text-[#263D68] mb-1.5">
                Profile Management
              </h1>
              <p className="text-xs text-[#5A6E8C]">
                Keep your target profile updated to receive aligned technical question sets during practice simulations.
              </p>
            </div>

          {apiError && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs">
              {apiError}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl border border-[#A8D8C3] bg-[#F0FAF5] text-[#1E8C5A] text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              iconLeft={<User className="h-4 w-4" />}
              error={errors.fullName?.message}
              placeholder="Candidate Name"
              {...register("fullName")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label font-bold uppercase tracking-[0.1em] text-[#5A6E8C]">
                  Target Job Role
                </label>
                <select
                  {...register("targetRole")}
                  className="w-full rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 text-[#263D68] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8D8C3]/50 transition-all"
                >
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                </select>
                {errors.targetRole && <span className="text-xs text-danger">{errors.targetRole.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label font-bold uppercase tracking-[0.1em] text-[#5A6E8C]">
                  Experience Level
                </label>
                <select
                  {...register("experienceLevel")}
                  className="w-full rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 text-[#263D68] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8D8C3]/50 transition-all"
                >
                  <option value="entry">Entry Level (0-2 yrs)</option>
                  <option value="mid">Mid Level (2-5 yrs)</option>
                  <option value="senior">Senior Level (5+ yrs)</option>
                </select>
              </div>
            </div>

            <Input
              label="Avatar Image URL"
              type="text"
              placeholder="https://example.com/avatar.png"
              error={errors.avatarUrl?.message}
              {...register("avatarUrl")}
            />

            <Input
              label="LinkedIn Profile URL"
              type="text"
              placeholder="https://linkedin.com/in/username"
              error={errors.linkedinUrl?.message}
              {...register("linkedinUrl")}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-2"
              icon={<Save className="h-4 w-4" />}
              magnetic
            >
              Save Changes
            </Button>
          </form>

          {/* Display & Theme Preferences */}
          <div className="pt-6 border-t border-[#E4EDF5] flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#263D68] font-display">
                Display & Theme
              </h2>
              <p className="text-xs text-[#5A6E8C] mt-0.5">
                Switch between high-contrast dark mode and premium SaaS light mode.
              </p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#263D68]">Interface Theme</span>
                <span className="text-[11px] text-[#5A6E8C]">Settings persist across your entire workspace</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-6 border-t border-[#E4EDF5] flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-bold text-amber-600 font-display">
                Start from Beginning
              </h2>
              <p className="text-xs text-[#5A6E8C] mt-0.5">
                Reset in-progress sessions to practice from Step 1. Completed historical reports and profile data are safely preserved.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#263D68]">Reset Active Progression</span>
                <span className="text-[11px] text-[#5A6E8C] max-w-md">
                  Clears active assessments and uncompleted mock interviews so you can start a fresh session.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Progress</span>
              </button>
            </div>
          </div>
          </div>
        </motion.div>
      </div>

      <ResetProgressModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onResetSuccess={() => {
          setSuccessMsg("Active progress has been safely reset. You can now start fresh from Step 1.");
        }}
      />
    </div>
  );
}
