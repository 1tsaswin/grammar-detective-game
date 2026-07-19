"use client";

import { create } from "zustand";

export type ToastKind = "xp" | "levelup" | "achievement" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  subtitle?: string;
}

let nextId = 1;

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { ...toast, id: nextId++ }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
