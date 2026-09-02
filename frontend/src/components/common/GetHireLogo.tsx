import React from "react";
import { Link } from "react-router-dom";

export interface GetHireLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  to?: string;
  className?: string;
  onClick?: () => void;
}

export const GetHireLogo: React.FC<GetHireLogoProps> = ({
  size = "md",
  showText = true,
  to,
  className = "",
  onClick,
}) => {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const svgSizes = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const logoContent = (
    <div className={`flex items-center gap-2.5 shrink-0 group ${className}`} onClick={onClick}>
      <span
        className={`flex ${iconSizes[size]} items-center justify-center rounded-xl bg-emerald-500/20 text-[#39FF88] border border-[#39FF88]/30 shadow-[0_0_16px_rgba(57,255,136,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(57,255,136,0.5)] transition-all duration-200 shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={svgSizes[size]}
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {showText && (
        <span
          className={`font-sans ${textSizes[size]} font-extrabold tracking-tight text-white group-hover:text-[#39FF88] transition-colors`}
        >
          GetHire
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} aria-label="GetHire Home" className="inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default GetHireLogo;
