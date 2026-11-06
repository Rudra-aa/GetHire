import React, { useState, useRef } from "react";
import { ShieldAlert, Camera, Mic, Maximize2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface AssessmentOnboardingProps {
  assessmentName: string;
  onStart: () => void;
}

export const AssessmentOnboarding: React.FC<AssessmentOnboardingProps> = ({ assessmentName, onStart }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cameraOk, setCameraOk] = useState(false);
  const [micOk, setMicOk] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Step 2: Request Camera
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOk(true);
    } catch {
      setCameraOk(false);
      alert("Please allow camera permissions to continue.");
    }
  };

  // Step 3: Request Mic
  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicOk(true);
    } catch {
      setMicOk(false);
      alert("Please allow microphone permissions to continue.");
    }
  };

  // Step 4: Toggle Fullscreen
  const requestFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#263D68] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full p-8 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-glass-modal flex flex-col gap-6">
        
        {/* Header indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4EDF5]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#1E8C5A]" />
            <span className="text-sm font-bold font-display uppercase tracking-wider text-[#1E8C5A]">
              Technical Assessment Pre-Check
            </span>
          </div>
          <span className="text-xs font-mono text-[#5A6E8C]">Step {step} of 4</span>
        </div>

        {/* Step 1: Rules & Instructions */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-display text-[#263D68]">{assessmentName}</h2>
            <p className="text-sm text-[#5A6E8C] leading-relaxed font-sans">
              Welcome to the proctored assessment environment. This evaluation measures your technical knowledge, problem-solving speed, and system design architecture skills.
            </p>
            <div className="p-4 rounded-xl bg-[#F0FAF5] border border-[#A8D8C3]/60 flex flex-col gap-2 text-xs font-sans text-[#263D68]">
              <div className="flex items-center gap-2 font-bold text-[#1E8C5A]">
                <ShieldAlert className="h-4 w-4" /> Assessment Rules & Integrity Protocol
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6E8C]">
                <li>20 Adaptive questions spanning coding, debugging, and system design.</li>
                <li>Fullscreen environment with automatic tab-switch detection.</li>
                <li>Proctored camera & microphone verification.</li>
                <li>Generates your verified Knowledge Profile to unlock the mock interview.</li>
              </ul>
            </div>
            <button
              onClick={() => { setStep(2); void requestCamera(); }}
              className="w-full py-3.5 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-bold text-sm font-display shadow-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Continue to Device Verification</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Camera Verification */}
        {step === 2 && (
          <div className="flex flex-col gap-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <Camera className="h-8 w-8 text-[#2B7FAD]" />
              <h2 className="text-xl font-bold font-display text-[#263D68]">Camera Check</h2>
              <p className="text-xs text-[#5A6E8C]">Ensure your face is clearly visible inside the frame.</p>
            </div>
            <div className="w-full h-56 rounded-2xl bg-[#0F1D38] border border-[#D0DCE8] overflow-hidden relative flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {cameraOk && (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#A8D8C3]/90 border border-[#72C9AD] text-[#1E4D38] text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Camera Verified
                </div>
              )}
            </div>
            <button
              onClick={() => { setStep(3); void requestMic(); }}
              disabled={!cameraOk}
              className="w-full py-3.5 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] disabled:opacity-40 text-[#1E4D38] border border-[#72C9AD] font-bold text-sm font-display shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{cameraOk ? "Camera Verified • Proceed to Mic Check" : "Allow Camera Permission"}</span>
            </button>
          </div>
        )}

        {/* Step 3: Microphone Check */}
        {step === 3 && (
          <div className="flex flex-col gap-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <Mic className="h-8 w-8 text-[#2B7FAD]" />
              <h2 className="text-xl font-bold font-display text-[#263D68]">Microphone Check</h2>
              <p className="text-xs text-[#5A6E8C]">Audio input is required for proctoring verification.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col items-center gap-4">
              <div className="h-3 w-48 bg-[#E4EDF5] rounded-full overflow-hidden">
                <div className={`h-full bg-[#1E8C5A] transition-all duration-300 ${micOk ? 'w-3/4' : 'w-0'}`} />
              </div>
              <span className="text-xs font-mono text-[#5A6E8C]">
                {micOk ? "Microphone stream active" : "Testing audio capture..."}
              </span>
            </div>
            <button
              onClick={() => { setStep(4); }}
              disabled={!micOk}
              className="w-full py-3.5 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] disabled:opacity-40 text-[#1E4D38] border border-[#72C9AD] font-bold text-sm font-display shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{micOk ? "Microphone Verified • Next" : "Allow Microphone Permission"}</span>
            </button>
          </div>
        )}

        {/* Step 4: Fullscreen Enforcement */}
        {step === 4 && (
          <div className="flex flex-col gap-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <Maximize2 className="h-8 w-8 text-[#1E8C5A]" />
              <h2 className="text-xl font-bold font-display text-[#263D68]">Enter Proctored Mode</h2>
              <p className="text-xs text-[#5A6E8C]">Click below to expand fullscreen and initiate your 20-question test session.</p>
            </div>
            <button
              onClick={() => { requestFullscreen(); onStart(); }}
              className="w-full py-4 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-extrabold text-base font-display shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
              <span>Enter Fullscreen & Begin Assessment</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssessmentOnboarding;
