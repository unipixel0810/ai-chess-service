"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Google 로그인 후 리다이렉트되면 자동으로 메인 페이지로 이동
    const timer = setTimeout(() => {
      router.push("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">로그인 중...</p>
      </div>
    </div>
  );
}
