"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useDNAAnalyzer } from "@/lib/dna/DNA_Analyzer";
import { useGameStorage } from "@/hooks/useGameStorage";
import { isUserOverwhelmed, getFallbackBestMove } from "@/lib/chessEngine";
import type { GameResult } from "@/lib/marcusFeedback";
import { GameCaption } from "@/components/ui/captions/GameCaption";
import { ChessDNAReport, type HighlightCaption } from "./ChessDNAReport";
import type { Square } from "chess.js";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** 공격성 자막을 띄우는 최소 점수 (이 이상이면 예능 자막 표시) */
const AGGRESSION_CAPTION_THRESHOLD = 0.45;
const AGGRESSION_CAPTION_DURATION_MS = 2200;
const AI_BLUNDER_CAPTION_DURATION_MS = 2500;

export function ChessBoard() {
  const [game, setGame] = useState(() => new Chess(INITIAL_FEN));
  const [fen, setFen] = useState(INITIAL_FEN);
  const [isThinking, setIsThinking] = useState(false);
  const {
    recordMove,
    aggressionScore,
    aggressionCaption,
    dnaSnapshot,
    reset: resetDna,
  } = useDNAAnalyzer();
  const { isConnected, isSaving, stats, saveGame } = useGameStorage();
  const [captionVisible, setCaptionVisible] = useState(false);
  const [blunderCaptionVisible, setBlunderCaptionVisible] = useState(false);
  const [lastUserMoveCount, setLastUserMoveCount] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportResult, setReportResult] = useState<GameResult>("draw");
  const [reportDna, setReportDna] = useState(dnaSnapshot);
  const [reportHighlights, setReportHighlights] = useState<HighlightCaption[]>([]);
  const highlightCaptionsRef = useRef<HighlightCaption[]>([]);
  const gameStartTimeRef = useRef<number>(Date.now());
  const gameSavedRef = useRef(false);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      try {
        const g = new Chess(game.fen());
        const result = g.move({ from, to, promotion: promotion as "q" | "r" | "b" | "n" | undefined });
        if (result) {
          setGame(g);
          setFen(g.fen());
          // 유저(백) 수만 DNA에 기록
          if (g.turn() === "b") {
            recordMove({ from, to, san: result.san, fen: g.fen() });
            setLastUserMoveCount((c) => c + 1);
          }
          return true;
        }
        return false;
      } catch (err) {
        console.warn("Invalid move attempted:", { from, to, promotion }, err);
        return false;
      }
    },
    [game, recordMove]
  );

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string) => {
      const promo = piece.slice(-1).toLowerCase();
      const promotion = ["q", "r", "b", "n"].includes(promo) ? promo : undefined;
      return makeMove(sourceSquare as Square, targetSquare as Square, promotion);
    },
    [makeMove]
  );

  // 유저가 수를 둔 뒤 공격 수치가 높으면 예능 자막 표시 + 하이라이트 기록
  useEffect(() => {
    if (lastUserMoveCount === 0) return;
    if (aggressionScore >= AGGRESSION_CAPTION_THRESHOLD) {
      highlightCaptionsRef.current.push({
        text: aggressionCaption,
        type: "aggression",
      });
      setCaptionVisible(true);
      const t = setTimeout(() => setCaptionVisible(false), AGGRESSION_CAPTION_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [lastUserMoveCount, aggressionScore, aggressionCaption]);

  const turn = game.turn();
  const gameOver = game.isGameOver();
  const userOverwhelmed = isUserOverwhelmed(fen);

  // AI 턴 (흑)
  useEffect(() => {
    // 흑(AI) 턴이 아니면 스킵
    if (game.turn() !== "b") return;
    if (game.isGameOver()) return;
    
    let isCancelled = false;
    setIsThinking(true);
    
    const timer = setTimeout(() => {
      if (isCancelled) return;
      
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        const copy = new Chess(game.fen());
        copy.move(move);
        setGame(copy);
        setFen(copy.fen());
      }
      setIsThinking(false);
    }, 400);
    
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [game]);

  // AI 블런더 자막 자동 숨김
  useEffect(() => {
    if (!blunderCaptionVisible) return;
    const t = setTimeout(
      () => setBlunderCaptionVisible(false),
      AI_BLUNDER_CAPTION_DURATION_MS
    );
    return () => clearTimeout(t);
  }, [blunderCaptionVisible]);

  // 게임 종료 시 결과 판정, Supabase 저장, 리포트 표시
  useEffect(() => {
    if (!gameOver || gameSavedRef.current) return;
    
    const result: GameResult = game.isCheckmate()
      ? game.turn() === "w"
        ? "lose"
        : "win"
      : "draw";
    
    const finalDna = { ...dnaSnapshot };
    const finalHighlights = [...highlightCaptionsRef.current];
    const durationSeconds = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    
    setReportResult(result);
    setReportDna(finalDna);
    setReportHighlights(finalHighlights);
    setReportOpen(true);
    gameSavedRef.current = true;

    // Supabase에 저장 (비동기, 실패해도 게임 진행에 영향 없음)
    saveGame({
      result,
      finalFen: fen,
      dna: finalDna,
      highlightCaptions: finalHighlights,
      durationSeconds,
    }).then((res) => {
      if (res.success) {
        console.log("✅ 게임 기록 저장 완료");
      }
    });
  }, [gameOver, fen, dnaSnapshot, game, saveGame]);

  const handlePlayAgain = useCallback(() => {
    setGame(new Chess(INITIAL_FEN));
    setFen(INITIAL_FEN);
    highlightCaptionsRef.current = [];
    gameStartTimeRef.current = Date.now();
    gameSavedRef.current = false;
    setLastUserMoveCount(0);
    resetDna();
    setReportOpen(false);
  }, [resetDna]);

  return (
    <div className="relative rounded-xl p-2 shadow-[0_0_30px_rgba(34,211,238,0.25),0_0_60px_rgba(168,85,247,0.1)] ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-slate-900">
      {/* Supabase 연결 상태 & 통계 */}
      <div className="absolute -top-8 left-0 right-0 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`} />
          <span className="text-slate-400">
            {isConnected ? "DB 연결됨" : "로컬 모드"}
          </span>
        </div>
        {stats && stats.total > 0 && (
          <span className="text-slate-400">
            전적: {stats.wins}승 {stats.losses}패 {stats.draws}무 ({stats.winRate}%)
          </span>
        )}
      </div>
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardWidth={400}
        arePiecesDraggable={!isThinking && game.turn() === "w"}
        boardOrientation="white"
      />
      {isThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <span className="text-white font-bold">엔진 생각 중...</span>
        </div>
      )}
      <GameCaption
        type="entertainment"
        text={aggressionCaption}
        visible={captionVisible}
        onComplete={() => setCaptionVisible(false)}
      />
      <GameCaption
        type="entertainment"
        text="AI의 치명적인 실수?!"
        visible={blunderCaptionVisible}
        onComplete={() => setBlunderCaptionVisible(false)}
      />
      <ChessDNAReport
        open={reportOpen}
        result={reportResult}
        dnaSnapshot={reportDna}
        highlightCaptions={reportHighlights}
        onClose={() => setReportOpen(false)}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
