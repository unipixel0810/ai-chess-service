import { supabase } from "./client";

// 간소화된 타입 (Supabase 타입 호환 문제 우회)
type GameRecordInsert = {
  result: "win" | "lose" | "draw";
  total_moves: number;
  final_fen: string;
  duration_seconds?: number | null;
  real_name?: string | null;
};

type DnaRecordInsert = {
  game_id: string;
  aggression_score: number;
  capture_count: number;
  pawn_advance_score: number;
  move_count: number;
  highlight_captions?: string[];
};

type MoveRecordInsert = {
  game_id: string;
  move_number: number;
  san: string;
  from_square: string;
  to_square: string;
  fen_after: string;
  is_capture?: boolean;
  is_check?: boolean;
};

/**
 * 게임 결과 및 DNA 데이터를 Supabase에 저장
 */
export async function saveGameResult(params: {
  result: "win" | "lose" | "draw";
  totalMoves: number;
  finalFen: string;
  durationSeconds?: number;
  realName?: string;
  dna: {
    aggressionScore: number;
    captureCount: number;
    pawnAdvanceScore: number;
    moveCount: number;
    highlightCaptions: string[];
  };
  moves?: Array<{
    moveNumber: number;
    san: string;
    from: string;
    to: string;
    fenAfter: string;
    isCapture: boolean;
    isCheck: boolean;
  }>;
}) {
  // Supabase 미연결 시 스킵
  if (!supabase) {
    return { success: false, reason: "not_configured" };
  }

  const db = supabase;

  try {
    // 1. 게임 기록 저장
    const gameRecord: GameRecordInsert = {
      result: params.result,
      total_moves: params.totalMoves,
      final_fen: params.finalFen,
      duration_seconds: params.durationSeconds ?? null,
      real_name: params.realName ?? null,
    };

    const { data: game, error: gameError } = await db
      .from("game_records")
      .insert(gameRecord)
      .select()
      .single();

    if (gameError) {
      console.error("게임 기록 저장 실패:", gameError);
      return { success: false, error: gameError };
    }

    // 2. DNA 기록 저장
    const dnaRecord: DnaRecordInsert = {
      game_id: game.id,
      aggression_score: params.dna.aggressionScore,
      capture_count: params.dna.captureCount,
      pawn_advance_score: params.dna.pawnAdvanceScore,
      move_count: params.dna.moveCount,
      highlight_captions: params.dna.highlightCaptions,
    };

    const { error: dnaError } = await db
      .from("dna_records")
      .insert(dnaRecord);

    if (dnaError) {
      console.error("DNA 기록 저장 실패:", dnaError);
    }

    // 3. 이동 기록 저장 (선택적)
    if (params.moves && params.moves.length > 0) {
      const moveRecords: MoveRecordInsert[] = params.moves.map((m) => ({
        game_id: game.id,
        move_number: m.moveNumber,
        san: m.san,
        from_square: m.from,
        to_square: m.to,
        fen_after: m.fenAfter,
        is_capture: m.isCapture,
        is_check: m.isCheck,
      }));

      const { error: moveError } = await db
        .from("move_records")
        .insert(moveRecords);

      if (moveError) {
        console.error("이동 기록 저장 실패:", moveError);
      }
    }

    return { success: true, gameId: game.id };
  } catch (error) {
    console.error("저장 중 오류:", error);
    return { success: false, error };
  }
}

/**
 * 최근 게임 기록 조회
 */
export async function getRecentGames(limit = 10) {
  if (!supabase) return [];
  const db = supabase;

  const { data, error } = await db
    .from("game_records")
    .select(`
      *,
      dna_records (*)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("게임 기록 조회 실패:", error);
    return [];
  }

  return data;
}

/**
 * 플레이어 통계 조회
 */
export async function getPlayerStats() {
  if (!supabase) {
    return { wins: 0, losses: 0, draws: 0, total: 0, winRate: 0 };
  }
  const db = supabase;

  const { data: games, error } = await db
    .from("game_records")
    .select("result");

  if (error || !games) {
    return { wins: 0, losses: 0, draws: 0, total: 0, winRate: 0 };
  }

  const stats = {
    wins: games.filter((g: { result: string }) => g.result === "win").length,
    losses: games.filter((g: { result: string }) => g.result === "lose").length,
    draws: games.filter((g: { result: string }) => g.result === "draw").length,
    total: games.length,
    winRate: 0,
  };

  stats.winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;

  return stats;
}

/**
 * 평균 DNA 점수 조회
 */
export async function getAverageDna() {
  if (!supabase) {
    return {
      avgAggression: 0,
      avgCaptures: 0,
      avgPawnAdvance: 0,
      totalGames: 0,
    };
  }
  const db = supabase;

  const { data, error } = await db
    .from("dna_records")
    .select("aggression_score, capture_count, pawn_advance_score");

  if (error || !data || data.length === 0) {
    return {
      avgAggression: 0,
      avgCaptures: 0,
      avgPawnAdvance: 0,
      totalGames: 0,
    };
  }

  type DnaData = { aggression_score: number; capture_count: number; pawn_advance_score: number };
  type Acc = { aggression: number; captures: number; pawnAdvance: number };
  const sum = data.reduce(
    (acc: Acc, d: DnaData) => ({
      aggression: acc.aggression + d.aggression_score,
      captures: acc.captures + d.capture_count,
      pawnAdvance: acc.pawnAdvance + d.pawn_advance_score,
    }),
    { aggression: 0, captures: 0, pawnAdvance: 0 }
  );

  return {
    avgAggression: Math.round((sum.aggression / data.length) * 100) / 100,
    avgCaptures: Math.round((sum.captures / data.length) * 10) / 10,
    avgPawnAdvance: Math.round((sum.pawnAdvance / data.length) * 100) / 100,
    totalGames: data.length,
  };
}
