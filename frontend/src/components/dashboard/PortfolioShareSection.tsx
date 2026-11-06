import { useState, memo } from "react";
import { Share2, Copy, Check, Eye, Globe, Settings2, AlertCircle, Lock } from "lucide-react";
import { careerApi, ShareSettings } from "@/services/careerApi";

export interface PortfolioShareSectionProps {
  shareSettings?: ShareSettings | null;
  onRefreshSettings?: () => Promise<void> | void;
}

export const PortfolioShareSection = memo(function PortfolioShareSection({
  shareSettings,
  onRefreshSettings,
}: PortfolioShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isConfigured = Boolean(shareSettings?.configured);
  const isPublic = Boolean(shareSettings?.is_public);
  const hasAssessment = Boolean(shareSettings?.has_assessment);
  const includeAssessment = Boolean(shareSettings?.include_assessment && hasAssessment);

  // Determine displayed portfolio link
  let displayUrl = "Public sharing is not configured";
  let canCopy = false;

  if (isConfigured) {
    if (isPublic && shareSettings?.share_url) {
      displayUrl = shareSettings.share_url;
      canCopy = true;
    } else if (!isPublic) {
      displayUrl = "Portfolio is set to Private";
      canCopy = false;
    }
  }

  const handleCopy = () => {
    if (!canCopy || !shareSettings?.share_url) return;
    navigator.clipboard.writeText(shareSettings.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublic = async (checked: boolean) => {
    if (!isConfigured) {
      setErrorMsg("Public sharing is not configured with a production domain.");
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await careerApi.updateShareSettings({ is_public: checked });
      setSuccessMsg(checked ? "Public access enabled." : "Portfolio set to Private.");
      if (onRefreshSettings) await onRefreshSettings();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg("Failed to update visibility settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAssessment = async (checked: boolean) => {
    if (!hasAssessment) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await careerApi.updateShareSettings({ include_assessment: checked });
      setSuccessMsg(checked ? "Assessment included in portfolio." : "Assessment hidden from portfolio.");
      if (onRefreshSettings) await onRefreshSettings();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg("Failed to update assessment sharing settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
            Recruiter Portfolio & Share Center
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DCD5F0]/35 text-[#6E5EBB] border border-[#DCD5F0]/50 font-bold">
              SHARE CENTER
            </span>
          </h3>
          <p className="text-xs text-[#5A6E8C] mt-0.5">
            Share your verified composite performance history directly with recruiters and hiring managers.
          </p>
        </div>
        <Share2 className="h-5 w-5 text-[#6E5EBB]" />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#E05C5C] text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 text-[#1E8C5A] text-xs flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Link Generator and View Count */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-[#5A6E8C] uppercase">
              Your Portfolio Link
            </label>
            <div className={`flex items-center gap-2 rounded-xl p-2.5 border ${
              isConfigured && isPublic
                ? "bg-white/90 backdrop-blur-sm border-white/95 shadow-xs"
                : "bg-white/60 border-dashed border-[#B9D9EC]/70 opacity-80"
            }`}>
              <input
                type="text"
                readOnly
                value={displayUrl}
                className="bg-transparent border-none outline-none text-xs text-[#263D68] w-full font-mono select-all disabled:cursor-not-allowed"
              />
              <button
                onClick={handleCopy}
                disabled={!canCopy}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  canCopy
                    ? "hover:bg-[#EEF6FB] text-[#5A6E8C] hover:text-[#263D68] cursor-pointer"
                    : "text-[#8FA3BC] cursor-not-allowed"
                }`}
                title={canCopy ? "Copy Link" : "Copy Link Disabled"}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#1E8C5A]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            {!isConfigured && (
              <span className="text-[10px] text-[#5A6E8C]">
                Public recruiter sharing is not configured in this environment.
              </span>
            )}
          </div>

          <div className="flex gap-4">
            {/* Recruiter Views */}
            <div className="flex-1 p-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/95 flex items-center gap-3 shadow-xs">
              <Eye className="h-5 w-5 text-[#2B7FAD]" />
              <div>
                <span className="text-[10px] font-mono text-[#5A6E8C] uppercase block">
                  Recruiter Views
                </span>
                <span className="text-sm font-bold text-[#263D68]">
                  {isConfigured && shareSettings?.access_count !== null && shareSettings?.access_count !== undefined
                    ? `${shareSettings.access_count} ${shareSettings.access_count === 1 ? "View" : "Views"}`
                    : "Analytics unavailable"}
                </span>
              </div>
            </div>

            {/* Share Visibility */}
            <div className="flex-1 p-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/95 flex items-center gap-3 shadow-xs">
              {isConfigured && isPublic ? (
                <Globe className="h-5 w-5 text-[#1E8C5A]" />
              ) : (
                <Lock className="h-5 w-5 text-[#D4921A]" />
              )}
              <div>
                <span className="text-[10px] font-mono text-[#5A6E8C] uppercase block">
                  Share Visibility
                </span>
                <span className={`text-sm font-bold ${
                  !isConfigured
                    ? "text-[#8FA3BC]"
                    : isPublic
                    ? "text-[#1E8C5A]"
                    : "text-[#D4921A]"
                }`}>
                  {!isConfigured ? "Not Configured" : isPublic ? "Public" : "Private"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customization controls */}
        <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/95 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#263D68] uppercase border-b border-[#E4EDF5] pb-2">
            <Settings2 className="h-4 w-4 text-[#6E5EBB]" />
            <span>Link Customization</span>
            {isSaving && (
              <span className="ml-auto text-[10px] text-[#6E5EBB] font-mono animate-pulse">
                Saving...
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {/* Publicly accessible link */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-[#263D68]">
                  Publicly accessible link
                </span>
                <span className="text-[10px] text-[#5A6E8C]">
                  {isConfigured
                    ? "Allow recruiters with the URL to view your verified portfolio"
                    : "Disabled — requires configured domain"}
                </span>
              </div>
              <input
                type="checkbox"
                disabled={!isConfigured || isSaving}
                checked={isConfigured && isPublic}
                onChange={(e) => void handleTogglePublic(e.target.checked)}
                className="w-4 h-4 accent-[#A8D8C3] rounded border-[#D0DCE8] bg-transparent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              />
            </div>

            {/* Include Technical Assessment */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-[#263D68] flex items-center gap-1.5">
                  Include Technical Assessment
                  {!hasAssessment && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-[#D4921A]">
                      NOT COMPLETED
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[#5A6E8C]">
                  {hasAssessment
                    ? "Show detailed concept analysis graph"
                    : "Complete a technical assessment first to enable sharing"}
                </span>
              </div>
              <input
                type="checkbox"
                disabled={!hasAssessment || isSaving}
                checked={includeAssessment}
                onChange={(e) => void handleToggleAssessment(e.target.checked)}
                className="w-4 h-4 accent-[#A8D8C3] rounded border-[#D0DCE8] bg-transparent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              />
            </div>

            {/* Include Interview Session Recordings (Unavailable) */}
            <div className="flex items-center justify-between opacity-60">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-[#263D68] flex items-center gap-1.5">
                  Include Interview Session Recordings
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#F0F5F9] text-[#5A6E8C]">
                    UNAVAILABLE
                  </span>
                </span>
                <span className="text-[10px] text-[#5A6E8C]">
                  Recording storage unavailable (video/audio clips are not captured or stored)
                </span>
              </div>
              <input
                type="checkbox"
                disabled={true}
                checked={false}
                className="w-4 h-4 rounded border-[#D0DCE8] bg-transparent cursor-not-allowed opacity-30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PortfolioShareSection;
