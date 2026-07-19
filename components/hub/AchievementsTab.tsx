"use client";

import { Award, Lock } from "lucide-react";
import { ACHIEVEMENTS, type AchievementState } from "@/lib/achievements";

export function AchievementsTab({ state }: { state: AchievementState }) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.isUnlocked(state)).length;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="font-typewriter text-[11px] tracking-[1px] text-bone/45">
        {unlockedCount} / {ACHIEVEMENTS.length} UNLOCKED
      </div>
      {ACHIEVEMENTS.map((a, i) => {
        const unlocked = a.isUnlocked(state);
        return (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-md p-3.5 shadow-lifted"
            style={{
              background: unlocked ? "var(--aged-paper-light)" : "rgba(255,255,255,0.04)",
              opacity: unlocked ? 1 : 0.55,
              animation: `fadeInUp 0.4s ${i * 0.06}s ease-out backwards`,
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background: unlocked ? "var(--crime-scene-red-bright)" : "rgba(255,255,255,0.08)",
              }}
            >
              {unlocked ? <Award className="h-5 w-5 text-bone" /> : <Lock className="h-4 w-4 text-bone/40" />}
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold ${unlocked ? "text-ink" : "text-bone/70"}`}>{a.title}</div>
              <div className={`text-[11px] ${unlocked ? "text-ink/60" : "text-bone/40"}`}>{a.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
