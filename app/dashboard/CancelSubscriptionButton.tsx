'use client'

import { useState } from 'react'
import { cancelSubscription } from '@/app/payment/actions'
import { useRouter } from 'next/navigation'

interface CancelSubscriptionButtonProps {
  subscriptionId: string
  nextBillingDate: string
}

export default function CancelSubscriptionButton({ subscriptionId, nextBillingDate }: CancelSubscriptionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCancelClick = () => {
    setIsOpen(true)
    setError(null)
  }

  const handleConfirmCancel = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await cancelSubscription(subscriptionId)
      if (result.error) {
        setError(result.error)
      } else {
        setIsOpen(false)
        router.refresh() // Refresh dashboard to show updated status
      }
    } catch (err: any) {
      setError(err.message || '취소 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = new Date(nextBillingDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <>
      <button 
        onClick={handleCancelClick}
        className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-900/30"
      >
        구독 취소
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-primary/10">
            <div className="flex items-center gap-4 mb-6 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-4xl">warning</span>
              <h3 className="text-2xl font-black">구독을 취소하시겠습니까?</h3>
            </div>
            
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>구독을 취소하면 다음 결제일에 요금이 청구되지 않습니다.</p>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700">
                <p>👉 남은 이용 기간: <span className="font-bold text-primary">{formattedDate}</span>까지 유지됩니다.</p>
                <p className="mt-2 text-slate-500 text-xs">해당 날짜 이후에는 Basic 플랜으로 자동 변경됩니다.</p>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600 font-bold">{error}</p>
            )}

            <div className="mt-8 flex gap-3 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                닫기
              </button>
              <button 
                onClick={handleConfirmCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 hover:shadow-red-700/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                    처리 중...
                  </>
                ) : (
                  '네, 취소합니다'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
