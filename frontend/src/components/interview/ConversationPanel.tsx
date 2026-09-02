import React, { useState } from "react";
import { Bot, User, Send, Sparkles, Code2, ArrowRight } from "lucide-react";

export interface ConversationMessage {
  id: string;
  sender: "ai" | "candidate";
  text: string;
  timestamp: string;
  isFollowUp?: boolean | undefined;
  codeSnippet?: string | undefined;
}

interface ConversationPanelProps {
  messages: ConversationMessage[];
  isAiListening: boolean;
  submitting: boolean;
  onSendAnswer: (text: string, code?: string) => void;
  onFinishInterview: () => void;
  isLastQuestion: boolean;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  isAiListening,
  submitting,
  onSendAnswer,
  onFinishInterview,
  isLastQuestion,
}) => {
  const [inputText, setInputText] = useState("");
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [codeText, setCodeText] = useState("");

  const handleSend = () => {
    if (!inputText.trim() && !codeText.trim()) return;
    onSendAnswer(inputText, showCodeBox ? codeText : undefined);
    setInputText("");
    setCodeText("");
    setShowCodeBox(false);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Stream of Chat Bubbles */}
      <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
        {messages.map((msg) => {
          const isAi = msg.sender === "ai";
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 items-start ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="p-2 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400 shrink-0 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed font-sans flex flex-col gap-2 shadow-lg ${
                  isAi
                    ? msg.isFollowUp
                      ? "bg-purple-500/10 border border-purple-500/30 text-purple-100 rounded-tl-sm"
                      : "bg-white/[0.04] border border-white/10 text-neutral-200 rounded-tl-sm"
                    : "bg-gradient-to-r from-gold-500/20 to-amber-500/20 border border-gold-400/30 text-white rounded-tr-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
                  <span className="font-bold flex items-center gap-1">
                    {isAi ? (msg.isFollowUp ? "Alex (Follow-up Challenge)" : "Alex (AI Recruiter)") : "You (Candidate)"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p>{msg.text}</p>

                {msg.codeSnippet && (
                  <pre className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                    {msg.codeSnippet}
                  </pre>
                )}
              </div>

              {!isAi && (
                <div className="p-2 rounded-2xl bg-gold-400/20 border border-gold-400/40 text-gold-300 shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Listening Indicator */}
        {isAiListening && (
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 p-3 rounded-2xl bg-gold-400/5 border border-gold-400/20 animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>AI Recruiter is analyzing your response & formulating reasoning challenge...</span>
          </div>
        )}
      </div>

      {/* Input Composer Box */}
      <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
        {showCodeBox && (
          <textarea
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            placeholder="Paste code snippet or architecture pseudocode here..."
            className="w-full h-24 p-3 rounded-xl bg-black/70 border border-white/20 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your response to the AI recruiter..."
            className="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all font-sans"
          />

          <button
            onClick={() => setShowCodeBox(!showCodeBox)}
            className={`p-3 rounded-2xl border transition-all ${
              showCodeBox
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white"
            }`}
            title="Attach Code Snippet"
          >
            <Code2 className="h-4 w-4" />
          </button>

          <button
            onClick={handleSend}
            disabled={submitting}
            className="px-5 py-3 rounded-2xl bg-gold-400 hover:bg-gold-300 text-black font-bold text-xs font-display transition-all flex items-center gap-1.5 shadow-lg shadow-gold-500/10"
          >
            <span>Send Response</span>
            <Send className="h-3.5 w-3.5" />
          </button>

          {isLastQuestion && (
            <button
              onClick={onFinishInterview}
              disabled={submitting}
              className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs font-display transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <span>Finish Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationPanel;
