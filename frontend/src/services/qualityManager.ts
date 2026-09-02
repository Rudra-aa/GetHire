import { create } from "zustand";

export type QualityTier = "high" | "medium" | "low";

export interface QualityProfile {
  tier: QualityTier;
  enableLaserAnimation: boolean;
}

interface QualityState {
  profile: QualityProfile;
  setTier: (tier: QualityTier) => void;
}

function getInitialTier(): QualityTier {
  if (typeof window === "undefined") return "high";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  if ((navigator.hardwareConcurrency || 4) <= 2) return "low";
  return "high";
}

const initialTier = getInitialTier();

export const useQualityStore = create<QualityState>((set) => ({
  profile: {
    tier: initialTier,
    enableLaserAnimation: initialTier !== "low",
  },
  setTier: (tier: QualityTier) => {
    set({
      profile: {
        tier,
        enableLaserAnimation: tier !== "low",
      },
    });
  },
}));

export function useAdaptiveQuality() {
  const profile = useQualityStore((s) => s.profile);
  const setTier = useQualityStore((s) => s.setTier);
  return { profile, setTier };
}

export default useQualityStore;
