"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";
import { useSound, type SoundKind } from "@/hooks/useSound";
import { useHaptic } from "@/hooks/useHaptic";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleSeq = 0;

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "onClick" | "children"> {
  onClick?: () => void;
  sound?: SoundKind | "none";
  haptic?: "tap" | "success" | "error" | "none";
  children?: ReactNode;
}

// Standard tappable surface for the game shell: min 48px touch target,
// spring press feedback, tap-point ripple, optional procedural sound +
// haptic buzz. Real <button> under the hood so it's keyboard- and
// screen-reader-accessible.
export function AnimatedButton({
  onClick,
  sound = "tap",
  haptic = "tap",
  className,
  children,
  disabled,
  ...rest
}: AnimatedButtonProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const { play } = useSound();
  const { vibrate } = useHaptic();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function spawnRipple(e: PointerEvent<HTMLButtonElement>) {
    if (reduceMotion || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const id = rippleSeq++;
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, size }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }

  function handleClick() {
    if (disabled) return;
    if (sound !== "none") play(sound);
    if (haptic !== "none") vibrate(haptic);
    onClick?.();
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onPointerDown={spawnRipple}
      disabled={disabled}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className={`relative min-h-[48px] overflow-hidden disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ""}`}
      {...rest}
    >
      {children}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            marginLeft: -r.size / 2,
            marginTop: -r.size / 2,
            background:
              "radial-gradient(circle, rgba(246,241,227,0.32) 0%, rgba(246,241,227,0.1) 55%, transparent 75%)",
            filter: "blur(2px)",
          }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 0.55, times: [0, 0.35, 1], ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
}
