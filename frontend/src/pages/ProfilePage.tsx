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
import { Save, User, ArrowLeft } from "lucide-react";

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
    <div className="max-w-5xl mx-auto flex flex-col gap-6 relative z-10 text-neutral-300">
      {/* Top Back Control */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Workspace</span>
        </button>
        <span className="text-xs font-mono text-neutral-500">Settings & Profile</span>
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
          <div className="glass-card-luxury p-8 rounded-3xl flex flex-col gap-6 h-full">
            <div>
              <h1 className="text-xl font-bold text-ivory-100 mb-1.5">
                Profile Management
              </h1>
              <p className="text-xs text-graphite-400">
                Keep your target profile updated to receive aligned technical question sets during practice simulations.
              </p>
            </div>

          {apiError && (
            <div className="p-3 rounded-xl border border-danger/20 bg-danger/5 text-danger text-xs">
              {apiError}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs">
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
                <label className="text-label font-bold uppercase tracking-[0.1em] text-neutral-300">
                  Target Job Role
                </label>
                <select
                  {...register("targetRole")}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-neutral-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition-all"
                >
                  <option value="Frontend Developer" className="bg-[#111113] text-ivory-100">Frontend Developer</option>
                  <option value="Backend Developer" className="bg-[#111113] text-ivory-100">Backend Developer</option>
                  <option value="AI/ML Engineer" className="bg-[#111113] text-ivory-100">AI/ML Engineer</option>
                  <option value="DevOps Engineer" className="bg-[#111113] text-ivory-100">DevOps Engineer</option>
                  <option value="Fullstack Developer" className="bg-[#111113] text-ivory-100">Fullstack Developer</option>
                </select>
                {errors.targetRole && <span className="text-xs text-danger">{errors.targetRole.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label font-bold uppercase tracking-[0.1em] text-neutral-300">
                  Experience Level
                </label>
                <select
                  {...register("experienceLevel")}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-neutral-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition-all"
                >
                  <option value="entry" className="bg-[#111113] text-ivory-100">Entry Level (0-2 yrs)</option>
                  <option value="mid" className="bg-[#111113] text-ivory-100">Mid Level (2-5 yrs)</option>
                  <option value="senior" className="bg-[#111113] text-ivory-100">Senior Level (5+ yrs)</option>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
