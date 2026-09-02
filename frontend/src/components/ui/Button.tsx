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
  "select-none overflow-hidden cursor-pointer border transition-all duration-300 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#39FF88] " +
  "focus-visible:outline-offset-3 disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "gradient-btn-gold text-bg-primary font-bold border-transparent " +
    "shadow-[0_4px_20px_rgba(226,184,74,0.25)] hover:shadow-[0_8px_32px_rgba(226,184,74,0.4)]",
  brandGreen:
    "bg-[#39FF88] text-[#09090B] font-bold border-transparent uppercase tracking-wider " +
    "shadow-[0_0_24px_rgba(57,255,136,0.3)] hover:bg-[#4DFF99] hover:shadow-[0_0_32px_rgba(57,255,136,0.45)]",
  outlineGreen:
    "bg-transparent text-[#39FF88] font-bold border-[#39FF88]/40 uppercase tracking-wider " +
    "hover:border-[#39FF88] hover:bg-[#39FF88]/10 hover:shadow-[0_0_24px_rgba(57,255,136,0.25)]",
  secondary:
    "bg-transparent text-ivory-100 border-white/[0.12] " +
    "hover:border-[#39FF88]/40 hover:bg-white/[0.05] hover:text-white",
  ghost:
    "bg-transparent border-transparent text-graphite-300 " +
    "hover:bg-white/[0.05] hover:text-white",
  danger:
    "bg-transparent border-[#FF5C5C]/30 text-[#FF5C5C] " +
    "hover:bg-[#FF5C5C]/10 hover:border-[#FF5C5C]",
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
