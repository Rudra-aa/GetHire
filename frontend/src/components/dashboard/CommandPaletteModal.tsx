import { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  User,
  Video,
  Brain,
  Bot,
  Settings,
  ArrowRight,
  Sparkles,
  LayoutDashboard
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCopilot: () => void;
}

const commandOptions = [
  { id: "dashboard", title: "Go to Dashboard", icon: LayoutDashboard, path: "/dashboard", category: "Navigation" },
  { id: "profile", title: "View & Edit Profile", icon: User, path: "/profile", category: "Navigation" },
  { id: "upload", title: "Upload & Parse New Resume", icon: FileText, action: "upload", category: "Actions" },
  { id: "mock", title: "Launch AI Mock Interview", icon: Video, action: "mock", category: "Actions" },
  { id: "skills", title: "View Extracted Skills (18)", icon: Brain, path: "/dashboard#skill-intel", category: "Insights" },
  { id: "copilot", title: "Ask AI Copilot for Resume Feedback", icon: Bot, action: "copilot", category: "AI Assistant" },
  { id: "settings", title: "Account & AI Settings", icon: Settings, path: "/profile", category: "Settings" },
];

export const CommandPaletteModal = memo(function CommandPaletteModal({
  isOpen,
  onClose,
  onOpenCopilot,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = commandOptions.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: (typeof commandOptions)[0]) => {
    onClose();
    if (item.action === "copilot") {
      onOpenCopilot();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-2xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_24px_48px_-12px_rgba(38,61,104,0.15),0_8px_20px_-4px_rgba(38,61,104,0.08)] overflow-hidden flex flex-col z-10"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E4EDF5]">
            <Search className="h-5 w-5 text-[#1E8C5A]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, job search, skill or prompt..."
              className="flex-1 bg-transparent text-sm text-[#263D68] placeholder:text-[#5A6E8C] focus:outline-none"
            />
            <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAFBFC] border border-[#D0DCE8] text-[#5A6E8C]">
              ESC
            </kbd>
          </div>

          <div className="p-2 max-h-[340px] overflow-y-auto scrollbar-none flex flex-col gap-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5A6E8C]">
                No matching commands found.
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-[#F0FAF5] hover:border-[#A8D8C3] border border-transparent transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] flex items-center justify-center text-[#5A6E8C] group-hover:text-[#1E8C5A] group-hover:border-[#A8D8C3] transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#263D68] group-hover:text-[#1E8C5A] transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#5A6E8C]">{item.category}</span>
                      </div>
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-[#5A6E8C] group-hover:text-[#1E8C5A] group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          <div className="px-5 py-3 border-t border-[#E4EDF5] bg-[#FAFBFC]/80 backdrop-blur-sm flex items-center justify-between text-[11px] font-mono text-[#5A6E8C]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#1E8C5A]" />
              GetHire Command Palette
            </span>
            <span>Use ↑↓ to navigate · ↵ to select</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

export default CommandPaletteModal;
