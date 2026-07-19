"use client";

import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";

export function XPBar({ pct, className = "" }: { pct: number; className?: string }) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  return (
    <div className={`h-2 overflow-hidden rounded bg-white/12 ${className}`}>
      <motion.div
        className="h-full bg-crime-scene-red-bright"
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 0.9, 0.35, 1] }}
      />
    </div>
  );
}
