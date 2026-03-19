'use client'

import React, { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import AlertModal from '@/components/AlertModal'

import { updatePaymentLog } from '../actions'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const code = searchParams.get('code')
  const message = searchParams.get('message')
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    // 필수 파라미터가 없으면 경고창 표시
    if (!code || !message) {
      setIsAlertOpen(true)
      return
    }

    // 실패 로그 업데이트
    if (orderId) {
      updatePaymentLog(orderId, 'FAILED', `${code}: ${message}`)
    }
  }, [code, message, orderId])

  if (isAlertOpen) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen">
        <AlertModal 
          isOpen={isAlertOpen}
          title="잘못된 접근입니다"
          message="결제 실패 정보가 없거나 잘못된 접근입니다. 결제 페이지로 이동합니다."
          onConfirm={() => router.push('/payment')}
        />
      </div>
    )
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen antialiased">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <Header variant="payment" />

        <main className="flex flex-1 justify-center items-center py-20 px-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-5xl">error</span>
            </div>
            
            <h1 className="text-3xl font-black mb-4 tracking-tight">결제에 실패했습니다</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-2 leading-relaxed font-bold text-lg">
              {message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <p className="text-slate-400 dark:text-slate-500 mb-10 text-sm font-medium">
              에러 코드: {code || 'UNKNOWN_ERROR'} {orderId && `| 주문 번호: ${orderId}`}
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/payment" className="w-full">
                <Button fullWidth variant="primary">다시 시도하기</Button>
              </Link>
              <Link href="/" className="w-full">
                <Button fullWidth variant="secondary">홈으로 이동</Button>
              </Link>
            </div>

            <p className="mt-8 text-xs text-slate-400 font-medium">
              문제 지속 시 <a href="mailto:support@cloudmemo.com" className="underline text-primary">고객 지원</a>으로 문의바랍니다.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailContent />
    </Suspense>
  )
}
