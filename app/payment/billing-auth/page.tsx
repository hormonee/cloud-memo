import React, { Suspense } from 'react'
import BillingAuthHandler from './BillingAuthHandler'

export default function BillingAuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex flex-col items-center">
        <div className="size-16 relative mb-6">
          <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          결제를 설정하고 있습니다
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          안전하게 결제를 처리 중입니다. 잠시만 기다려주세요. 창을 닫지 마세요.
        </p>
      </div>

      {/* useSearchParams를 사용하는 컴포넌트는 Suspense로 감싸야 합니다 */}
      <Suspense>
        <BillingAuthHandler />
      </Suspense>
    </div>
  )
}
