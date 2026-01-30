/**
 * 체스 엔진 연동 레이어
 * - Stockfish Worker 연동 (선택)
 * - 유저 DNA·압도당함에 따른 난이도·블런더 조절 (유튜브 알고리즘 스타일)
 */

import { Chess } from "chess.js";
import { getMoveFromStockfish } from "./stockfishWorker";

export type EngineMove = {
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
};

export type EngineMoveResult = EngineMove & {
  isBlunder?: boolean;
};

export type EngineContext = {
  /** 유저가 압도당하고 있음 → AI가 의도적 실수(블런더) 유도 */
  userOverwhelmed?: boolean;
  /** 유저 DNA 공격성 점수 (0~1) → 난이도 조절 */
  aggressionScore?: number;
};

/**
 * 현재 FEN에서 최선의 수를 반환 (기본 타입)
 */
export type GetBestMove = (
  fen: string,
  depth?: number
) => Promise<EngineMove | null>;

/**
 * 컨텍스트(압도당함, DNA)를 받아 최선/블런더 수 반환
 */
export type GetBestMoveWithContext = (
  fen: string,
  depth?: number,
  context?: EngineContext
) => Promise<EngineMoveResult | null>;

const PIECE_VALUE: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
  P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0,
};

/**
 * FEN에서 백(유저) vs 흑(AI) 기물 가치 합계
 * @returns [whiteScore, blackScore]
 */
export function materialFromFen(fen: string): [number, number] {
  const part = fen.split(" ")[0] ?? "";
  let white = 0;
  let black = 0;
  for (const c of part) {
    if (c in PIECE_VALUE) {
      if (c === c.toUpperCase()) white += PIECE_VALUE[c];
      else black += PIECE_VALUE[c];
    }
  }
  return [white, black];
}

/**
 * 유저(백)가 압도당하고 있는지: 기물 손실이 임계값 이상
 */
const MATERIAL_DISADVANTAGE_THRESHOLD = 3;

export function isUserOverwhelmed(fen: string): boolean {
  const [white, black] = materialFromFen(fen);
  return white < black - MATERIAL_DISADVANTAGE_THRESHOLD;
}

/**
 * Fallback 엔진: 합법 수 중 하나 반환 (Stockfish 없이도 작동)
 */
export async function getFallbackBestMove(
  fen: string,
  _depth?: number,
  requestBlunder?: boolean
): Promise<EngineMoveResult | null> {
  try {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    
    console.log(`[AI] FEN: ${fen.slice(0, 20)}..., 가능한 수: ${moves.length}개`);
    
    if (moves.length === 0) {
      console.log("[AI] 가능한 수 없음");
      return null;
    }
    
    // 캡처/체크 수 우선 (좋은 수), 블런더 시 반대로
    const captureMoves = moves.filter(m => m.captured || m.san.includes('+'));
    const normalMoves = moves.filter(m => !m.captured && !m.san.includes('+'));
    
    let selectedMove;
    if (requestBlunder && normalMoves.length > 0) {
      selectedMove = normalMoves[Math.floor(Math.random() * normalMoves.length)];
    } else if (captureMoves.length > 0) {
      selectedMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
    } else {
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    }
    
    console.log(`[AI] 선택된 수: ${selectedMove.san} (${selectedMove.from}->${selectedMove.to})`);
    
    return {
      from: selectedMove.from,
      to: selectedMove.to,
      promotion: selectedMove.promotion as EngineMove["promotion"],
      isBlunder: requestBlunder && normalMoves.length > 0,
    };
  } catch (err) {
    console.error("[AI] Fallback 엔진 오류:", err);
    return null;
  }
}

/** 블런더를 유도할 확률 (유저가 압도당했을 때) */
const BLUNDER_CHANCE_WHEN_OVERWHELMED = 0.4;

/** DNA 기반 난이도: 공격적일수록 depth 약간 증가 (더 강한 AI) */
function depthFromContext(depth: number, aggressionScore?: number): number {
  const base = Math.max(1, depth);
  if (aggressionScore == null) return base;
  if (aggressionScore >= 0.7) return Math.min(20, base + 2);
  if (aggressionScore <= 0.3) return Math.max(1, base - 1);
  return base;
}

/**
 * AI 알고리즘 최적화: 유저 수준·재미에 맞춘 수
 * - 현재: Fallback 엔진 사용 (Stockfish 없이도 즉시 작동)
 * - 유저가 압도당하면 블런더 유도
 */
export async function getBestMoveWithAlgorithm(
  fen: string,
  depth: number = 10,
  context?: EngineContext
): Promise<EngineMoveResult | null> {
  const userOverwhelmed = context?.userOverwhelmed ?? isUserOverwhelmed(fen);
  const requestBlunder =
    userOverwhelmed && Math.random() < BLUNDER_CHANCE_WHEN_OVERWHELMED;
  const adjustedDepth = depthFromContext(depth, context?.aggressionScore);

  // Stockfish 시도 (빠른 타임아웃)
  try {
    const fromStockfish = await Promise.race([
      getMoveFromStockfish(fen, adjustedDepth, requestBlunder),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);

    if (fromStockfish) {
      return {
        ...fromStockfish,
        isBlunder: requestBlunder,
      };
    }
  } catch {
    // Stockfish 실패 시 무시
  }

  // Fallback 엔진 사용
  return getFallbackBestMove(fen, adjustedDepth, requestBlunder);
}
