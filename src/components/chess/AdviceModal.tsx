"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ChessAdviceResponse } from "@/lib/gemini/chessAdvice";

interface AdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  advice: ChessAdviceResponse | null;
  isLoading: boolean;
}

export function AdviceModal({ isOpen, onClose, advice, isLoading }: AdviceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
          >
            {/* 모달 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border-2 border-cyan-400/30 overflow-hidden"
            >
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤖</span>
                  <h2 className="text-xl font-bold text-white">AI 체스 코치</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 콘텐츠 */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
                    <p className="text-gray-300 text-sm">AI가 분석 중...</p>
                  </div>
                ) : advice ? (
                  <div className="space-y-4">
                    {/* 추천 수 */}
                    <div className="space-y-3">
                      {advice.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-700/50 rounded-lg p-4 border border-cyan-400/20 hover:border-cyan-400/40 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-400 font-bold text-lg">
                                {index + 1}.
                              </span>
                              <span className="text-white font-mono text-xl font-bold">
                                {rec.move}
                              </span>
                            </div>
                            <div className="bg-cyan-400/20 px-3 py-1 rounded-full">
                              <span className="text-cyan-300 font-bold text-sm">
                                {rec.score}점
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{rec.reason}</p>
                          <p className="text-gray-400 text-xs">
                            예상 대응: <span className="text-cyan-400">{rec.opponentResponse}</span>
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* 전반적 조언 */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-400/30"
                    >
                      <p className="text-cyan-200 text-sm leading-relaxed">
                        💡 {advice.overallComment}
                      </p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    조언을 불러올 수 없습니다.
                  </div>
                )}
              </div>

              {/* 푸터 */}
              <div className="bg-gray-900/50 px-6 py-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
