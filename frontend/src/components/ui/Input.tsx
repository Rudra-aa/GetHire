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
            className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5A6E8C]"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {iconLeft && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3BC] group-focus-within:text-[#A8D8C3] transition-colors duration-200 z-10">
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={cn(
              "w-full h-14 rounded-xl bg-white border text-[#263D68] text-sm",
              "px-4 py-3 placeholder:text-[#8FA3BC]",
              "transition-all duration-200",
              "focus:outline-none focus:border-[#A8D8C3] focus:ring-2 focus:ring-[#A8D8C3]/30",
              error
                ? "border-[#E05C5C]/60 focus:border-[#E05C5C] focus:ring-[#E05C5C]/20"
                : "border-[#D0DCE8] hover:border-[#B9D9EC]",
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8FA3BC] hover:text-[#263D68] transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A8D8C3] z-10"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : iconRight ? (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8FA3BC] z-10">
              {iconRight}
            </span>
          ) : null}
        </div>

        {error && (
          <span className="text-xs text-[#E05C5C] flex items-center gap-1.5 font-medium" role="alert">
            <span aria-hidden>⚠</span> {error}
          </span>
        )}
        {hint && !error && (
          <span className="text-xs text-[#5A6E8C]">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
