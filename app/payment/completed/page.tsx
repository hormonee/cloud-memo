'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PaymentCompletedPage() {
  // Mock data for display
  const paymentInfo = {
    planName: 'Premium Plan',
    billingCycle: '월간 구독 이용 중',
    amount: '₩9,900 / 월',
    transactionId: 'TRX-940284',
    date: '2026.03.13 11:30:05',
    nextBillingDate: '2026.04.13'
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen antialiased">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        {/* Header */}
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-[520px] w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-primary/5 p-8 border border-primary/10 transition-all">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mb-4 bg-primary/20 text-primary animate-bounce-subtle">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight mb-2">결제가 완료되었습니다!</h1>
              <p className="text-slate-600 dark:text-slate-400 text-base">이제 Cloud Memo의 모든 기능을 즐겨보세요.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-8 border border-primary/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">star</span>
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">{paymentInfo.planName}</h3>
                  <p className="text-primary font-bold text-sm tracking-tight">{paymentInfo.billingCycle}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-primary/10 pt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">결제 금액</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{paymentInfo.amount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">결제 번호</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{paymentInfo.transactionId}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">결제 일시</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{paymentInfo.date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">다음 결제일</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{paymentInfo.nextBillingDate}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/dashboard" className="w-full">
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
                  <span>대시보드로 이동</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </Link>
              <button className="w-full bg-transparent hover:bg-primary/5 text-slate-500 dark:text-slate-400 font-bold py-3 px-6 rounded-xl transition-all text-sm uppercase tracking-widest">
                영수증 보기
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              결제 관련 문의가 있으신가요? <a className="text-primary hover:underline font-bold" href="#">고객 센터</a>로 연락주세요.
            </p>
          </div>
        </main>

        <Footer />
      </div>
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
