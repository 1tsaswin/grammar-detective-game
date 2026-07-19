"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/store/settingsStore";

type HapticKind = "tap" | "success" | "error";

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,
  success: [10, 30, 20],
  error: [30, 40, 30],
};

export function useHaptic() {
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

  const vibrate = useCallback(
    (kind: HapticKind = "tap") => {
      if (!hapticEnabled) return;
      if (typeof navigator === "undefined" || !navigator.vibrate) return;
      navigator.vibrate(PATTERNS[kind]);
    },
    [hapticEnabled]
  );

  return { vibrate };
}
