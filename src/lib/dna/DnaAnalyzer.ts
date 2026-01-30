/**
 * DnaAnalyzer: 유저 플레이 스타일 실시간 분석 유틸리티
 * - 기물 교환 공격성 (캡처, 체크)
 * - 폰 전진 정도
 * → aggressionScore 실시간 계산
 */

export type RecordedMove = {
  from: string;
  to: string;
  san: string;
  fen: string;
  /** 플레이어 색 (백만 분석 시 'w') */
  color?: "w" | "b";
};

export type DnaSnapshot = {
  /** 공격성 점수 0~1 (높을수록 공격적) */
  aggressionScore: number;
  /** 캡처 비율 (최근 수 대비) */
  captureRatio: number;
  /** 폰 전진 점수 0~1 (백 기준 전진한 폰 비율) */
  pawnAdvanceScore: number;
  /** 분석에 사용된 수 개수 */
  moveCount: number;
};

const MAX_HISTORY = 80;
const RANK = (s: string) => parseInt(s[1], 10); // e2 -> 2

/**
 * 한 수의 공격성 기여도
 * - 캡처(x), 체크(+/#): 높음
 * - 폰 전진: from/to rank 차이로 계산 (백: to > from)
 */
function moveAggressionContribution(move: RecordedMove): number {
  const san = move.san;
  let score = 0;
  if (san.includes("x")) score += 0.4;
  if (san.endsWith("+") || san.endsWith("#")) score += 0.35;
  if (san.includes("O-O-O") || san.includes("O-O")) score += 0.05; // 캐슬링은 낮음
  return Math.min(1, score);
}

/**
 * 폰 전진량 (백 기준: 전진 = rank 증가)
 * SAN에서 폰 이동: N/B/R/Q/K로 시작하지 않고, O-O 없음
 */
function pawnAdvanceContribution(move: RecordedMove): number {
  const fromRank = RANK(move.from);
  const toRank = RANK(move.to);
  const san = move.san;
  const isPawnMove =
    !san.startsWith("N") &&
    !san.startsWith("B") &&
    !san.startsWith("R") &&
    !san.startsWith("Q") &&
    !san.startsWith("K") &&
    !san.includes("O-O");
  if (!isPawnMove) return 0;
  const color = move.color ?? "w";
  const advance = color === "w" ? toRank - fromRank : fromRank - toRank;
  return advance > 0 ? Math.min(1, advance / 3) : 0; // 최대 3칸 전진 = 1
}

/**
 * 최근 수 목록으로 공격성·폰 전진 점수 실시간 계산
 */
export function computeDnaSnapshot(moves: RecordedMove[]): DnaSnapshot {
  const recent = moves.slice(-MAX_HISTORY);
  if (recent.length === 0) {
    return {
      aggressionScore: 0.5,
      captureRatio: 0,
      pawnAdvanceScore: 0.5,
      moveCount: 0,
    };
  }

  let captureCount = 0;
  let aggSum = 0;
  let pawnSum = 0;
  let pawnCount = 0;

  for (const m of recent) {
    if (m.san.includes("x")) captureCount += 1;
    aggSum += moveAggressionContribution(m);
    const pAdv = pawnAdvanceContribution(m);
    if (pAdv > 0) {
      pawnSum += pAdv;
      pawnCount += 1;
    }
  }

  const n = recent.length;
  const captureRatio = captureCount / n;
  const avgAgg = aggSum / n;
  const pawnAdvanceScore = pawnCount > 0 ? Math.min(1, pawnSum / Math.max(1, n * 0.3)) : 0.5;

  // aggressionScore: 캡처 비율 + 수 단위 공격 기여 + 폰 전진 보너스
  const rawAgg =
    avgAgg * 0.6 + captureRatio * 0.35 + (pawnAdvanceScore > 0.5 ? (pawnAdvanceScore - 0.5) * 0.2 : 0);
  const aggressionScore = Math.max(0, Math.min(1, rawAgg));

  return {
    aggressionScore,
    captureRatio,
    pawnAdvanceScore,
    moveCount: n,
  };
}

/** aggressionScore 구간별 예능/상황 자막 문구 */
const AGGRESSION_CAPTIONS: { threshold: number; text: string }[] = [
  { threshold: 0.85, text: "무자비한 공격 중!" },
  { threshold: 0.7, text: "공격 본능 각성!" },
  { threshold: 0.55, text: "압박 가하는 중!" },
  { threshold: 0.4, text: "균형 플레이" },
  { threshold: 0.25, text: "신중한 수비" },
  { threshold: 0, text: "철벽 수비" },
];

/**
 * 현재 aggressionScore에 맞는 자막 텍스트 반환
 */
export function getCaptionForAggression(aggressionScore: number): string {
  for (const { threshold, text } of AGGRESSION_CAPTIONS) {
    if (aggressionScore >= threshold) return text;
  }
  return AGGRESSION_CAPTIONS[AGGRESSION_CAPTIONS.length - 1].text;
}
