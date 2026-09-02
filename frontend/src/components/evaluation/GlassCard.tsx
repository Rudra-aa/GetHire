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
      className={`relative rounded-[24px] border border-white/[0.12] bg-[#12161E]/30 backdrop-blur-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ${
        hoverGlow ? "hover:border-white/20 hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)] hover:-translate-y-0.5" : ""
      } ${className}`}
      style={{
        background: "rgba(18, 22, 30, 0.30)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Top subtle glass highlight shine */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {children}
    </motion.div>
  );
};
