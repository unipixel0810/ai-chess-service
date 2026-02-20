import { getGeminiModel } from "./client";

export interface ChessRecommendation {
  move: string;
  score: number;
  reason: string;
  opponentResponse: string;
}

export interface ChessAdviceResponse {
  recommendations: ChessRecommendation[];
  overallComment: string;
}

/**
 * GPT가 체스 조언을 제공합니다
 */
export async function getChessAdvice(
  fen: string,
  aggressionScore: number
): Promise<ChessAdviceResponse> {
  const model = getGeminiModel();

  const prompt = `당신은 세계적인 체스 코치입니다.

현재 보드 상태 (FEN): ${fen}
사용자의 플레이 스타일: 공격성 ${Math.round(aggressionScore * 100)}%

백(White)의 다음 수를 추천해주세요.

요구사항:
1. 최고의 수 3개를 추천
2. 각 수의 평가 점수 (0-100)
3. 각 수의 간단한 이유 (한 문장, 한국어)
4. 예상되는 흑(Black)의 대응
5. 전반적인 조언 (한국어, 친근하게)

**중요**: 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "recommendations": [
    {
      "move": "e4",
      "score": 85,
      "reason": "중앙을 장악하고 킹 사이드 캐슬링 준비",
      "opponentResponse": "e5 또는 c5"
    },
    {
      "move": "Nf3",
      "score": 82,
      "reason": "안정적인 기물 전개",
      "opponentResponse": "Nf6"
    },
    {
      "move": "d4",
      "score": 80,
      "reason": "중앙 폰 장악",
      "opponentResponse": "d5"
    }
  ],
  "overallComment": "현재 상황에서는 중앙 장악이 가장 중요합니다. 공격적인 플레이 스타일에 맞춰 적극적으로 전개하세요!"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const parsed = JSON.parse(jsonMatch[0]) as ChessAdviceResponse;
    return parsed;
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // 폴백 응답
    return {
      recommendations: [
        {
          move: "e4",
          score: 80,
          reason: "중앙 장악 (기본 오프닝)",
          opponentResponse: "e5 또는 c5"
        },
        {
          move: "Nf3",
          score: 75,
          reason: "안정적인 기물 전개",
          opponentResponse: "Nf6"
        },
        {
          move: "d4",
          score: 70,
          reason: "중앙 폰 장악",
          opponentResponse: "d5"
        }
      ],
      overallComment: "AI 조언을 불러오는데 실패했습니다. 기본 추천을 참고하세요."
    };
  }
}
