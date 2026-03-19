'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6"

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
