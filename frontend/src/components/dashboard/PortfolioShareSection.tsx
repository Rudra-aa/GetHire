import { useState, memo } from "react";
import { Share2, Copy, Check, Eye, Globe, Settings2 } from "lucide-react";

export const PortfolioShareSection = memo(function PortfolioShareSection() {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [includeAssessment, setIncludeAssessment] = useState(true);
  const [includeInterview, setIncludeInterview] = useState(false);

  const shareUrl = "https://gethire.ai/share/candidate-rudra-parmar";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#111217]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Recruiter Portfolio & Share Center
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              READY TO SHARE
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Share your verified composite performance history directly with recruiters and hiring managers.
          </p>
        </div>
        <Share2 className="h-5 w-5 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Link Generator and View Count */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-neutral-400 uppercase">Your Portfolio Link</label>
            <div className="flex items-center gap-2 bg-[#09090B] border border-white/10 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent border-none outline-none text-xs text-neutral-300 w-full font-mono select-all"
              />
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors shrink-0"
                title="Copy Link"
              >
                {copied ? <Check className="h-4 w-4 text-[#39FF88]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
              <Eye className="h-5 w-5 text-cyan-400" />
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Recruiter Views</span>
                <span className="text-sm font-bold text-white">12 Views</span>
              </div>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
              <Globe className="h-5 w-5 text-emerald-400" />
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Share Visibility</span>
                <span className="text-sm font-bold text-emerald-400">Public</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customization controls */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase border-b border-white/5 pb-2">
            <Settings2 className="h-4 w-4 text-purple-400" />
            <span>Link Customization</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-white">Publicly accessible link</span>
                <span className="text-[10px] text-neutral-400">Allow anyone with the URL to view your profile</span>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-[#39FF88] rounded border-white/10 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-white">Include Technical Assessment</span>
                <span className="text-[10px] text-neutral-400">Show detailed concept analysis graph</span>
              </div>
              <input
                type="checkbox"
                checked={includeAssessment}
                onChange={(e) => setIncludeAssessment(e.target.checked)}
                className="w-4 h-4 accent-[#39FF88] rounded border-white/10 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-white">Include Interview Session Recordings</span>
                <span className="text-[10px] text-neutral-400">Attach actual video/audio replay clips</span>
              </div>
              <input
                type="checkbox"
                checked={includeInterview}
                onChange={(e) => setIncludeInterview(e.target.checked)}
                className="w-4 h-4 accent-[#39FF88] rounded border-white/10 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PortfolioShareSection;
