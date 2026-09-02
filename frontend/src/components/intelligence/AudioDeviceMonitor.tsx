import React, { useEffect, useRef, useState } from "react";
import { integrityApi } from "@/services/integrityApi";

interface AudioDeviceMonitorProps {
  sessionId: string;
  isPaused?: boolean | undefined;
  onAudioTelemetry?: ((volume: number, connected: boolean) => void) | undefined;
}

export const AudioDeviceMonitor: React.FC<AudioDeviceMonitorProps> = ({
  sessionId,
  isPaused = false,
  onAudioTelemetry,
}) => {
  const [micConnected, setMicConnected] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const callbackRef = useRef<(volume: number, connected: boolean) => void>(() => {});

  useEffect(() => {
    if (onAudioTelemetry) {
      callbackRef.current = onAudioTelemetry;
    }
  }, [onAudioTelemetry]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setMicConnected(true);

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (err) {
        setMicConnected(false);
      }
    };

    void initAudio();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const analyser = analyserRef.current;
      if (isPaused || !analyser) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i];
        if (val !== undefined) {
          sum += val;
        }
      }
      const average = sum / (dataArray.length || 1);
      const volumeLevel = Math.min(100, Math.round((average / 128) * 100));
      const noiseSpike = volumeLevel > 80;

      callbackRef.current(volumeLevel, micConnected);

      void integrityApi.sendTelemetryBatch({
        session_id: sessionId,
        timestamp_sec: Math.round(performance.now() / 1000),
        mic_connected: micConnected,
        volume_level: volumeLevel,
        noise_spike: noiseSpike,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, isPaused, micConnected]);

  return null;
};

export default AudioDeviceMonitor;
