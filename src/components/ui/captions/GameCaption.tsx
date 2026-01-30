"use client";

import { motion, type Variants } from "framer-motion";

/**
 * 3단계 자막 시스템 (P0)
 *
 * 사용 예:
 *   <GameCaption type="entertainment" text="레전드 묘수 등장!" />
 *   <GameCaption type="situation" text="체크메이트 위기!" />
 *   <GameCaption type="explanation" text="상대의 퀸을 유인하는 전략입니다." />
 */

/** 3단계 자막 타입: 예능형 | 상황형 | 설명형 */
export type GameCaptionType = "entertainment" | "situation" | "explanation";

type Props = {
  /** 자막 텍스트 */
  text: string;
  /** 스타일: 예능형(중앙/튀어오름), 상황형(모서리/깜빡임), 설명형(하단/스트리밍) */
  type: GameCaptionType;
  /** 표시 여부 */
  visible?: boolean;
  /** 애니메이션 종료 시 콜백 */
  onComplete?: () => void;
};

// —— 예능형: 화면 중앙, 크게, 튀어 오르는 효과
const entertainmentVariants: Variants = {
  initial: { scale: 0.2, opacity: 0, y: 40 },
  animate: {
    scale: 1.15,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 14,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.25 },
  },
};

// —— 상황형: 깜빡이는 애니메이션
const situationVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0.6, 1, 0.6, 1],
    transition: {
      opacity: {
        repeat: Infinity,
        duration: 1.2,
      },
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// —— 설명형: 하단에서 부드럽게 등장 (스트리밍 자막)
const explanationVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.3 },
  },
};

export function GameCaption({
  text,
  type,
  visible = true,
  onComplete,
}: Props) {
  if (!visible || !text) return null;

  const ariaLabel =
    type === "entertainment"
      ? "예능 자막"
      : type === "situation"
        ? "상황 자막"
        : "설명 자막";

  // —— 예능형: 화면 중앙, 크게, 튀어 오르는 효과
  if (type === "entertainment") {
    return (
      <motion.div
        role="status"
        aria-live="assertive"
        aria-label={ariaLabel}
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        initial={false}
      >
        <motion.span
          variants={entertainmentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationComplete={() => onComplete?.()}
          className="inline-block px-8 py-4 text-3xl font-black tracking-wide text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.9)]"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
        >
          {text}
        </motion.span>
      </motion.div>
    );
  }

  // —— 상황형: 보드 모서리, 빨간색, 깜빡이는 긴박한 텍스트
  if (type === "situation") {
    return (
      <motion.div
        role="alert"
        aria-live="assertive"
        aria-label={ariaLabel}
        className="pointer-events-none fixed left-4 top-4 right-4 z-50 flex justify-center md:left-8 md:top-8 md:right-auto"
        initial={false}
      >
        <motion.span
          variants={situationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="inline-block rounded-lg border-2 border-red-500 bg-red-950/90 px-5 py-2.5 text-lg font-bold text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
        >
          {text}
        </motion.span>
      </motion.div>
    );
  }

  // —— 설명형: 하단, 부드럽게 나타나는 스트리밍 자막
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className="pointer-events-none fixed bottom-8 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
      initial={false}
    >
      <motion.span
        variants={explanationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onAnimationComplete={() => onComplete?.()}
        className="inline-block rounded-lg border border-slate-600/80 bg-slate-900/95 px-5 py-3 text-base font-medium text-slate-200 shadow-lg"
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
