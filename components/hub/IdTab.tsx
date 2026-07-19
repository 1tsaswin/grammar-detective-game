"use client";

import { DetectiveID } from "@/components/DetectiveID";
import { XPRing } from "@/components/XPRing";
import { AnimatedButton } from "@/components/AnimatedButton";
import type { HistoryEntry } from "@/lib/cases";

interface IdTabProps {
  previewName: string;
  title: string;
  avatarTint: string;
  rankName: string;
  casesSolvedCount: number;
  level: number;
  xp: number;
  xpIntoLevel: number;
  accuracy: number | null;
  longestStreak: number;
  lastSolved: HistoryEntry | null;
  onViewEvidence: () => void;
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 rounded-[2px] border-t-2 border-crime-scene-red bg-aged-paper-light px-2 py-3 text-center shadow-lifted">
      <div className="text-xl font-bold text-ink">{value}</div>
      <div className="mt-0.5 font-typewriter text-[9px] tracking-[1px] text-ink/60">{label}</div>
    </div>
  );
}

export function IdTab({
  previewName,
  title,
  avatarTint,
  rankName,
  casesSolvedCount,
  level,
  xp,
  xpIntoLevel,
  accuracy,
  longestStreak,
  lastSolved,
  onViewEvidence,
}: IdTabProps) {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col items-center gap-2">
        <DetectiveID
          detectiveName={previewName}
          title={title}
          badgeNumber="GD-0001"
          joinDate="Est. 2026"
          avatarTint={avatarTint}
        />
        <div className="font-typewriter text-[11px] tracking-[1.5px] text-crime-scene-red-bright">{rankName}</div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <XPRing pct={xpIntoLevel} level={level} />
        <div className="font-typewriter text-[11px] tracking-[0.5px] text-bone/60">
          {xpIntoLevel} / 100 XP to LEVEL {level + 1}
        </div>
      </div>

      <div className="flex gap-2.5">
        <StatTile value={casesSolvedCount} label="CASES SOLVED" />
        <StatTile value={xp} label="TOTAL XP" />
        <StatTile value={accuracy === null ? "—" : `${accuracy}%`} label="ACCURACY" />
      </div>
      <div className="flex gap-2.5">
        <StatTile value={longestStreak} label="LONGEST STREAK" />
      </div>

      {lastSolved && (
        <AnimatedButton
          onClick={onViewEvidence}
          className="box-border w-full rounded-sm bg-post-it-yellow p-3.5 text-left shadow-pinned transition-transform hover:-translate-y-0.5 hover:rotate-0"
          style={{ transform: "rotate(-1deg)" }}
        >
          <div className="font-typewriter text-[10px] tracking-[1px] text-ink/60">LAST CASE CLOSED</div>
          <div className="mt-[3px] text-sm font-semibold text-ink">{lastSolved.title}</div>
          <div className="mt-1 font-typewriter text-[10px] text-crime-scene-red">{lastSolved.grammarType}</div>
        </AnimatedButton>
      )}
    </div>
  );
}
