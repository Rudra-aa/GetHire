/**
 * GlassCard.tsx
 * ─────────────
 * Transparent Liquid Glass Container:
 * - Transparent liquid background: rgba(18,22,30,.25) / rgba(255,255,255,.03)
 * - Backdrop filter blur: blur(16px)
 * - Border: 1px solid rgba(255,255,255,.12)
 * - Subtle glass shadow & hover elevation
 */
import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  hoverGlow = true,
  onClick,
  id,
}) => {
  return (
    <motion.div
      id={id}
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border border-[#D0DCE8]/80 bg-white/80 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(38,61,104,0.05),0_2px_6px_-1px_rgba(38,61,104,0.03)] overflow-hidden transition-all duration-300 ${
        hoverGlow ? "hover:bg-white/95 hover:border-[#A8D8C3] hover:shadow-[0_8px_30px_-4px_rgba(38,61,104,0.09)] hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
