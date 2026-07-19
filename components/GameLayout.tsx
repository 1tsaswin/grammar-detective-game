"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopStatusBar } from "@/components/TopStatusBar";
import { BottomNav, type HubTab } from "@/components/BottomNav";
import { SettingsModal } from "@/components/SettingsModal";
import { ToastLayer } from "@/components/ToastLayer";
import { useSettingsStore } from "@/store/settingsStore";
import { pageVariants } from "@/lib/animations";
import { videoSrc } from "@/lib/video";

const TAB_LABELS: Record<HubTab, string> = {
  cases: "CASE FILES",
  evidence: "EVIDENCE",
  id: "DETECTIVE ID",
  achievements: "ACHIEVEMENTS",
};

interface GameLayoutProps {
  rankName: string;
  level: number;
  xpIntoLevel: number;
  activeTab: HubTab;
  onTabChange: (tab: HubTab) => void;
  children: ReactNode;
}

// The persistent game shell for hub screens: sticky status bar + sticky
// bottom nav bracket a single scrollable content area. Neither bar ever
// unmounts while navigating between tabs — only `children` swaps.
export function GameLayout({ rankName, level, xpIntoLevel, activeTab, onTabChange, children }: GameLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
      {!reduceMotion && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
            src={videoSrc("corkboard-ambience.mp4")}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/35" />
        </>
      )}
      <TopStatusBar
        rankName={rankName}
        level={level}
        xpIntoLevel={xpIntoLevel}
        chapterLabel={TAB_LABELS[activeTab]}
      />
      <div className="relative box-border flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          variants={pageVariants(reduceMotion)}
          initial="initial"
          animate="animate"
          className="absolute inset-0 overflow-y-auto px-5 py-5"
        >
          {children}
        </motion.div>
      </div>
      <BottomNav active={activeTab} onChange={onTabChange} onOpenSettings={() => setSettingsOpen(true)} />
      <ToastLayer />
      <AnimatePresence>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
