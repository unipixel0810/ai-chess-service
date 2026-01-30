"use client";

import { motion, type Variants } from "framer-motion";

export type CaptionVariant = "brilliant" | "blunder" | "stress" | "check" | "win" | "lose";

const variantStyles: Record<CaptionVariant, string> = {
  brilliant: "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]",
  blunder: "text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]",
  stress: "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.7)]",
  check: "text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]",
  win: "text-emerald-400 drop-shadow-[0_0_14px_rgba(52,211,153,0.9)]",
  lose: "text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]",
};

const animationVariants: Variants = {
  initial: { scale: 0.3, opacity: 0, y: 20 },
  animate: {
    scale: 1.2,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

type Props = {
  text: string;
  variant?: CaptionVariant;
  visible: boolean;
  onExit?: () => void;
};

/**
 * 예능 스타일 자막: 'Brilliant!!', '멘붕 주의' 등 화면에 튀어나오는 스타일
 */
export function EntertainmentCaption({ text, variant = "brilliant", visible, onExit }: Props) {
  if (!visible) return null;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={false}
    >
      <motion.span
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onAnimationComplete={() => onExit?.()}
        className={`inline-block px-6 py-3 text-3xl font-black uppercase tracking-wider ${variantStyles[variant]}`}
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
