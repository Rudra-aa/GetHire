import type { ComponentType } from "react";
import { lazy, Suspense, useState, useCallback, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ── Core on-page sections (always visible) ────────────────────────────────────
const HeroSection               = lazy(() => import("@/sections/HeroSection"));
const WorkflowSection           = lazy(() => import("@/sections/WorkflowSection"));
const ResumeIntelligenceSection = lazy(() => import("@/sections/ResumeIntelligenceSection"));
const AiEngineSection           = lazy(() => import("@/sections/AiEngineSection"));
const EvaluationSection         = lazy(() => import("@/sections/EvaluationSection"));
const ArchitectureSection       = lazy(() => import("@/sections/ArchitectureSection"));
const LiveDemoSection           = lazy(() => import("@/sections/LiveDemoSection"));
const CtaSection                = lazy(() => import("@/sections/CtaSection"));

// ── Panel-only sections — loaded only when opened via navbar ─────────────────
const FaceSenseSection  = lazy(() => import("@/sections/FaceSenseSection"));
const VoiceSenseSection = lazy(() => import("@/sections/VoiceSenseSection"));
const TechnologySection = lazy(() => import("@/sections/TechnologySection"));
const FaqSection        = lazy(() => import("@/sections/FaqSection"));

// ── Panel registry ────────────────────────────────────────────────────────────
export type PanelId = "facesense" | "voicesense" | "technology" | "faq";

const panels: Record<PanelId, { title: string; component: ComponentType }> = {
  facesense:  { title: "FaceSense — Facial Emotion Analysis", component: FaceSenseSection  },
  voicesense: { title: "VoiceSense — Voice Analysis",         component: VoiceSenseSection },
  technology: { title: "Technology Stack",                    component: TechnologySection  },
  faq:        { title: "Frequently Asked Questions",          component: FaqSection         },
};

function SectionLoader() {
  return (
    <div className="py-24 flex justify-center items-center">
      <div className="h-6 w-6 rounded-full border-2 border-[#D0DCE8] border-t-[#A8D8C3] animate-spin" />
    </div>
  );
}

// ── Clean Overlay Panel ───────────────────────────────────────────────────────
const GlassPanel = memo(function GlassPanel({
  panelId,
  onClose,
}: {
  panelId: PanelId;
  onClose: () => void;
}) {
  const panel = panels[panelId];
  if (!panel) return null;
  const { title, component: PanelContent } = panel;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      key={panelId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
      style={{ background: "rgba(38, 61, 104, 0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[1280px] mb-10 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-glass-modal"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#D0DCE8]/80 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1E8C5A]" />
            <h2 className="text-sm font-bold text-[#263D68] tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] transition-all border border-[#D0DCE8] shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable panel content */}
        <div className="overflow-y-auto max-h-[80vh] bg-transparent">
          <Suspense fallback={<SectionLoader />}>
            <PanelContent />
          </Suspense>
        </div>
      </motion.div>
    </motion.div>
  );
});

// ── Root page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);

  const openPanel  = useCallback((id: PanelId) => setActivePanel(id), []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<PanelId>).detail;
      if (id in panels) openPanel(id);
    };
    window.addEventListener("gethire:open-panel", handler);
    return () => window.removeEventListener("gethire:open-panel", handler);
  }, [openPanel]);

  return (
    <div className="relative min-h-screen bg-transparent text-[#263D68]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 min-h-screen flex flex-col"
      >
        <Suspense fallback={<SectionLoader />}>
          {/* ── ON-PAGE SECTIONS ── */}
          <HeroSection />
          <WorkflowSection />
          <ResumeIntelligenceSection />
          <AiEngineSection />
          <EvaluationSection />
          <ArchitectureSection />
          <LiveDemoSection />
          <CtaSection />
        </Suspense>
      </motion.div>

      {/* ── OVERLAY PANELS (FaceSense, VoiceSense, Technology, FAQ) ── */}
      <AnimatePresence mode="wait">
        {activePanel && (
          <GlassPanel key={activePanel} panelId={activePanel} onClose={closePanel} />
        )}
      </AnimatePresence>
    </div>
  );
}
