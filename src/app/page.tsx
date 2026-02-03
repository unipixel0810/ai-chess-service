"use client";

import { ChessBoard } from "@/components/chess/ChessBoard";
import { CaptionOverlay } from "@/components/ui/captions/CaptionOverlay";
import LoginButton from "@/components/auth/LoginButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8 flex flex-col items-center">
      {/* 상단 헤더 */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          AI Chess Service
        </h1>
        <LoginButton />
      </div>
      
      <div className="relative">
        <ChessBoard />
        <CaptionOverlay />
      </div>
    </main>
  );
}
