"use client";

/**
 * DNA Analyzer 훅: DnaAnalyzer 유틸을 사용해 실시간 aggressionScore 제공
 * GameCaption 연동용
 */

import { useCallback, useState } from "react";
import {
  computeDnaSnapshot,
  getCaptionForAggression,
  type RecordedMove as DnaRecordedMove,
  type DnaSnapshot,
} from "./DnaAnalyzer";

const MAX_HISTORY = 100;

export type RecordedMove = DnaRecordedMove;
export type StyleSnapshot = DnaSnapshot & {
  aggressive: number;
  defensive: number;
};

export function useDNAAnalyzer() {
  const [history, setHistory] = useState<RecordedMove[]>([]);

  const recordMove = useCallback((move: DnaRecordedMove) => {
    const withColor = { ...move, color: "w" as const };
    setHistory((prev) => {
      const next = [...prev, withColor];
      if (next.length > MAX_HISTORY) return next.slice(-MAX_HISTORY);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setHistory([]);
  }, []);

  const dnaSnapshot = computeDnaSnapshot(history);
  const aggressionScore = dnaSnapshot.aggressionScore;
  const aggressionCaption = getCaptionForAggression(aggressionScore);

  const getStyleSnapshot = useCallback((): StyleSnapshot => {
    const dna = computeDnaSnapshot(history);
    return {
      ...dna,
      aggressive: dna.aggressionScore,
      defensive: 1 - dna.aggressionScore,
    };
  }, [history]);

  return {
    recordMove,
    getStyleSnapshot,
    history,
    aggressionScore,
    aggressionCaption,
    dnaSnapshot,
    reset,
  };
}
