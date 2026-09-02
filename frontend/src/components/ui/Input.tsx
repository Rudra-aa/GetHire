import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  showPasswordToggle?: boolean;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      iconLeft,
      iconRight,
      showPasswordToggle,
      wrapperClassName,
      className,
      id,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const enablePasswordToggle = showPasswordToggle ?? isPassword;
    const computedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {iconLeft && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#39FF88] transition-colors duration-200 z-10">
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={cn(
              "w-full h-14 rounded-2xl bg-white/[0.03] border text-white text-sm",
              "px-4 py-3 placeholder:text-neutral-500",
              "transition-all duration-200",
              "focus:outline-none focus:bg-white/[0.05] focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/25",
              error
                ? "border-[#FF5C5C]/60 focus:border-[#FF5C5C] focus:ring-[#FF5C5C]/20"
                : "border-white/[0.09] hover:border-white/[0.18]",
              iconLeft ? "pl-12" : "pl-4",
              (enablePasswordToggle || iconRight) ? "pr-12" : "pr-4",
              className
            )}
            {...props}
          />

          {enablePasswordToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#39FF88] z-10"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : iconRight ? (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
              {iconRight}
            </span>
          ) : null}
        </div>

        {error && (
          <span className="text-xs text-[#FF5C5C] flex items-center gap-1.5 font-medium" role="alert">
            <span aria-hidden>⚠</span> {error}
          </span>
        )}
        {hint && !error && (
          <span className="text-xs text-neutral-400">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
