"use client";

import { useCallback, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export type SoundKind =
  | "tap"
  | "select"
  | "toggle"
  | "type"
  | "success"
  | "correct"
  | "error"
  | "levelup"
  | "achievement"
  | "stamp";

// Short procedural blips via WebAudio — no audio asset files needed.
const TONES: Partial<Record<SoundKind, { freqs: number[]; duration: number; type: OscillatorType; peak?: number }>> = {
  tap: { freqs: [520], duration: 0.05, type: "sine" },
  select: { freqs: [740], duration: 0.035, type: "sine", peak: 0.08 },
  toggle: { freqs: [900, 560], duration: 0.045, type: "sine", peak: 0.09 },
  success: { freqs: [660, 880], duration: 0.12, type: "sine" },
  correct: { freqs: [784, 1046], duration: 0.08, type: "sine", peak: 0.1 },
  error: { freqs: [220, 160], duration: 0.16, type: "sawtooth" },
  levelup: { freqs: [523, 659, 784, 1046], duration: 0.09, type: "sine" },
  achievement: { freqs: [784, 988, 1318], duration: 0.1, type: "triangle", peak: 0.1 },
};

// Filtered-noise hits layer a percussive/tactile texture on top of (or
// instead of) the pure tones above — a typewriter clack or an ink-stamp
// thud reads as "real" in a way a sine blip alone can't.
const NOISE_HITS: Partial<
  Record<SoundKind, { duration: number; filterType: BiquadFilterType; filterFreq: number; q?: number; peak: number; thumpFreq?: number }>
> = {
  type: { duration: 0.02, filterType: "bandpass", filterFreq: 2600, q: 5, peak: 0.05 },
  stamp: { duration: 0.16, filterType: "lowpass", filterFreq: 350, q: 0.7, peak: 0.22, thumpFreq: 85 },
};

export function useSound() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) ctxRef.current = new AudioCtx();
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  const getNoiseBuffer = useCallback((ctx: AudioContext) => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const length = Math.floor(ctx.sampleRate * 0.3);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    noiseBufferRef.current = buffer;
    return buffer;
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!soundEnabled) return;
      const ctx = getCtx();
      if (!ctx) return;

      const tone = TONES[kind];
      if (tone) {
        const peak = tone.peak ?? 0.12;
        tone.freqs.forEach((freq, i) => {
          const start = ctx.currentTime + i * tone.duration;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = tone.type;
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + tone.duration + 0.02);
        });
      }

      const hit = NOISE_HITS[kind];
      if (hit) {
        const start = ctx.currentTime;
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);
        const filter = ctx.createBiquadFilter();
        filter.type = hit.filterType;
        filter.frequency.value = hit.filterFreq;
        filter.Q.value = hit.q ?? 1;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(hit.peak, start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + hit.duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(start);
        noise.stop(start + hit.duration + 0.02);

        if (hit.thumpFreq) {
          const thumpOsc = ctx.createOscillator();
          const thumpGain = ctx.createGain();
          thumpOsc.type = "sine";
          thumpOsc.frequency.setValueAtTime(hit.thumpFreq, start);
          thumpOsc.frequency.exponentialRampToValueAtTime(hit.thumpFreq * 0.6, start + hit.duration);
          thumpGain.gain.setValueAtTime(0.0001, start);
          thumpGain.gain.exponentialRampToValueAtTime(hit.peak * 0.9, start + 0.008);
          thumpGain.gain.exponentialRampToValueAtTime(0.0001, start + hit.duration);
          thumpOsc.connect(thumpGain);
          thumpGain.connect(ctx.destination);
          thumpOsc.start(start);
          thumpOsc.stop(start + hit.duration + 0.02);
        }
      }
    },
    [soundEnabled, getCtx, getNoiseBuffer]
  );

  return { play };
}
