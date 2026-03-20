'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { issueAndExecuteBilling, updatePaymentLog } from '../actions'

export default function BillingAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const customerKey = searchParams.get('customerKey')
    const authKey = searchParams.get('authKey')
    const regOrderId = searchParams.get('orderId') // PaymentPage에서 넘겨준 REG_...

    if (!customerKey || !authKey) {
      console.error('Missing customerKey or authKey')
      if (regOrderId) {
        updatePaymentLog(regOrderId, 'FAILED', 'Missing customerKey or authKey')
      }
      router.push('/payment/fail?message=' + encodeURIComponent('잘못된 요청입니다. 카드 등록 정보를 확인할 수 없습니다.'))
      return
    }

    const processBilling = async () => {
      try {
        const result = await issueAndExecuteBilling(authKey, customerKey)
        if (result.success) {
          if (regOrderId) {
            await updatePaymentLog(regOrderId, 'SUCCESS')
          }
          router.replace('/payment/completed?isBilling=true')
        } else {
          if (regOrderId) {
            await updatePaymentLog(regOrderId, 'FAILED', result.error)
          }
          router.replace('/payment/fail?message=' + encodeURIComponent(result.error || '빌링키 발급 및 결제에 실패했습니다.') + (regOrderId ? `&orderId=${regOrderId}` : ''))
        }
      } catch (err: any) {
        console.error('Billing process error:', err)
        if (regOrderId) {
          await updatePaymentLog(regOrderId, 'FAILED', err.message)
        }
        router.replace('/payment/fail?message=' + encodeURIComponent('일시적인 오류가 발생했습니다. 다시 시도해 주세요.'))
      }
    }

    processBilling()
  }, [router, searchParams])

  return null
}
