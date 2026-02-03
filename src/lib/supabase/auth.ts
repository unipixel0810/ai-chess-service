import { supabase } from "./client";

/**
 * Google OAuth 로그인
 */
export async function signInWithGoogle() {
  if (!supabase) {
    console.error("Supabase 미설정");
    return { error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

/**
 * 로그아웃
 */
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * 세션 변경 감지
 */
export function onAuthStateChange(callback: (user: unknown) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  
  return supabase.auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => {
    callback(session?.user ?? null);
  });
}
