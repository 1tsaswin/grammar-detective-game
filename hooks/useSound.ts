"use client";

import { useCallback, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";

type SoundKind = "tap" | "success" | "error" | "levelup";

// Short procedural blips via WebAudio — no audio asset files needed.
const TONES: Record<SoundKind, { freqs: number[]; duration: number; type: OscillatorType }> = {
  tap: { freqs: [520], duration: 0.05, type: "sine" },
  success: { freqs: [660, 880], duration: 0.12, type: "sine" },
  error: { freqs: [220, 160], duration: 0.16, type: "sawtooth" },
  levelup: { freqs: [523, 659, 784, 1046], duration: 0.09, type: "sine" },
};

export function useSound() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!soundEnabled) return;
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!ctxRef.current) ctxRef.current = new AudioCtx();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const { freqs, duration, type } = TONES[kind];
      freqs.forEach((freq, i) => {
        const start = ctx.currentTime + i * duration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      });
    },
    [soundEnabled]
  );

  return { play };
}
