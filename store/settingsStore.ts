"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TextSize = "sm" | "md" | "lg";

interface SettingsState {
  soundEnabled: boolean;
  reduceMotion: boolean;
  hapticEnabled: boolean;
  textSize: TextSize;
  brightness: number; // 60-120, CSS filter brightness %
  vignetteStrength: number; // 0-100
  toggleSound: () => void;
  toggleReduceMotion: () => void;
  toggleHaptic: () => void;
  setTextSize: (size: TextSize) => void;
  setBrightness: (value: number) => void;
  setVignetteStrength: (value: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      reduceMotion: false,
      hapticEnabled: true,
      textSize: "md",
      brightness: 100,
      vignetteStrength: 60,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
      toggleHaptic: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
      setTextSize: (size) => set({ textSize: size }),
      setBrightness: (value) => set({ brightness: value }),
      setVignetteStrength: (value) => set({ vignetteStrength: value }),
    }),
    { name: "gd-settings" }
  )
);
