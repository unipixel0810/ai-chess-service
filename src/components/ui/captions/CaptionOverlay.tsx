"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { EntertainmentCaption, type CaptionVariant } from "./EntertainmentCaption";

/** 데모용: 상황별 예능 자막을 보여줌. 실제 게임에서는 체스 결과/이벤트와 연동 */
const DEMO_CAPTIONS: { text: string; variant: CaptionVariant }[] = [
  { text: "Brilliant!!", variant: "brilliant" },
  { text: "멘붕 주의", variant: "stress" },
  { text: "실수각?!", variant: "blunder" },
  { text: "체크!", variant: "check" },
  { text: "승리!", variant: "win" },
  { text: "패배...", variant: "lose" },
];

const CAPTION_DURATION_MS = 2000;

export function CaptionOverlay() {
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (current === null) return;
    const t = setTimeout(() => setCurrent(null), CAPTION_DURATION_MS);
    return () => clearTimeout(t);
  }, [current]);

  const showNext = () => {
    const next = current === null ? 0 : (current + 1) % DEMO_CAPTIONS.length;
    setCurrent(next);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2 items-center">
      <span className="text-sm text-slate-400">예능 자막 데모:</span>
      {DEMO_CAPTIONS.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setCurrent(i)}
          className="rounded bg-slate-700 px-2 py-1 text-sm text-slate-200 hover:bg-slate-600"
        >
          {c.text}
        </button>
      ))}
      <button
        type="button"
        onClick={showNext}
        className="rounded bg-cyan-800 px-2 py-1 text-sm text-cyan-100 hover:bg-cyan-700"
      >
        다음 자막
      </button>
      <AnimatePresence mode="wait">
        {current !== null && (
          <EntertainmentCaption
            key={current}
            text={DEMO_CAPTIONS[current].text}
            variant={DEMO_CAPTIONS[current].variant}
            visible
            onExit={() => setCurrent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
