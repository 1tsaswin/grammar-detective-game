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
      className="sticky bottom-0 z-30 w-full bg-primary-noir/95 shadow-[0_-8px_24px_rgba(0,0,0,0.5)] box-border"
      style={{ borderTop: "2px solid var(--post-it-yellow-dark)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex w-full items-end justify-between px-2 pt-2">
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
              className="relative flex min-h-[56px] min-w-[48px] flex-1 flex-col items-end justify-end"
            >
              <motion.div
                animate={{ y: isActive ? -8 : 0 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
                className="flex w-full flex-col items-center gap-1 rounded-t-[3px] px-1 py-2"
                style={{
                  background: isActive ? "var(--aged-paper-light)" : "transparent",
                  boxShadow: isActive ? "0 -3px 8px rgba(0,0,0,0.4)" : "none",
                }}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.75}
                  style={{ color: isActive ? "var(--crime-scene-red)" : "var(--bone)", opacity: isActive ? 1 : 0.4 }}
                />
                <span
                  className="w-full truncate px-0.5 text-center font-typewriter text-[8px] tracking-[0.5px]"
                  style={{ color: isActive ? "var(--ink)" : "rgba(246,241,227,0.4)" }}
                >
                  {tab.label.toUpperCase()}
                </span>
              </motion.div>
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
          className="relative flex min-h-[56px] min-w-[48px] flex-1 flex-col items-end justify-end"
        >
          <div className="flex w-full flex-col items-center gap-1 px-1 py-2">
            <Settings className="h-5 w-5 text-bone/40" strokeWidth={1.75} />
            <span className="w-full truncate px-0.5 text-center font-typewriter text-[8px] tracking-[0.5px] text-bone/40">
              SETTINGS
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
