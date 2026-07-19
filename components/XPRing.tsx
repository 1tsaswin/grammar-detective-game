"use client";

import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";

const SIZE = 108;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface XPRingProps {
  pct: number;
  level: number;
}

export function XPRing({ pct, level }: XPRingProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--crime-scene-red-bright)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 0.9, 0.35, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div className="text-2xl font-bold text-bone">{level}</div>
        <div className="font-typewriter text-[9px] tracking-[1px] text-bone/50">LEVEL</div>
      </div>
    </div>
  );
}
