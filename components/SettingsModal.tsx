"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { X, Volume2, Vibrate, Waves, Sun, CircleDot, Type } from "lucide-react";
import { useSettingsStore, type TextSize } from "@/store/settingsStore";
import { drawerVariants } from "@/lib/animations";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useSound } from "@/hooks/useSound";
import { useHaptic } from "@/hooks/useHaptic";

const TEXT_SIZES: { id: TextSize; label: string }[] = [
  { id: "sm", label: "A" },
  { id: "md", label: "A" },
  { id: "lg", label: "A" },
];

function Row({ icon: Icon, label, children }: { icon: typeof Volume2; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-bone/60" strokeWidth={1.5} />
        <span className="truncate text-sm text-bone">{label}</span>
      </div>
      {children}
    </div>
  );
}

// A recessed panel-mount toggle, like a breaker switch: the lever snaps to
// the top slot (on) or bottom slot (off) rather than sliding a pill knob
// side to side — reads as hardware bolted to the drawer, not an iOS switch.
function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const { play } = useSound();
  const { vibrate } = useHaptic();

  function handleClick() {
    play("toggle");
    vibrate("tap");
    onToggle();
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={handleClick}
      className="relative h-9 w-6 shrink-0 rounded-[3px] border border-black/50 bg-black/30 shadow-[inset_0_2px_5px_rgba(0,0,0,0.65)]"
    >
      <span
        className="pointer-events-none absolute inset-x-[3px] top-[3px] bottom-[3px] rounded-[2px] transition-colors duration-200"
        style={{ background: on ? "rgba(165,47,40,0.3)" : "transparent" }}
      />
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 520, damping: 30 }}
        className="absolute inset-x-[3px] h-[14px] rounded-[2px] border border-black/40"
        style={{
          top: on ? "3px" : "calc(100% - 17px)",
          background: "linear-gradient(180deg, var(--post-it-yellow-light) 0%, var(--post-it-yellow-dark) 100%)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
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
  const { play } = useSound();
  const { vibrate } = useHaptic();

  function selectTextSize(size: TextSize) {
    play("tap");
    vibrate("tap");
    setTextSize(size);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={drawerVariants(reduceMotion)}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="box-border max-h-[85dvh] w-full max-w-[430px] overflow-y-auto border-x border-white/10 bg-primary-noir/97 p-6 shadow-stacked"
        style={{
          borderTop: "3px solid var(--post-it-yellow-dark)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="font-typewriter text-sm tracking-[1.5px] text-bone">SETTINGS</div>
          <AnimatedButton
            onClick={onClose}
            sound="tap"
            className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-bone/20 bg-black/30 text-bone/70 hover:bg-black/50"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
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
                  onClick={() => selectTextSize(t.id)}
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
              className="dial-slider w-full"
              style={{ ["--fill" as string]: `${((brightness - 60) / 60) * 100}%` } as React.CSSProperties}
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
              className="dial-slider w-full"
              style={{ ["--fill" as string]: `${vignetteStrength}%` } as React.CSSProperties}
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
