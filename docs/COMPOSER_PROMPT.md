# Cursor Composer용 프롬프트 (초기 프로젝트 구조)

Cursor에서 **Composer(Ctrl+I / Cmd+I)** 를 연 뒤, 아래 블록을 그대로 복사해 입력하세요.

---

```
Next.js 14와 Tailwind CSS, chess.js, react-chessboard를 사용하여 1인용 체스 서비스를 만들 거야.

components/chess 폴더에 기본 보드와 Stockfish 엔진 연동 로직을 작성해줘.

components/ui/captions 폴더에 Framer Motion을 활용한 '예능 자막' 컴포넌트를 만들어줘. (예: 'Brilliant!!', '멘붕 주의' 같은 텍스트가 화려하게 튀어나오는 스타일)

사용자의 수(Move)를 기록해서 공격적인지 수비적인지 분석하는 DNA_Analyzer 모듈의 초안을 작성해줘.
```

---

## 현재 프로젝트와의 대응

| 프롬프트 요청 | 구현 위치 |
|---------------|-----------|
| 기본 보드 + Stockfish 연동 | `src/components/chess/ChessBoard.tsx`, `src/hooks/useStockfish.ts`, `src/lib/chessEngine.ts` |
| 예능 자막 (Framer Motion) | `src/components/ui/captions/EntertainmentCaption.tsx`, `CaptionOverlay.tsx` |
| DNA_Analyzer 초안 | `src/lib/dna/DNA_Analyzer.ts` |

이미 위 구조가 생성되어 있으므로, Composer에서는 "이 구조를 확장해줘" 또는 "Stockfish WASM 연동 추가해줘" 같은 구체적인 지시를 주면 됩니다.
