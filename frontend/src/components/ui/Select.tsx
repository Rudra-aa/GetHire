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

          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-14 rounded-xl bg-white border text-[#263D68] text-sm",
              "px-4 py-3 placeholder:text-[#8FA3BC] appearance-none cursor-pointer",
              "transition-all duration-200",
              "focus:outline-none focus:border-[#A8D8C3] focus:ring-2 focus:ring-[#A8D8C3]/30",
              error
                ? "border-[#E05C5C]/60 focus:border-[#E05C5C] focus:ring-[#E05C5C]/20"
                : "border-[#D0DCE8] hover:border-[#B9D9EC]",
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
                className="bg-white text-[#263D68] py-2"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8FA3BC] group-focus-within:text-[#263D68] transition-colors duration-200">
            <ChevronDown className="h-4 w-4" />
          </span>
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

Select.displayName = "Select";
export default Select;
