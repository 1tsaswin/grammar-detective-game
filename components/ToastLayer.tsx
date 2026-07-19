"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Award, Sparkles, TrendingUp, Info } from "lucide-react";
import { useEffect } from "react";
import { useToastStore, type ToastItem } from "@/store/toastStore";
import { useSettingsStore } from "@/store/settingsStore";

const ICONS: Record<ToastItem["kind"], typeof Sparkles> = {
  xp: Sparkles,
  levelup: TrendingUp,
  achievement: Award,
  info: Info,
};

const ACCENTS: Record<ToastItem["kind"], string> = {
  xp: "border-post-it-yellow-dark text-crime-scene-red",
  levelup: "border-crime-scene-red text-crime-scene-red",
  achievement: "border-crime-scene-red text-crime-scene-red",
  info: "border-ink/25 text-ink/70",
};

function ToastRow({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const Icon = ICONS[toast.kind];

  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), 3200);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <motion.div
      layout
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 1.5, rotate: -4 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: 2 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      onClick={() => dismiss(toast.id)}
      className={`pointer-events-auto flex items-center gap-3 rounded-[2px] border-2 bg-aged-paper-light px-4 py-3 shadow-stacked ${ACCENTS[toast.kind]}`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      <div className="min-w-0">
        <div className="truncate font-typewriter text-[13px] tracking-[0.5px] text-ink">{toast.title}</div>
        {toast.subtitle && <div className="truncate text-[11px] text-ink/60">{toast.subtitle}</div>}
      </div>
    </motion.div>
  );
}

export function ToastLayer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-[70] flex flex-col items-center gap-2 px-4">
      <div className="flex w-full max-w-[400px] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastRow key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
