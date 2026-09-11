/**
 * src/engines/voice/detectors/AudioEnergyMeter.ts
 * -----------------------------------------------
 * Web Audio API real-time audio volume and RMS energy meter.
 * Detects voice activity vs background ambient noise.
 */

import { InterviewEventBus } from "../EventBus";

export class AudioEnergyMeter {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private isRunning = false;
  private isMuted = false;
  private eventBus: InterviewEventBus;

  // Thresholds
  private voiceVolumeThreshold = 14; // Normalized 0-100 threshold for voice
  private currentVolume = 0;
  private currentRms = 0;
  private voiceDetectedCount = 0;

  constructor(eventBus: InterviewEventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Initialize audio meter with an existing or newly requested MediaStream
   */
  async start(existingStream?: MediaStream): Promise<MediaStream | null> {
    if (this.isRunning) return this.micStream;

    try {
      let stream = existingStream;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      }

      this.micStream = stream;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return stream;

      this.audioContext = new AudioContextClass();
      if (this.audioContext.state === "suspended") {
        void this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;
      source.connect(this.analyser);

      this.isRunning = true;
      this.eventBus.emit("MIC_READY", { stream });
      this.startAnalysisLoop();

      return stream;
    } catch (err) {
      console.warn("[AudioEnergyMeter] Failed to initialize microphone:", err);
      this.eventBus.emit("ERROR_OCCURRED", {
        category: "MICROPHONE_ERROR",
        message: "Microphone access unavailable or denied.",
        fatal: false,
      });
      return null;
    }
  }

  private startAnalysisLoop() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const timeData = new Uint8Array(this.analyser.fftSize);

    const checkAudio = () => {
      if (!this.isRunning || !this.analyser) return;

      if (this.isMuted) {
        this.currentVolume = 0;
        this.currentRms = 0;
        this.eventBus.emit("AUDIO_ENERGY_UPDATED", { volume: 0, rms: 0, isVoice: false });
        this.animFrameId = requestAnimationFrame(checkAudio);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);
      this.analyser.getByteTimeDomainData(timeData);

      // 1. Calculate Average Frequency Volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] ?? 0;
      }
      const avg = sum / (dataArray.length || 1);
      const normalizedVol = Math.min(100, Math.round((avg / 128) * 100 * 1.5));
      this.currentVolume = normalizedVol;

      // 2. Calculate RMS Energy from Time Domain
      let rmsSum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const val = ((timeData[i] ?? 128) - 128) / 128;
        rmsSum += val * val;
      }
      const rms = Math.sqrt(rmsSum / timeData.length);
      this.currentRms = rms;

      const isVoice = normalizedVol > this.voiceVolumeThreshold;

      if (isVoice) {
        this.voiceDetectedCount++;
        if (this.voiceDetectedCount === 3) {
          this.eventBus.emit("USER_STARTED_SPEAKING", { timestamp: Date.now() });
        }
      } else {
        this.voiceDetectedCount = 0;
      }

      this.eventBus.emit("AUDIO_ENERGY_UPDATED", {
        volume: normalizedVol,
        rms: Number(rms.toFixed(3)),
        isVoice,
      });

      this.animFrameId = requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    this.eventBus.emit("MIC_MUTED_CHANGED", { isMuted: muted });
  }

  getVolume(): number {
    return this.isMuted ? 0 : this.currentVolume;
  }

  getRMS(): number {
    return this.isMuted ? 0 : this.currentRms;
  }

  isVoiceDetected(): boolean {
    return !this.isMuted && this.currentVolume > this.voiceVolumeThreshold;
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }
}
