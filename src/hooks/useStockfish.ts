"use client";

import { useCallback, useRef, useState } from "react";
import type { EngineMoveResult, EngineContext } from "@/lib/chessEngine";
import { getBestMoveWithAlgorithm } from "@/lib/chessEngine";

type UseStockfishOptions = {
  /** 엔진이 "생각"하는 최소 시간(ms) - UX용 */
  minThinkMs?: number;
  /** 기본 탐색 깊이 */
  defaultDepth?: number;
};

/**
 * 1인용 체스용 엔진 훅
 * - Stockfish Worker 연동 (public/stockfish.js 있을 때)
 * - 유저 DNA·압도당함에 따라 난이도·블런더 동적 조절
 * - getEngineMove(fen, context) → { from, to, promotion?, isBlunder? }
 */
export function useStockfish(options: UseStockfishOptions = {}) {
  const { minThinkMs = 500, defaultDepth = 10 } = options;
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef(false);

  const getEngineMove = useCallback(
    async (
      fen: string,
      context?: EngineContext
    ): Promise<EngineMoveResult | null> => {
      console.log("[Hook] getEngineMove 호출");
      abortRef.current = false;
      setIsThinking(true);
      const start = Date.now();

      try {
        const move = await getBestMoveWithAlgorithm(
          fen,
          defaultDepth,
          context
        );
        console.log("[Hook] 엔진 결과:", move);
        if (abortRef.current) {
          console.log("[Hook] 취소됨");
          return null;
        }
        const elapsed = Date.now() - start;
        const delay = Math.max(0, minThinkMs - elapsed);
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));
        return move;
      } catch (err) {
        console.error("[Hook] 엔진 오류:", err);
        return null;
      } finally {
        console.log("[Hook] isThinking = false");
        if (!abortRef.current) setIsThinking(false);
      }
    },
    [defaultDepth, minThinkMs]
  );

  const stopThinking = useCallback(() => {
    abortRef.current = true;
    setIsThinking(false);
  }, []);

  return { getEngineMove, isThinking, stopThinking };
}
