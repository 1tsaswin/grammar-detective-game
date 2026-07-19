"use client";

import type { HistoryEntry } from "@/lib/cases";

export function EvidenceTab({ caseHistory }: { caseHistory: HistoryEntry[] }) {
  if (caseHistory.length === 0) {
    return <div className="mt-10 text-center text-sm text-bone/50">No evidence collected yet.</div>;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {caseHistory.map((h, i) => (
        <div
          key={i}
          className="rounded-[2px] bg-aged-paper p-3.5 shadow-photo"
          style={{ animation: "fadeInUp 0.4s ease-out backwards", animationDelay: `${i * 0.08}s` }}
        >
          <div className="text-[13px] font-semibold text-ink">{h.title}</div>
          <div className="mt-0.5 text-[11px] text-ink/60">Solved · +{h.xp} XP</div>
          <div className="mt-1.5 font-typewriter text-[10px] tracking-[0.5px] text-crime-scene-red">
            {h.grammarType}
          </div>
        </div>
      ))}
    </div>
  );
}
