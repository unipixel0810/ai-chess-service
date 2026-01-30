import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chess Service",
  description: "예능 스타일 AI 체스 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased min-h-screen bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
