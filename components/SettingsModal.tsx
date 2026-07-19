"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { X, Volume2, Vibrate, Waves, Sun, CircleDot, Type } from "lucide-react";
import { useSettingsStore, type TextSize } from "@/store/settingsStore";
import { modalVariants } from "@/lib/animations";
import { AnimatedButton } from "@/components/AnimatedButton";

const TEXT_SIZES: { id: TextSize; label: string }[] = [
  { id: "sm", label: "A" },
  { id: "md", label: "A" },
  { id: "lg", label: "A" },
];

function Row({ icon: Icon, label, children }: { icon: typeof Volume2; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-bone/60" />
        <span className="truncate text-sm text-bone">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-crime-scene-red-bright" : "bg-white/15"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 h-5 w-5 rounded-full bg-bone shadow"
        style={{ left: on ? "calc(100% - 24px)" : "4px" }}
      />
    </button>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const {
    soundEnabled,
    reduceMotion,
    hapticEnabled,
    textSize,
    brightness,
    vignetteStrength,
    toggleSound,
    toggleReduceMotion,
    toggleHaptic,
    setTextSize,
    setBrightness,
    setVignetteStrength,
  } = useSettingsStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants(reduceMotion)}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="box-border max-h-[85vh] w-full max-w-[400px] overflow-y-auto rounded-3xl border border-white/10 bg-primary-noir/95 p-6 shadow-stacked"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="font-typewriter text-sm tracking-[1.5px] text-bone">SETTINGS</div>
          <AnimatedButton
            onClick={onClose}
            sound="tap"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-bone hover:bg-white/15"
          >
            <X className="h-4 w-4" />
          </AnimatedButton>
        </div>

        <div className="divide-y divide-white/8">
          <Row icon={Volume2} label="Sound Effects">
            <Toggle on={soundEnabled} onToggle={toggleSound} label="Sound Effects" />
          </Row>
          <Row icon={Waves} label="Reduce Motion">
            <Toggle on={reduceMotion} onToggle={toggleReduceMotion} label="Reduce Motion" />
          </Row>
          <Row icon={Vibrate} label="Haptic Feedback">
            <Toggle on={hapticEnabled} onToggle={toggleHaptic} label="Haptic Feedback" />
          </Row>

          <Row icon={Type} label="Text Size">
            <div className="flex gap-1.5">
              {TEXT_SIZES.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setTextSize(t.id)}
                  aria-label={`Text size ${t.id}`}
                  aria-pressed={textSize === t.id}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[13px] ${
                    textSize === t.id
                      ? "border-crime-scene-red-bright bg-crime-scene-red-bright/20 text-crime-scene-red-bright"
                      : "border-white/15 text-bone/50"
                  }`}
                  style={{ fontSize: 11 + i * 3 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Row>

          <div className="py-3">
            <div className="mb-2 flex items-center gap-3">
              <Sun className="h-4 w-4 shrink-0 text-bone/60" />
              <span className="text-sm text-bone">Brightness</span>
              <span className="ml-auto font-typewriter text-[11px] text-bone/50">{brightness}%</span>
            </div>
            <input
              type="range"
              min={60}
              max={120}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-[var(--crime-scene-red-bright)]"
              aria-label="Brightness"
            />
          </div>

          <div className="py-3">
            <div className="mb-2 flex items-center gap-3">
              <CircleDot className="h-4 w-4 shrink-0 text-bone/60" />
              <span className="text-sm text-bone">Vignette Strength</span>
              <span className="ml-auto font-typewriter text-[11px] text-bone/50">{vignetteStrength}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={vignetteStrength}
              onChange={(e) => setVignetteStrength(Number(e.target.value))}
              className="w-full accent-[var(--crime-scene-red-bright)]"
              aria-label="Vignette Strength"
            />
          </div>
        </div>

        <div className="mt-4 border-t border-white/8 pt-4 text-center">
          <div className="font-typewriter text-[10px] tracking-[1px] text-bone/35">
            GRAMMAR DETECTIVE — THE ALIBI ERROR
          </div>
          <div className="mt-1 text-[10px] text-bone/25">v0.1.0</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
