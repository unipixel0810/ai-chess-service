"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DnaSnapshot } from "@/lib/dna/DnaAnalyzer";
import type { GameResult } from "@/lib/marcusFeedback";
import { getMarcusFeedback } from "@/lib/marcusFeedback";

export type HighlightCaption = { text: string; type: string };

type Props = {
  open: boolean;
  result: GameResult;
  dnaSnapshot: DnaSnapshot;
  highlightCaptions: HighlightCaption[];
  onClose: () => void;
  onPlayAgain: () => void;
};

export function ChessDNAReport({
  open,
  result,
  dnaSnapshot,
  highlightCaptions,
  onClose,
  onPlayAgain,
}: Props) {
  const marcusLine = getMarcusFeedback(result, dnaSnapshot);
  const resultLabel =
    result === "win" ? "승리" : result === "lose" ? "패배" : "무승부";

  return (
    <AnimatePresence mode="wait">
      {open && (
      <motion.div
        key="report"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-6 shadow-[0_0_40px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          <h2 className="mb-1 text-center text-xl font-bold text-cyan-400">
            체스 DNA 리포트
          </h2>
          <p className="mb-6 text-center text-sm text-slate-400">
            이번 판 결과:{" "}
            <span
              className={
                result === "win"
                  ? "text-emerald-400"
                  : result === "lose"
                    ? "text-red-400"
                    : "text-amber-400"
              }
            >
              {resultLabel}
            </span>
          </p>

          {/* DNA 한눈에 */}
          <section className="mb-6 rounded-xl bg-slate-800/80 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">
              이번 판 DNA
            </h3>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>공격성</span>
                  <span>{Math.round(dnaSnapshot.aggressionScore * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dnaSnapshot.aggressionScore * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>캡처 비율</span>
                  <span>{Math.round(dnaSnapshot.captureRatio * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dnaSnapshot.captureRatio * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-violet-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                총 {dnaSnapshot.moveCount}수 · 폰 전진 점수{" "}
                {Math.round(dnaSnapshot.pawnAdvanceScore * 100)}%
              </p>
            </div>
          </section>

          {/* 하이라이트 자막 */}
          {highlightCaptions.length > 0 && (
            <section className="mb-6 rounded-xl bg-slate-800/80 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-300">
                이번 판 하이라이트
              </h3>
              <ul className="space-y-2">
                {highlightCaptions.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-cyan-200"
                  >
                    {c.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Marcus 독설 */}
          <section className="mb-6 rounded-xl border border-red-500/30 bg-red-950/20 p-4">
            <p className="text-center text-sm font-medium italic text-red-300">
              &ldquo;{marcusLine}&rdquo;
            </p>
            <p className="mt-1 text-center text-xs text-slate-500">
              — Marcus
            </p>
          </section>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 rounded-lg bg-cyan-600 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] transition hover:bg-cyan-500"
            >
              다시 하기
            </button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
