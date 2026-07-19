"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";

const MOTE_COUNT = 14;

interface Mote {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

function makeMotes(): Mote[] {
  return Array.from({ length: MOTE_COUNT }, (_, id) => ({
    id,
    x: Math.random() * 100,
    size: 1.5 + Math.random() * 2,
    duration: 14 + Math.random() * 10,
    delay: Math.random() * -20,
    drift: (Math.random() - 0.5) * 40,
  }));
}

// Slow drifting dust motes over the corkboard — pure decoration, no data
// backing needed. Off entirely when Reduce Motion is on.
//
// Rendered via next/dynamic with ssr: false (see Home.tsx), so this only
// ever mounts client-side — safe to seed Math.random() motes once via a
// lazy useState initializer without risking a hydration mismatch.
export function AmbientParticles() {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const [motes] = useState<Mote[]>(() => (reduceMotion ? [] : makeMotes()));

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full bg-post-it-yellow/20"
          style={{ left: `${m.x}%`, width: m.size, height: m.size, bottom: -10 }}
          animate={{
            y: ["0vh", "-110vh"],
            x: [0, m.drift],
            opacity: [0, 0.5, 0.5, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
