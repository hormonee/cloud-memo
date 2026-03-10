'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/Button'

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Navigation */}
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="px-6 lg:px-40 py-16 lg:py-24 overflow-x-hidden relative">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8 order-2 lg:order-1">
              <div className="flex flex-col gap-4">
                <span className="text-primary font-bold text-sm tracking-widest uppercase bg-primary/10 w-fit px-3 py-1 rounded-full">New Evolution of Note</span>
                <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">
                  클라우드에<br />
                  <span className="text-primary underline decoration-primary/20">생각을 담다,</span><br />
                  Cloud Memo
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl font-normal leading-relaxed max-w-[540px]">
                  언제 어디서나 아이디어를 기록하고 모든 기기에서 즉시 동기화하세요. 가장 스마트하고 안전한 메모 클라우드 서비스입니다.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link href="/auth?mode=signup" className="w-full sm:w-auto">
                  <Button size="lg" fullWidth className="flex items-center gap-2">
                    지금 무료 시작
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Button>
                </Link>
                <Link href="/payment" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth>
                    요금제 보기
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-4 text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background-light bg-slate-400 overflow-hidden shadow-sm">
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${i + 20})` }}></div>
                    </div>
                  ))}
                </div>
                <span className="text-sm">현재 <span className="font-bold text-slate-900 dark:text-white">10,000명 이상의 사용자</span>가 사용 중입니다</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-primary/10">
                  <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-primary/10">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center text-[10px] text-slate-400 font-mono">cloudmemo.io/dashboard</div>
                  </div>
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col gap-4">
                    <div className="h-8 w-1/3 bg-primary/20 rounded-lg animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-primary/5"></div>
                      <div className="h-32 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-primary/5"></div>
                      <div className="h-32 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-primary/5"></div>
                      <div className="h-32 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-primary/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background decorations */}
          <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-40 py-20 bg-white/50 dark:bg-slate-900/50" id="features">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col gap-4 mb-16 text-center">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">강력한 기능을 경험하세요</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-[720px] mx-auto">
                당신의 업무 효율을 극대화하기 위해 설계된 Cloud Memo만의 특별한 기능들을 소개합니다.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-primary/10 bg-white dark:bg-slate-800 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-center size-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[32px]">sync</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold">실시간 동기화</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    스마트폰, 태블릿, PC까지 모든 기기에서 작성한 메모가 실시간으로 안전하게 동기화됩니다.
                  </p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-primary/10 bg-white dark:bg-slate-800 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-center size-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold">스마트한 정리</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    강력한 AI가 메모의 내용을 분석하여 자동으로 카테고리를 분류하고 태그를 추천해 드립니다.
                  </p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-primary/10 bg-white dark:bg-slate-800 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-center size-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[32px]">lock</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold">안전한 보안</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    군사급 암호화 기술(AES-256)을 사용하여 당신의 소중한 개인 정보와 생각을 완벽하게 보호합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-40 py-20">
          <div className="max-w-[1000px] mx-auto rounded-3xl bg-primary p-8 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-800 opacity-90"></div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
                기록의 시작이 당신의<br />성장이 됩니다
              </h2>
              <p className="text-white/80 text-lg lg:text-xl max-w-[600px]">
                지금 가입하고 모든 기능을 무료로 체험해 보세요. 복잡한 카드 등록도 필요 없습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/auth" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth className="min-w-[200px] text-primary hover:bg-slate-50">
                    지금 무료 시작
                  </Button>
                </Link>
                <Link href="/payment" className="w-full sm:w-auto">
                  <Button size="lg" fullWidth className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-none">
                    요금제 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
