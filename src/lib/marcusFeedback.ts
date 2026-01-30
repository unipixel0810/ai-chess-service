import type { DnaSnapshot } from "./dna/DnaAnalyzer";

export type GameResult = "win" | "lose" | "draw";

/**
 * Marcus 버전 독설 피드백 (결과 + DNA 기반 한 줄)
 */
export function getMarcusFeedback(
  result: GameResult,
  dna: DnaSnapshot
): string {
  const agg = dna.aggressionScore;
  const moves = dna.moveCount;

  if (result === "lose") {
    const loseLines = [
      "이 정도면 체스 접어야지?",
      "다음엔 바둑이나 두지 그래?",
      "AI한테 진 거 맞아? 창피한 줄 알아.",
      "공격만 하다 망한 전형적인 패턴이야.",
      "수비만 하다가 졌네. 이건 예능이 아니라 비극이야.",
      "몇 수 더 두었으면 이겼을 텐데, 그게 안 됐지.",
    ];
    if (agg >= 0.7) return loseLines[3];
    if (agg <= 0.3) return loseLines[4];
    if (moves < 15) return loseLines[0];
    return loseLines[Math.floor(Math.random() * 3)];
  }

  if (result === "win") {
    const winLines = [
      "오늘 AI 기분이 좋았나 보네.",
      "한 수만 더 들켰으면 졌을 거야. 운이 좋았어.",
      "이 정도 실력이면 나가서 대국해.",
      "오늘 컨디션 미쳤네. 다음엔 안 봐줄 거야.",
    ];
    if (agg >= 0.7) return winLines[3];
    return winLines[Math.floor(Math.random() * 2)];
  }

  const drawLines = [
    "무승부로 체면치레는 했네.",
    "비겼다고 좋아할 거야? 다음엔 이겨.",
    "둘 다 못 둔 거 맞아.",
  ];
  return drawLines[Math.floor(Math.random() * drawLines.length)];
}
