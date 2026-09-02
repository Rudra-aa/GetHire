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
    <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col gap-6">
        
        {/* Header indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold font-display uppercase tracking-wider text-cyan-300">
              Technical Assessment Pre-Check
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-400">Step {step} of 4</span>
        </div>

        {/* Step 1: Rules & Instructions */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-display text-white">{assessmentName}</h2>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              Welcome to the proctored assessment environment. This evaluation measures your technical knowledge, problem-solving speed, and system design architecture skills.
            </p>
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col gap-2 text-xs font-sans text-neutral-300">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <ShieldAlert className="h-4 w-4" /> Assessment Rules & Integrity Protocol
              </div>
              <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                <li>20 Adaptive questions spanning coding, debugging, and system design.</li>
                <li>Fullscreen environment with automatic tab-switch detection.</li>
                <li>Proctored camera & microphone verification.</li>
                <li>Generates your verified Knowledge Profile to unlock the AI Interview.</li>
              </ul>
            </div>
            <button
              onClick={() => { setStep(2); void requestCamera(); }}
              className="w-full py-3.5 rounded-xl bg-cyan-400 text-black font-bold text-sm font-display hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 mt-2"
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
              <Camera className="h-8 w-8 text-cyan-400" />
              <h2 className="text-xl font-bold font-display text-white">Camera Check</h2>
              <p className="text-xs text-neutral-400">Ensure your face is clearly visible inside the frame.</p>
            </div>
            <div className="w-full h-56 rounded-2xl bg-black/60 border border-white/10 overflow-hidden relative flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {cameraOk && (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Camera Verified
                </div>
              )}
            </div>
            <button
              onClick={() => { setStep(3); void requestMic(); }}
              disabled={!cameraOk}
              className="w-full py-3.5 rounded-xl bg-cyan-400 disabled:opacity-40 text-black font-bold text-sm font-display hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
            >
              <span>{cameraOk ? "Camera Verified • Proceed to Mic Check" : "Allow Camera Permission"}</span>
            </button>
          </div>
        )}

        {/* Step 3: Microphone Check */}
        {step === 3 && (
          <div className="flex flex-col gap-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <Mic className="h-8 w-8 text-cyan-400" />
              <h2 className="text-xl font-bold font-display text-white">Microphone Check</h2>
              <p className="text-xs text-neutral-400">Audio input is required for proctoring verification.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-4">
              <div className="h-3 w-48 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-400 transition-all duration-300 ${micOk ? 'w-3/4' : 'w-0'}`} />
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {micOk ? "Microphone stream active" : "Testing audio capture..."}
              </span>
            </div>
            <button
              onClick={() => { setStep(4); }}
              disabled={!micOk}
              className="w-full py-3.5 rounded-xl bg-cyan-400 disabled:opacity-40 text-black font-bold text-sm font-display hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
            >
              <span>{micOk ? "Microphone Verified • Next" : "Allow Microphone Permission"}</span>
            </button>
          </div>
        )}

        {/* Step 4: Fullscreen Enforcement */}
        {step === 4 && (
          <div className="flex flex-col gap-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <Maximize2 className="h-8 w-8 text-cyan-400" />
              <h2 className="text-xl font-bold font-display text-white">Enter Proctored Mode</h2>
              <p className="text-xs text-neutral-400">Click below to expand fullscreen and initiate your 20-question test session.</p>
            </div>
            <button
              onClick={() => { requestFullscreen(); onStart(); }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-extrabold text-base font-display hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
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
