import React, { useEffect } from "react";
import { AlertTriangle, CameraOff, MicOff, Maximize2, Users, WifiOff, X } from "lucide-react";

export interface WarningToast {
  id: string;
  type: "camera_disconnected" | "multiple_faces" | "fullscreen_exited" | "mic_muted" | "network_unstable" | "tab_switch";
  message: string;
}

interface LiveWarningToastsProps {
  toasts: WarningToast[];
  onDismiss: (id: string) => void;
}

export const LiveWarningToasts: React.FC<LiveWarningToastsProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const firstToast = toasts[0];
    if (!firstToast) return;
    const timer = setTimeout(() => {
      onDismiss(firstToast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = AlertTriangle;
        if (toast.type === "camera_disconnected") Icon = CameraOff;
        if (toast.type === "mic_muted") Icon = MicOff;
        if (toast.type === "fullscreen_exited") Icon = Maximize2;
        if (toast.type === "multiple_faces") Icon = Users;
        if (toast.type === "network_unstable") Icon = WifiOff;

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-2xl bg-white/85 border border-rose-300/80 text-rose-900 text-xs font-mono shadow-[0_12px_32px_rgba(38,61,104,0.12)] backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-rose-400 hover:text-rose-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default LiveWarningToasts;
