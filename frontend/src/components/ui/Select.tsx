import type { SelectHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  iconLeft?: ReactNode;
  options: SelectOption[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      iconLeft,
      options,
      wrapperClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
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

          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-14 rounded-2xl bg-white/[0.03] border text-white text-sm",
              "px-4 py-3 placeholder:text-neutral-500 appearance-none cursor-pointer",
              "transition-all duration-200",
              "focus:outline-none focus:bg-white/[0.05] focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/25",
              error
                ? "border-[#FF5C5C]/60 focus:border-[#FF5C5C] focus:ring-[#FF5C5C]/20"
                : "border-white/[0.09] hover:border-white/[0.18]",
              iconLeft ? "pl-12" : "pl-4",
              "pr-10",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#111217] text-white py-2"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#39FF88] transition-colors duration-200">
            <ChevronDown className="h-4 w-4" />
          </span>
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

Select.displayName = "Select";
export default Select;
