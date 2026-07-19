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
  xp: "border-post-it-yellow/60 text-post-it-yellow",
  levelup: "border-crime-scene-red-bright/60 text-crime-scene-red-bright",
  achievement: "border-crime-scene-red-bright/60 text-crime-scene-red-bright",
  info: "border-bone/30 text-bone",
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
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      onClick={() => dismiss(toast.id)}
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border bg-primary-noir/90 px-4 py-3 shadow-lifted backdrop-blur-md ${ACCENTS[toast.kind]}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <div className="truncate font-typewriter text-[13px] tracking-[0.5px] text-bone">{toast.title}</div>
        {toast.subtitle && <div className="truncate text-[11px] text-bone/60">{toast.subtitle}</div>}
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
