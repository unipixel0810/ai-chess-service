import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 환경변수가 없으면 null (로컬 모드)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// 클라이언트 사이드에서 Supabase 연결 상태 확인
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    if (!supabase) {
      console.log("🔸 Supabase 미설정 - 로컬 모드로 실행");
      return false;
    }
    const { error } = await supabase.from("game_records").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
