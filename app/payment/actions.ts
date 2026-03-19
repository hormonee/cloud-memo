'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const SECRET_KEY = process.env.TOSS_SECRET_KEY || ""

export async function createPaymentLog(orderId: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다.' }

  const { error } = await supabase
    .from('payment_logs')
    .insert({
      user_id: user.id,
      order_id: orderId,
      amount,
      status: 'PENDING'
    })

  if (error) {
    console.error('createPaymentLog error:', error)
    return { error: error.message }
  }
  return { success: true }
}

export async function updatePaymentLog(orderId: string, status: 'CANCELLED' | 'FAILED' | 'SUCCESS', failReason?: string, paymentKey?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payment_logs')
    .update({
      status,
      fail_reason: failReason,
      payment_key: paymentKey,
      updated_at: new Date().toISOString()
    })
    .eq('order_id', orderId)

  if (error) {
    console.error('updatePaymentLog error:', error)
    return { error: error.message }
  }
  return { success: true }
}

export async function confirmPayment(paymentKey: string, orderId: string, amount: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '인증되지 않은 사용자입니다.' }
  }

  if (!paymentKey || !orderId || !amount) {
    return { error: '필수 결제 정보가 누락되었습니다.' }
  }

  // 1. 이미 성공한 결제인지 확인 (중복 승인 및 상태 변경 방지)
  const { data: existingLog } = await supabase
    .from('payment_logs')
    .select('status')
    .eq('order_id', orderId)
    .single()

  if (existingLog?.status === 'SUCCESS') {
    return { error: '이미 처리된 결제입니다.' }
  }

  try {
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('TossPayments confirm error:', data)
      await updatePaymentLog(orderId, 'FAILED', data.message || '결제 승인 중 오류')
      return { error: data.message || '결제 승인 중 오류가 발생했습니다.' }
    }

    // 결제 성공 시 유저 플랜 업데이트 및 로그 업데이트
    await updatePaymentLog(orderId, 'SUCCESS', undefined, paymentKey)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ plan_type: 'pro', updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update profile error:', updateError)
      return { error: '프로필 업데이트 중 오류가 발생했습니다.' }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'page')
    revalidatePath('/payment', 'page')
    
    return { success: true, data }
  } catch (error) {
    console.error('Confirm payment exception:', error)
    return { error: '서버 통신 중 오류가 발생했습니다.' }
  }
}

export async function issueAndExecuteBilling(authKey: string, customerKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '인증이 필요합니다.' }

  try {
    // 1. 빌링키 발급 API 호출
    const authResponse = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authKey,
        customerKey,
      }),
    })

    const authData = await authResponse.json()
    if (!authResponse.ok) {
      console.error('Billing issue error:', authData)
      return { error: authData.message || '빌링키 발급 실패' }
    }

    const { billingKey } = authData

    // 2.subscriptions 테이블 저장 (결제일 고정 방식: 현재일 기준 1달 뒤)
    const nextBillingDate = new Date()
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        customer_key: customerKey,
        billing_key: billingKey,
        status: 'active',
        next_billing_date: nextBillingDate.toISOString(),
      })

    if (subError) {
      console.error('Subscription save error:', subError)
      return { error: '구독 정보 저장 실패' }
    }

    // 3. 최초 결제 즉시 승인 요청 (9,900원)
    const orderId = "BILL_" + Math.random().toString(36).substring(2, 11)
    const payResponse = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerKey,
        orderId,
        orderName: 'Cloud Memo Pro 정기 구독',
        amount: 9900,
        customerEmail: user.email,
      }),
    })

    const payData = await payResponse.json()
    if (!payResponse.ok) {
      console.error('Initial billing payment error:', payData)
      // 빌링키 발급은 성공했으나 첫 결제 실패 시 상황 (필요 시 후속 처리)
      return { error: payData.message || '최초 결제 승인 실패' }
    }

    // 4. 권한 및 로그 업데이트
    await supabase.from('payment_logs').insert({
      user_id: user.id,
      order_id: orderId,
      amount: 9900,
      status: 'SUCCESS',
      payment_key: payData.paymentKey
    })

    await supabase
      .from('user_profiles')
      .update({ plan_type: 'pro' })
      .eq('id', user.id)

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'page')
    
    return { success: true, data: payData }
  } catch (error) {
    console.error('issueAndExecuteBilling exception:', error)
    return { error: '정기 결제 처리 중 서버 오류가 발생했습니다.' }
  }
}
