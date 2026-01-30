const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        // 제목
        new Paragraph({
          text: "1인용 체스 서비스 PRD 및 기획서",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Project: Chess DNA - Entertaining AI Battle",
              bold: true,
              color: "333333",
            }),
          ],
          spacing: { after: 400 },
        }),

        // Marcus의 독설 섹션
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("0. Marcus's Critique (개발 전 경고)")],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '"단순히 체스판만 만들 거면 시작도 하지 마. 유저가 한 수 둘 때마다 뺨을 때리는 자막과 연출이 없으면 그건 쓰레기야. 디자인 DNA에 목숨 걸라고."',
              italics: true,
              color: "FF0000",
            }),
          ],
          spacing: { after: 300 },
        }),

        // 1. 핵심 서비스 기획 (DNA 분석)
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("1. 서비스 핵심 DNA 분석 (P0)")],
        }),
        new Paragraph({
          children: [new TextRun("• 유저 플레이 스타일 로깅: 모든 Move를 분석하여 공격성/방어성 수치화")],
        }),
        new Paragraph({
          children: [new TextRun("• 알고리즘 최적화: 유저 실력에 맞춘 드라마틱한 수 제안 (유튜브 알고리즘 스타일)")],
        }),

        // 2. 자막 디자인 가이드
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("2. 3단계 자막 시스템 디자인 (P0)")],
        }),
        new Paragraph({
          text: "2.1 예능 자막: 결정적 순간(묘수, 대실수) 시 화면 중앙에 화려한 애니메이션과 함께 등장.",
          spacing: { before: 200 },
        }),
        new Paragraph({
          text: "2.2 상황 자막: 현재 체크 상태나 기물 위기 시 보드 가장자리에 긴박한 텍스트 노출.",
        }),
        new Paragraph({
          text: "2.3 설명 자막: 하단 캡션 바를 통해 AI의 전략적 의도를 실시간 중계 스타일로 노출.",
        }),

        // 7.3 인프라 섹션
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300 },
          children: [new TextRun("7.3 인프라 및 환경")],
        }),
        new Paragraph({
          children: [new TextRun("• 호스팅: Vercel 또는 Netlify (정적 배포)")],
        }),
        new Paragraph({
          children: [new TextRun("• 서버: 없음 (클라이언트 사이드 Stockfish.js 활용)")],
        }),
      ],
    },
  ],
});

const outDir = path.join(__dirname, "..");
const outPath = path.join(outDir, "Chess_DNA_PRD.docx");

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outPath, buffer);
    console.log("✅ PRD 및 기획서 문서(Chess_DNA_PRD.docx)가 성공적으로 생성되었습니다!");
  })
  .catch((err) => {
    console.error("❌ 문서 생성 실패:", err);
    process.exit(1);
  });
