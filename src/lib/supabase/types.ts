/** Supabase 데이터베이스 타입 정의 */

export interface Database {
  public: {
    Tables: {
      /** 게임 기록 테이블 */
      game_records: {
        Row: {
          id: string;
          created_at: string;
          result: "win" | "lose" | "draw";
          total_moves: number;
          final_fen: string;
          duration_seconds: number | null;
          player_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          result: "win" | "lose" | "draw";
          total_moves: number;
          final_fen: string;
          duration_seconds?: number | null;
          player_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          result?: "win" | "lose" | "draw";
          total_moves?: number;
          final_fen?: string;
          duration_seconds?: number | null;
          player_id?: string | null;
        };
      };
      /** DNA 분석 데이터 테이블 */
      dna_records: {
        Row: {
          id: string;
          game_id: string;
          created_at: string;
          aggression_score: number;
          capture_count: number;
          pawn_advance_score: number;
          move_count: number;
          highlight_captions: string[];
          player_id: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          created_at?: string;
          aggression_score: number;
          capture_count: number;
          pawn_advance_score: number;
          move_count: number;
          highlight_captions?: string[];
          player_id?: string | null;
        };
        Update: {
          id?: string;
          game_id?: string;
          created_at?: string;
          aggression_score?: number;
          capture_count?: number;
          pawn_advance_score?: number;
          move_count?: number;
          highlight_captions?: string[];
          player_id?: string | null;
        };
      };
      /** 이동 기록 테이블 (상세 분석용) */
      move_records: {
        Row: {
          id: string;
          game_id: string;
          move_number: number;
          san: string;
          from_square: string;
          to_square: string;
          fen_after: string;
          is_capture: boolean;
          is_check: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          move_number: number;
          san: string;
          from_square: string;
          to_square: string;
          fen_after: string;
          is_capture?: boolean;
          is_check?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          move_number?: number;
          san?: string;
          from_square?: string;
          to_square?: string;
          fen_after?: string;
          is_capture?: boolean;
          is_check?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

/** 게임 기록 타입 */
export type GameRecord = Database["public"]["Tables"]["game_records"]["Row"];
export type GameRecordInsert = Database["public"]["Tables"]["game_records"]["Insert"];

/** DNA 기록 타입 */
export type DnaRecord = Database["public"]["Tables"]["dna_records"]["Row"];
export type DnaRecordInsert = Database["public"]["Tables"]["dna_records"]["Insert"];

/** 이동 기록 타입 */
export type MoveRecord = Database["public"]["Tables"]["move_records"]["Row"];
export type MoveRecordInsert = Database["public"]["Tables"]["move_records"]["Insert"];
