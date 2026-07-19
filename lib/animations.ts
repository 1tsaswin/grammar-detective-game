import type { Variants, Transition } from "framer-motion";

// Shared Framer Motion primitives. Every screen/component should read
// useSettingsStore().reduceMotion and pass `instant` accordingly rather than
// hardcoding durations, so "Reduce Motion" in Settings actually does something.

export const springy: Transition = { type: "spring", stiffness: 380, damping: 30 };
export const springyModal: Transition = { type: "spring", stiffness: 340, damping: 26 };

export function pageVariants(instant: boolean): Variants {
  if (instant) {
    return { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } };
  }
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
  };
}

export function modalVariants(instant: boolean): Variants {
  if (instant) {
    return { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } };
  }
  return {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1, transition: springyModal },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
  };
}

// A drawer/panel that slides up from the bottom edge, like pulling out a
// cabinet drawer, rather than a card fading/scaling in from the center.
export function drawerVariants(instant: boolean): Variants {
  if (instant) {
    return { initial: { y: 0 }, animate: { y: 0 }, exit: { y: 0 } };
  }
  return {
    initial: { y: "100%" },
    animate: { y: 0, transition: { type: "spring", stiffness: 320, damping: 32 } },
    exit: { y: "100%", transition: { duration: 0.22, ease: "easeIn" } },
  };
}

export const tapScale = { scale: 0.96 };
