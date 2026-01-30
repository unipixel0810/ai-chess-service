/**
 * Stockfish.js Web Worker 브리지 (메인 스레드)
 * - Worker에 UCI 명령 전송, bestmove 파싱
 * - Worker 미로드 시 null 반환 → fallback 사용
 */

export type StockfishMove = {
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
};

type WorkerMessage = string | { type: string; payload?: unknown };

const STOCKFISH_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_STOCKFISH_URL || "/stockfish.js")
    : "";

let worker: Worker | null = null;
let workerReady = false;
let initPromise: Promise<boolean> | null = null;

function createWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  try {
    return new Worker(STOCKFISH_URL);
  } catch {
    return null;
  }
}

/**
 * Worker 초기화 (uci, readyok 대기) - 빠른 실패
 */
function ensureWorker(): Promise<boolean> {
  if (workerReady && worker) return Promise.resolve(true);
  if (initPromise) return initPromise;
  
  worker = createWorker();
  if (!worker) {
    initPromise = Promise.resolve(false);
    return initPromise;
  }
  
  initPromise = new Promise<boolean>((resolve) => {
    // 2초 내 응답 없으면 실패 (빠른 폴백)
    const timeout = setTimeout(() => {
      worker?.terminate();
      worker = null;
      resolve(false);
    }, 2000);
    
    worker.onerror = () => {
      clearTimeout(timeout);
      worker?.terminate();
      worker = null;
      resolve(false);
    };
    
    const onMessage = (e: MessageEvent<WorkerMessage>) => {
      const data = typeof e.data === "string" ? e.data : (e.data?.payload as string) || "";
      if (data.includes("readyok")) {
        workerReady = true;
        worker?.removeEventListener("message", onMessage);
        clearTimeout(timeout);
        resolve(true);
      }
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage("uci");
  });
  return initPromise;
}

function parseBestMove(line: string): StockfishMove | null {
  const match = line.match(/bestmove\s+(\S+)/);
  if (!match) return null;
  const move = match[1];
  if (move === "(none)" || move === "0000") return null;
  if (move.length === 4) {
    return { from: move.slice(0, 2), to: move.slice(2, 4) };
  }
  if (move.length === 5) {
    const promo = move[4].toLowerCase();
    if (["q", "r", "b", "n"].includes(promo)) {
      return { from: move.slice(0, 2), to: move.slice(2, 4), promotion: promo as "q" | "r" | "b" | "n" };
    }
  }
  return null;
}

/**
 * FEN에 대해 Stockfish로 한 수 구하기
 * @param blunder true면 depth 1로 약한 수 반환
 */
export function getMoveFromStockfish(
  fen: string,
  depth: number,
  blunder: boolean
): Promise<StockfishMove | null> {
  return ensureWorker().then((ready) => {
    if (!ready || !worker) return Promise.resolve(null);
    const searchDepth = blunder ? 1 : Math.max(1, Math.min(depth, 8)); // 최대 depth 8로 제한
    return new Promise((resolve) => {
      // 3초 타임아웃 (빠른 응답)
      const timeout = setTimeout(() => {
        worker?.removeEventListener("message", onMessage);
        resolve(null);
      }, 3000);
      
      let buffer = "";
      const onMessage = (e: MessageEvent<WorkerMessage>) => {
        const data = typeof e.data === "string" ? e.data : String((e.data as { payload?: string })?.payload ?? "");
        buffer += data.includes("\n") ? data : data + "\n";
        const bestmoveLine = buffer.split("\n").find((l) => l.startsWith("bestmove"));
        if (bestmoveLine) {
          worker?.removeEventListener("message", onMessage);
          clearTimeout(timeout);
          resolve(parseBestMove(bestmoveLine));
        }
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage("ucinewgame");
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${searchDepth}`);
    });
  });
}

/**
 * Worker 사용 가능 여부
 */
export function isStockfishAvailable(): boolean {
  return typeof window !== "undefined" && !!createWorker();
}
