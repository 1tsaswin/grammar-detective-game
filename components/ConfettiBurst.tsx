"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";

const COLORS = ["var(--bone)", "var(--post-it-yellow)", "var(--crime-scene-red-bright)", "var(--aged-paper)"];
const PIECE_COUNT = 28;

interface Piece {
  id: number;
  x: number;
  rotate: number;
  delay: number;
  duration: number;
  color: string;
  drift: number;
}

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, id) => ({
    id,
    x: Math.random() * 100,
    rotate: Math.random() * 360,
    delay: Math.random() * 0.25,
    duration: 1.6 + Math.random() * 0.6,
    color: COLORS[id % COLORS.length],
    drift: (Math.random() - 0.5) * 60,
  }));
}

// Lightweight CSS/JS confetti burst — no external library. Mount with a
// fresh `key` each time to replay (e.g. `<ConfettiBurst key={level} />`).
export function ConfettiBurst() {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const [pieces] = useState(reduceMotion ? [] : makePieces);

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-10px] block h-2.5 w-1.5 rounded-[1px]"
          style={{ left: `${p.x}%`, background: p.color }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", x: p.drift, rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
