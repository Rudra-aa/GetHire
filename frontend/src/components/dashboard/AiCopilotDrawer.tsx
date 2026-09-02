import { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  User,
} from "lucide-react";

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Hello Rudra! I'm your AI Career Copilot. I've analyzed your resume and active target role (Frontend Developer). How can I assist your interview readiness today?",
    timestamp: "Just now",
  },
];

const quickPrompts = [
  "How can I boost my Resume ATS score from 78 to 90+?",
  "Generate 3 tough React 19 & System Design interview questions.",
  "What missing skills should I add for Tier 1 tech companies?",
];

export const AiCopilotDrawer = memo(function AiCopilotDrawer({
  isOpen,
  onClose,
}: AiCopilotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "";
      const lower = text.toLowerCase();

      if (lower.includes("ats") || lower.includes("score") || lower.includes("boost")) {
        aiResponseText =
          "To elevate your ATS score from 78 to 92+: 1) Quantify your key outcomes in project bullets (e.g. 'Optimized React bundle size by 38% via dynamic code splitting and Tree Shaking'). 2) Add standard keyword sections for 'State Management (Zustand, Redux)' and 'Performance (Core Web Vitals, Lighthouse)'. 3) Ensure single-column formatting with standard headers.";
      } else if (lower.includes("question") || lower.includes("interview") || lower.includes("react")) {
        aiResponseText =
          "Here are 3 high-signal mock questions tailored to your profile:\n\n1. Explain the internal reconciliation algorithm in React Fiber and how `useTransition` prioritizes non-blocking UI updates.\n2. How would you architect a real-time collaborative canvas with zero-latency optimistic state updates?\n3. What trade-offs exist between Server Components (RSC) and Client Hydration for large-scale SaaS applications?";
      } else {
        aiResponseText =
          "Based on your target role as a Frontend Developer, mastering state management architectures (Zustand/React Query), TypeScript generics, and System Design concepts will place you in the top 5% of candidate evaluations. Would you like to start a 5-minute interactive drill?";
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md h-full bg-[#111217] border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-black/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-400/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-[#39FF88] shadow-[0_0_15px_rgba(57,255,136,0.25)]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  GetHire AI Copilot
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[#39FF88]">
                    LIVE
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400">Context-Aware Career Operating System</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-none">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === "user"
                      ? "bg-blue-500/20 text-[#4DA8FF] border border-blue-500/30"
                      : "bg-emerald-500/20 text-[#39FF88] border border-emerald-500/30"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[82%] whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-[#4DA8FF]/15 text-white border border-[#4DA8FF]/25 rounded-tr-none"
                      : "bg-black/50 text-neutral-200 border border-white/[0.08] rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-[#39FF88] border border-emerald-500/30 flex items-center justify-center text-xs shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-t border-white/[0.06] bg-black/20 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-neutral-400 px-1">Suggested Inquiries:</span>
            <div className="flex flex-col gap-1">
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left text-[11px] text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/25 p-2 rounded-xl transition-colors truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-white/[0.08] bg-black/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask your AI Career Copilot..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/40"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#39FF88] to-[#4DA8FF] text-black font-bold disabled:opacity-40 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

export default AiCopilotDrawer;
