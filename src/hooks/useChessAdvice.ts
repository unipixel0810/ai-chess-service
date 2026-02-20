"use client";

import { useState, useCallback } from "react";
import { getChessAdvice, type ChessAdviceResponse } from "@/lib/gemini/chessAdvice";
import { isGeminiAvailable } from "@/lib/gemini/client";

export function useChessAdvice() {
  const [advice, setAdvice] = useState<ChessAdviceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestAdvice = useCallback(async (fen: string, aggressionScore: number) => {
    if (!isGeminiAvailable()) {
      setError("Gemini API가 설정되지 않았습니다.");
      return;
    }

    setIsLoading(true);
    setIsModalOpen(true);
    setError(null);

    try {
      const result = await getChessAdvice(fen, aggressionScore);
      setAdvice(result);
    } catch (err) {
      console.error("Failed to get chess advice:", err);
      setError("조언을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    advice,
    isLoading,
    isModalOpen,
    error,
    requestAdvice,
    closeModal,
    isAvailable: isGeminiAvailable(),
  };
}
