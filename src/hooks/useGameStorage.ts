"use client";

import { useState, useCallback, useEffect } from "react";
import { saveGameResult, getPlayerStats, getAverageDna } from "@/lib/supabase/gameService";
import { checkSupabaseConnection } from "@/lib/supabase/client";
import type { DnaSnapshot } from "@/lib/dna/DnaAnalyzer";
import type { GameResult } from "@/lib/marcusFeedback";
import type { HighlightCaption } from "@/components/chess/ChessDNAReport";

interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
}

interface AverageDna {
  avgAggression: number;
  avgCaptures: number;
  avgPawnAdvance: number;
  totalGames: number;
}

/**
 * 게임 저장 및 통계 조회 훅
 */
export function useGameStorage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [avgDna, setAvgDna] = useState<AverageDna | null>(null);

  // Supabase 연결 확인
  useEffect(() => {
    checkSupabaseConnection().then(setIsConnected);
  }, []);

  // 통계 로드
  const loadStats = useCallback(async () => {
    if (!isConnected) return;
    const [playerStats, dnaStats] = await Promise.all([
      getPlayerStats(),
      getAverageDna(),
    ]);
    setStats(playerStats);
    setAvgDna(dnaStats);
  }, [isConnected]);

  // 초기 통계 로드
  useEffect(() => {
    if (isConnected) {
      loadStats();
    }
  }, [isConnected, loadStats]);

  // 게임 결과 저장
  const saveGame = useCallback(
    async (params: {
      result: GameResult;
      finalFen: string;
      dna: DnaSnapshot;
      highlightCaptions: HighlightCaption[];
      durationSeconds?: number;
    }) => {
      if (!isConnected) {
        console.log("Supabase 미연결 - 로컬에서만 실행");
        return { success: false, reason: "not_connected" };
      }

      setIsSaving(true);
      try {
        const result = await saveGameResult({
          result: params.result,
          totalMoves: params.dna.moveCount,
          finalFen: params.finalFen,
          durationSeconds: params.durationSeconds,
          dna: {
            aggressionScore: params.dna.aggressionScore,
            captureCount: Math.round(params.dna.captureRatio * params.dna.moveCount),
            pawnAdvanceScore: params.dna.pawnAdvanceScore,
            moveCount: params.dna.moveCount,
            highlightCaptions: params.highlightCaptions.map((h) => h.text),
          },
        });

        if (result.success) {
          // 저장 후 통계 갱신
          await loadStats();
        }

        return result;
      } finally {
        setIsSaving(false);
      }
    },
    [isConnected, loadStats]
  );

  return {
    isConnected,
    isSaving,
    stats,
    avgDna,
    saveGame,
    loadStats,
  };
}
