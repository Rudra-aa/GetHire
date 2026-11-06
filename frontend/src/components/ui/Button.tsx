import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode, MouseEvent } from "react";
import { useRef } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "brandGreen" | "outlineGreen";
type Size    = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  children:   ReactNode;
  loading?:   boolean;
  icon?:      ReactNode;
  iconRight?: ReactNode;
  magnetic?:  boolean;
}

const baseStyles =
  "relative inline-flex items-center justify-center gap-2.5 font-semibold tracking-tight " +
  "select-none overflow-hidden cursor-pointer border transition-all duration-250 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A8D8C3] " +
  "focus-visible:outline-offset-3 disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "gradient-btn-gold text-[#1A2D52] font-bold border-transparent " +
    "shadow-[0_2px_8px_rgba(168,216,195,0.40)] hover:shadow-[0_4px_16px_rgba(168,216,195,0.55)]",
  brandGreen:
    "bg-[#A8D8C3] text-[#1A2D52] font-bold border-transparent " +
    "hover:bg-[#77C4A2] shadow-[0_2px_8px_rgba(168,216,195,0.35)] hover:shadow-[0_4px_14px_rgba(168,216,195,0.50)]",
  outlineGreen:
    "bg-transparent text-[#1E8C5A] font-semibold border-[#A8D8C3] " +
    "hover:border-[#77C4A2] hover:bg-[#A8D8C3]/20",
  secondary:
    "bg-transparent text-[#263D68] border-[#D0DCE8] " +
    "hover:border-[#B9D9EC] hover:bg-[#B9D9EC]/20 hover:text-[#1A2D52]",
  ghost:
    "bg-transparent border-transparent text-[#5A6E8C] " +
    "hover:bg-[#F0F5F9] hover:text-[#263D68]",
  danger:
    "bg-transparent border-[#E05C5C]/30 text-[#E05C5C] " +
    "hover:bg-[#E05C5C]/10 hover:border-[#E05C5C]",
};

const sizes: Record<Size, string> = {
  sm: "h-9  px-4  text-xs rounded-full",
  md: "h-11 px-6  text-xs rounded-full",
  lg: "h-13 px-8  text-sm rounded-full",
  xl: "h-14 px-8  text-sm rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  icon,
  iconRight,
  magnetic = false,
  className,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!magnetic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={btnRef}
      style={magnetic ? { x: springX, y: springY } : undefined}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...(props as any)}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}

      <span className="relative z-10">{children}</span>
      {iconRight && <span className="relative z-10">{iconRight}</span>}
    </motion.button>
  );
}

export default Button;
