import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, accessToken, error, clearError } = useAuthStore();

  const fromLocation = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const destination = fromLocation && fromLocation.pathname
    ? `${fromLocation.pathname}${fromLocation.search || ""}`
    : "/dashboard";
  const flashMessage = (location.state as { message?: string } | null)?.message || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  if (accessToken) {
    return <Navigate to={destination} replace />;
  }

  async function onSubmit(data: LoginFields) {
    const success = await login(data.email, data.password);
    if (success) {
      navigate(destination, { replace: true });
    }
  }

  return (
    <AuthLayout
      mode="login"
      error={error}
      onClearError={clearError}
      flashMessage={flashMessage}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          iconLeft={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          placeholder="you@example.com"
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          iconLeft={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          placeholder="••••••••"
          {...register("password")}
        />

        <Button
          type="submit"
          variant="brandGreen"
          size="xl"
          loading={isSubmitting}
          className="w-full mt-3"
          icon={<LogIn className="h-4 w-4" />}
        >
          SIGN IN
        </Button>
      </form>
    </AuthLayout>
  );
}
