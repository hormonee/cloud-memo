'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AlertModal from '@/components/AlertModal'
import { confirmPayment } from '../actions'

function PaymentCompletedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const confirmedRef = useRef(false)

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount') || '9900'

  // Billing Auth 핸들러에서 넘어올 때 isBilling=true를 붙여서 넘기도록 되어 있음
  // 이제 파라미터가 아예 없는 경우(직접 접근)는 성공으로 간주하지 않습니다.
  const isBillingSuccess = searchParams.get('isBilling') === 'true'

  useEffect(() => {
    // 필수 파라미터가 없으면 경고창 표시
    if (!isBillingSuccess && (!paymentKey || !orderId)) {
      setIsAlertOpen(true)
      return
    }

    if (confirmedRef.current) return

    async function confirm() {
      // 빌링 결제 완료로 넘어온 경우 (서버 액션 issueAndExecuteBilling이 이미 처리함)
      if (isBillingSuccess) {
        setStatus('success')
        return
      }

      confirmedRef.current = true
      const result = await confirmPayment(paymentKey!, orderId!, Number(amount))

      if (result.success) {
        setStatus('success')
      } else {
        setErrorMessage(result.error || '결제 승인에 실패했습니다.')
        setIsAlertOpen(true)
      }
    }

    confirm()
  }, [paymentKey, orderId, amount, isBillingSuccess])

  if (isAlertOpen) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen">
        <AlertModal
          isOpen={isAlertOpen}
          title="잘못된 접근입니다"
          message={errorMessage || "필수 결제 정보가 누락되었습니다. 결제 페이지로 이동합니다."}
          onConfirm={() => router.push('/payment')}
        />
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">결제 상태 확인 중...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-[480px] w-full bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl border border-red-100 dark:border-red-900/20 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl">error</span>
          </div>
          <h1 className="text-2xl font-black mb-4 tracking-tight">승인에 실패했습니다</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            {errorMessage}
          </p>
          <Link href="/payment" className="inline-block w-full">
            <button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/25">
              다시 시도하기
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const paymentInfo = {
    planName: 'Cloud Memo Pro',
    billingCycle: '정기 구독 활성화됨',
    amount: `₩${Number(amount).toLocaleString()}`,
    transactionId: orderId || '자동 발급됨',
    date: new Date().toLocaleString('ko-KR'),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="payment" />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-[520px] w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-primary/5 p-8 border border-primary/10 transition-all">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mb-4 bg-primary/20 text-primary animate-bounce-subtle">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight mb-2">구독이 시작되었습니다!</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base">이제 프로 계정의 모든 기능을 자유롭게 이용하세요.</p>
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
                <span className="text-slate-500 dark:text-slate-400 font-medium">관리 번호</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold max-w-[180px] truncate">{paymentInfo.transactionId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">승인 일시</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{paymentInfo.date}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">다음 결제일</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{paymentInfo.nextBillingDate}</span>
              </div>
            </div>
          </div>

          <Link href="/dashboard" className="w-full">
            <button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
              <span>대시보드로 이동</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </Link>
        </div>
      </main>
      <Footer />
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

export default function PaymentCompletedPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen antialiased">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }>
        <PaymentCompletedContent />
      </Suspense>
    </div>
  )
}
