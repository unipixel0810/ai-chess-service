# AI Chess Service

Next.js 14 + Tailwind CSS 기반 1인용 체스 서비스.  
**편집 DNA**: DNA 분석, 최적 수 추천, 예능 스타일 자막(Visual Impact).

## 설정

1. **Cursor 규칙**  
   프로젝트 루트의 `.cursorrules` 및 `.cursor/rules/project-goal.mdc`에 프로젝트 목표가 정의되어 있습니다.

2. **의존성 설치**

```bash
npm install
```

3. **개발 서버**

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

4. **PRD/기획서 문서 생성 (선택)**

```bash
npm run prd
```

프로젝트 루트에 `Chess_DNA_PRD.docx` 파일이 생성됩니다. (`docx` 패키지 사용)

## 구조

- **`src/components/chess/`** — 체스 보드 + Stockfish 엔진·난이도·블런더 연동
- **`src/components/ui/captions/`** — Framer Motion 예능/상황/설명 자막
- **`src/lib/stockfishWorker.ts`** — Stockfish.js Web Worker 브리지 (UCI 파싱)
- **`src/lib/chessEngine.ts`** — 난이도·블런더 알고리즘 (DNA·압도당함 기반)
- **`src/lib/dna/`** — DnaAnalyzer, DNA_Analyzer 훅
- **`src/hooks/useStockfish.ts`** — 엔진 훅 (Worker 또는 폴백)
- **`docs/WIREFRAME.md`** — 화면 설계 미리보기

## Stockfish.js Web Worker 연동

- **엔진**: `src/lib/stockfishWorker.ts`에서 Worker로 UCI 통신, `src/lib/chessEngine.ts`에서 난이도·블런더 조절.
- **Worker 파일**: Stockfish를 사용하려면 `public/stockfish.js`에 엔진 스크립트가 있어야 합니다.
  1. `npm install` 후 `node_modules/stockfish` 폴더에서 **Lite Single-threaded** 버전 파일을 복사합니다.
  2. 파일명 예: `stockfish-nnue-17.1-lite-single-*.js` (및 같은 이름의 `.wasm` 등 관련 파일을 같은 경로에 두거나, 패키지 문서 참고).
  3. 해당 `.js` 파일을 `public/stockfish.js`로 복사하거나, 환경 변수 `NEXT_PUBLIC_STOCKFISH_URL`로 Worker URL을 지정합니다.
- **폴백**: Worker가 없으면 합법 수 중 하나를 반환하며, 블런더 시뮬레이션(의도적 실수)은 폴백에서도 동작합니다.

## AI 알고리즘 (유튜브 스타일)

- **난이도**: 유저 DNA `aggressionScore`에 따라 탐색 깊이를 조절합니다 (공격적일수록 약간 더 강한 AI).
- **블런더**: 유저가 압도당한 경우(기물 손실 3점 이상) 약 40% 확률로 AI가 의도적으로 약한 수(블런더)를 둡니다.
- **자막**: 블런더 시 예능 자막 **"AI의 치명적인 실수?!"** 가 표시됩니다.
