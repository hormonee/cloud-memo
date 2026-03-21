import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloud Memo - 생각을 클라우드에 담다",
  description: "모든 기기에서 실시간 동기화되는 프리미엄 클라우드 메모 서비스. 당신의 아이디어를 언제 어디서든 기록하세요.",
  keywords: ["클라우드 메모", "스마트 노트", "AI 메모 분류", "실시간 동기화", "Cloud Memo"],
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://cloud-memo.com",
    title: "Cloud Memo - 생각을 클라우드에 담다",
    description: "모든 기기에서 실시간 동기화되는 프리미엄 클라우드 메모 서비스. 당신의 아이디어를 언제 어디서든 기록하세요.",
    siteName: "Cloud Memo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cloud Memo 서비스 미리보기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud Memo - 생각을 클라우드에 담다",
    description: "아이디어를 기록하고 AI로 스마트하게 정리하세요. Cloud Memo가 당신의 생산성을 높여줍니다.",
    images: ["/og-image.png"],
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/SidebarContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
