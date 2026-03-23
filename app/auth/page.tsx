import React, { Suspense } from 'react'
import { Metadata } from 'next'
import AuthForm from './AuthForm'

export const metadata: Metadata = {
  title: "Cloud Memo - 로그인 및 회원가입",
  description: "Cloud Memo 서비스에 로그인하여 나만의 생각을 클라우드에 담아보세요. 안전하고 빠른 로그인을 지원합니다.",
  openGraph: {
    title: "Cloud Memo - 로그인 및 회원가입",
    description: "Cloud Memo 서비스에 로그인하여 나만의 생각을 클라우드에 담아보세요. 안전하고 빠른 로그인을 지원합니다.",
  }
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcf2] dark:bg-[#1A1C19]">
        <div className="size-12 border-4 border-[#4F6F52]/20 border-t-[#4F6F52] rounded-full animate-spin"></div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
