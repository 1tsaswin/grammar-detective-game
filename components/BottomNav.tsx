"use client";

import { motion } from "framer-motion";
import { Folder, ScrollText, IdCard, Award, Settings } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useSound } from "@/hooks/useSound";
import { useHaptic } from "@/hooks/useHaptic";

export type HubTab = "cases" | "evidence" | "id" | "achievements";

const TABS: { id: HubTab; label: string; icon: typeof Folder }[] = [
  { id: "cases", label: "Cases", icon: Folder },
  { id: "evidence", label: "Evidence", icon: ScrollText },
  { id: "id", label: "Detective ID", icon: IdCard },
  { id: "achievements", label: "Achievements", icon: Award },
];

interface BottomNavProps {
  active: HubTab;
  onChange: (tab: HubTab) => void;
  onOpenSettings: () => void;
}

// "Detective Toolkit" — persistent bottom nav for the hub. Never unmounts
// while the player is in the hub; only the content above it scrolls.
export function BottomNav({ active, onChange, onOpenSettings }: BottomNavProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const { play } = useSound();
  const { vibrate } = useHaptic();

  function select(tab: HubTab) {
    if (tab === active) return;
    play("tap");
    vibrate("tap");
    onChange(tab);
  }

  return (
    <div
      className="sticky bottom-0 z-30 w-full border-t border-white/10 bg-primary-noir/85 shadow-[0_-8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md box-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex w-full items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => select(tab.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
              className="relative flex min-h-[56px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-x-2 top-1 h-8 rounded-lg bg-crime-scene-red-bright/15 ring-1 ring-crime-scene-red-bright/40"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <motion.span
                animate={isActive ? { scale: 1.12, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="relative z-10"
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-crime-scene-red-bright" : "text-bone/40"}`} />
              </motion.span>
              <span
                className={`relative z-10 font-typewriter text-[8px] tracking-[0.5px] ${
                  isActive ? "text-crime-scene-red-bright" : "text-bone/40"
                }`}
              >
                {tab.label.toUpperCase()}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            play("tap");
            vibrate("tap");
            onOpenSettings();
          }}
          aria-label="Settings"
          className="flex min-h-[56px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1 py-2"
        >
          <Settings className="h-5 w-5 text-bone/40" />
          <span className="font-typewriter text-[8px] tracking-[0.5px] text-bone/40">SETTINGS</span>
        </button>
      </div>
    </div>
  );
}
