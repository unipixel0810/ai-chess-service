"use client";

import { ChessBoard } from "@/components/chess/ChessBoard";
import { CaptionOverlay } from "@/components/ui/captions/CaptionOverlay";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-slate-100 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
        AI Chess Service
      </h1>
      <div className="relative">
        <ChessBoard />
        <CaptionOverlay />
      </div>
    </main>
  );
}
