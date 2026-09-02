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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#111217] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-10"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
            <Search className="h-5 w-5 text-[#39FF88]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, job search, skill or prompt..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-neutral-400">
              ESC
            </kbd>
          </div>

          <div className="p-2 max-h-[340px] overflow-y-auto scrollbar-none flex flex-col gap-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No matching commands found.
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-[#39FF88] group-hover:border-emerald-500/30 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-[#39FF88] transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">{item.category}</span>
                      </div>
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-[#39FF88] group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#39FF88]" />
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
