import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/services/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { User, Mail, Lock, UserPlus, Briefcase, Award } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => /[A-Z]/.test(val), "Must contain an uppercase letter")
      .refine((val) => /[a-z]/.test(val), "Must contain a lowercase letter")
      .refine((val) => /[0-9]/.test(val), "Must contain a number")
      .refine((val) => /[!@#$%^&*]/.test(val), "Must contain a special character (!@#$%^&*)"),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be under 100 characters"),
    targetRole: z.string().min(1, "Please select a target job role"),
    experienceLevel: z.enum(["entry", "mid", "senior"]),
    linkedinUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

const targetRoleOptions = [
  { value: "", label: "Select target role..." },
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Backend Developer", label: "Backend Developer" },
  { value: "AI/ML Engineer", label: "AI/ML Engineer" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
  { value: "Fullstack Developer", label: "Fullstack Developer" },
];

const experienceLevelOptions = [
  { value: "entry", label: "Entry Level (0-2 yrs)" },
  { value: "mid", label: "Mid Level (2-5 yrs)" },
  { value: "senior", label: "Senior Level (5+ yrs)" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: { experienceLevel: "entry" },
  });

  if (accessToken) {
    return <Navigate to="/profile" replace />;
  }

  async function onSubmit(data: RegisterFields) {
    setApiError(null);
    try {
      await apiClient.post("/api/v1/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        target_role: data.targetRole,
        experience_level: data.experienceLevel,
        linkedin_url: data.linkedinUrl || null,
      });
      navigate("/login", {
        state: { message: "Account created successfully. Please sign in." },
      });
    } catch (err: any) {
      console.error("Registration submission failed:", err);
      const dataResp = err.response?.data;
      let errMsg = "Registration failed.";

      if (Array.isArray(dataResp?.errors) && dataResp.errors.length > 0) {
        errMsg = dataResp.errors.map((e: any) => e.message || e.msg).filter(Boolean).join(". ");
      } else if (Array.isArray(dataResp?.detail) && dataResp.detail.length > 0) {
        errMsg = dataResp.detail.map((d: any) => d.msg || d.message).filter(Boolean).join(". ");
      } else if (typeof dataResp?.detail === "string" && dataResp.detail.trim()) {
        errMsg = dataResp.detail;
      } else if (typeof dataResp?.detail?.message === "string" && dataResp.detail.message.trim()) {
        errMsg = dataResp.detail.message;
      } else if (typeof dataResp?.error?.message === "string" && dataResp.error.message.trim()) {
        errMsg = dataResp.error.message;
      } else if (typeof dataResp?.message === "string" && dataResp.message.trim()) {
        errMsg = dataResp.message;
      } else if (err.message) {
        errMsg = err.message;
      }

      setApiError(errMsg);
    }
  }

  return (
    <AuthLayout
      mode="register"
      error={apiError}
      onClearError={() => setApiError(null)}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name Field */}
        <Input
          label="Full Name"
          type="text"
          iconLeft={<User className="h-4 w-4" />}
          error={errors.fullName?.message}
          placeholder="Alice Johnson"
          {...register("fullName")}
        />

        {/* Email Address Field */}
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          iconLeft={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          placeholder="alice@example.com"
          {...register("email")}
        />

        {/* Target Role & Experience Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target Role"
            iconLeft={<Briefcase className="h-4 w-4" />}
            options={targetRoleOptions}
            error={errors.targetRole?.message}
            {...register("targetRole")}
          />

          <Select
            label="Experience Level"
            iconLeft={<Award className="h-4 w-4" />}
            options={experienceLevelOptions}
            error={errors.experienceLevel?.message}
            {...register("experienceLevel")}
          />
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            iconLeft={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            placeholder="••••••••"
            {...register("password")}
          />

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            iconLeft={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
        </div>

        {/* Primary CTA Submit Button */}
        <Button
          type="submit"
          variant="brandGreen"
          size="xl"
          loading={isSubmitting}
          className="w-full mt-3"
          icon={<UserPlus className="h-4 w-4" />}
        >
          SIGN UP
        </Button>
      </form>
    </AuthLayout>
  );
}
