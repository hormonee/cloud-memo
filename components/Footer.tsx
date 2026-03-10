import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="px-6 lg:px-40 py-16 border-t border-primary/10 bg-background-light dark:bg-background-dark shrink-0">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          <div className="flex flex-col gap-4 max-w-xs">
            <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center size-6 bg-primary rounded text-white shadow-sm">
                <span className="material-symbols-outlined text-xs">cloud_upload</span>
              </div>
              <h2 className="text-lg font-black tracking-tight">Cloud Memo</h2>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              생각을 더 가치 있게, 정리를 더 쉽게 만드는 클라우드 메모 서비스입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">제품</h4>
              <Link href="/#features" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">주요 기능</Link>
              <Link href="/#updates" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">업데이트</Link>
              <Link href="/#extensions" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">확장 프로그램</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">리소스</h4>
              <Link href="/#help" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">도움말</Link>
              <Link href="/#blog" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">블로그</Link>
              <Link href="/#community" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">커뮤니티</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">법률</h4>
              <Link href="/#terms" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">이용약관</Link>
              <Link href="/#privacy" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">개인정보처리방침</Link>
              <Link href="/#cookie" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors">쿠키 정책</Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-primary/5">
          <p className="text-slate-400 text-xs text-center sm:text-left">© 2024 Cloud Memo Corp. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">language</span>
            </Link>
            <Link href="/" className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">share</span>
            </Link>
            <Link href="/" className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">alternate_email</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
