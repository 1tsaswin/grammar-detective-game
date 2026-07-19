"use client";

import { CheckCircle2, Lock, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { CaseDef } from "@/lib/cases";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useSettingsStore } from "@/store/settingsStore";

interface CasesTabProps {
  cases: CaseDef[];
  level: number;
  solvedIds: number[];
  deniedCase: number | null;
  onOpenCase: (id: number, requiredLevel: number) => void;
}

export function CasesTab({ cases, level, solvedIds, deniedCase, onOpenCase }: CasesTabProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const nextCase = cases.find((c) => !solvedIds.includes(c.id) && level >= c.level) ?? null;
  const solvedPct = (solvedIds.length / cases.length) * 100;

  return (
    <div className="flex flex-col gap-3.5 pb-20">
      <div>
        <div className="mb-1.5 flex items-center justify-between font-typewriter text-[11px] tracking-[1px] text-bone/45">
          <span>{solvedIds.length} / {cases.length} CASES SOLVED</span>
          <span>{Math.round(solvedPct)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-crime-scene-red-bright transition-[width] duration-500 ease-out"
            style={{ width: `${solvedPct}%` }}
          />
        </div>
      </div>

      {cases.map((c, i) => {
        const locked = level < c.level;
        const solved = solvedIds.includes(c.id);
        const shaking = deniedCase === c.id;
        return (
          <AnimatedButton
            key={c.id}
            onClick={() => onOpenCase(c.id, c.level)}
            sound={locked ? "error" : "none"}
            haptic={locked ? "error" : "none"}
            className="w-full rounded-[2px] bg-aged-paper p-4 text-left shadow-stacked transition-[transform,box-shadow] duration-[180ms] hover:-translate-y-1 hover:rotate-[-1deg] hover:shadow-lifted"
            style={{
              opacity: locked ? 0.45 : 1,
              cursor: locked ? "not-allowed" : "pointer",
              animation: shaking
                ? "shakeX 0.4s ease-in-out"
                : `fadeInUp 0.4s ${i * 0.08}s ease-out backwards`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-typewriter text-[11px] tracking-[1px] text-crime-scene-red">{c.label}</div>
              {solved && (
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-crime-scene-red/10 px-2 py-0.5">
                  <CheckCircle2 className="h-3 w-3 text-crime-scene-red" />
                  <span className="font-typewriter text-[9px] tracking-[0.5px] text-crime-scene-red">SOLVED</span>
                </div>
              )}
            </div>
            <div className="mt-1 text-[15px] font-semibold text-ink">{c.title}</div>
            {locked ? (
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-ink/55">
                <Lock className="h-3 w-3 shrink-0" />
                Unlocks at Level {c.level}
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate font-typewriter text-[10px] tracking-[0.5px] text-ink/50">
                  {c.grammarType}
                </span>
                <span className="shrink-0 font-typewriter text-[10px] font-semibold tracking-[0.5px] text-crime-scene-red">
                  +{c.xp} XP
                </span>
              </div>
            )}
          </AnimatedButton>
        );
      })}

      {nextCase && (
        <motion.button
          type="button"
          onClick={() => onOpenCase(nextCase.id, nextCase.level)}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="fixed bottom-[104px] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full bg-crime-scene-red-bright px-6 py-3 shadow-stacked"
          style={{ boxShadow: "0 10px 30px rgba(165,47,40,0.5), 0 2px 3px rgba(0,0,0,0.65)" }}
          aria-label={`Investigate ${nextCase.title}`}
        >
          <Search className="h-5 w-5 text-bone" />
          <span className="font-typewriter text-[10px] tracking-[1px] text-bone">INVESTIGATE</span>
        </motion.button>
      )}
    </div>
  );
}
