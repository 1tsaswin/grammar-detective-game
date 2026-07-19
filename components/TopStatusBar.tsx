"use client";

import { Shield } from "lucide-react";
import { XPBar } from "@/components/XPBar";

interface TopStatusBarProps {
  rankName: string;
  level: number;
  xpIntoLevel: number;
  chapterLabel: string;
}

// Sticky glass status bar — always visible on hub screens so rank/XP
// progress reads as persistent game state, not a page-by-page stat.
export function TopStatusBar({ rankName, level, xpIntoLevel, chapterLabel }: TopStatusBarProps) {
  return (
    <div
      className="sticky top-0 z-30 flex w-full items-center gap-3 border-b border-white/10 bg-primary-noir/75 px-4 py-3 shadow-lifted backdrop-blur-md box-border"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crime-scene-red-dark/60 ring-1 ring-crime-scene-red-bright/40">
        <Shield className="h-4 w-4 text-crime-scene-red-bright" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-[10px] tracking-[1px] text-bone/60">
          <span className="truncate font-typewriter">{rankName}</span>
          <span className="shrink-0 pl-2 font-typewriter">LV {level}</span>
        </div>
        <XPBar pct={xpIntoLevel} className="mt-1" />
      </div>
      <div className="shrink-0 max-w-[90px] truncate text-right font-typewriter text-[10px] tracking-[1px] text-bone/45">
        {chapterLabel}
      </div>
    </div>
  );
}
