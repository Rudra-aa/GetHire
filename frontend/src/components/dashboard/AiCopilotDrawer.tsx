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
          className="relative w-full max-w-md h-full bg-white/90 backdrop-blur-xl border-l border-[#D0DCE8]/80 shadow-[0_20px_50px_rgba(38,61,104,0.15)] flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E4EDF5] bg-[#FAFBFC]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/60 flex items-center justify-center text-[#1E8C5A] shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
                  GetHire Career Assistant
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[11px] text-[#5A6E8C]">Context-Aware Career Operating System</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] transition-colors"
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
                      ? "bg-[#B9D9EC]/30 text-[#2B7FAD] border border-[#B9D9EC]"
                      : "bg-[#A8D8C3]/25 text-[#1E8C5A] border border-[#A8D8C3]/60"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[82%] whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-[#B9D9EC]/20 text-[#263D68] border border-[#B9D9EC]/50 rounded-tr-none"
                      : "bg-[#FAFBFC] text-[#263D68] border border-[#E4EDF5] rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-lg bg-[#A8D8C3]/25 text-[#1E8C5A] border border-[#A8D8C3]/60 flex items-center justify-center text-xs shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-[#FAFBFC] border border-[#E4EDF5] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A] animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-t border-[#E4EDF5] bg-[#FAFBFC]/80 backdrop-blur-sm flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-[#5A6E8C] px-1">Suggested Inquiries:</span>
            <div className="flex flex-col gap-1">
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left text-[11px] text-[#263D68] hover:text-[#1E8C5A] bg-white/80 hover:bg-[#F0FAF5] border border-[#E4EDF5] hover:border-[#A8D8C3] p-2 rounded-xl transition-colors truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-[#E4EDF5] bg-white/90 backdrop-blur-sm">
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
                placeholder="Ask your Career Assistant..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] text-xs text-[#263D68] placeholder:text-[#5A6E8C] focus:outline-none focus:border-[#A8D8C3]"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2.5 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-bold disabled:opacity-40 transition-opacity"
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
