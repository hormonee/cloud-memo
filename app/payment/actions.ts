'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const SECRET_KEY = process.env.TOSS_SECRET_KEY || ""

export async function createPaymentLog(orderId: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase.from('payment_logs').insert({
    user_id: user.id,
    order_id: orderId,
    amount: amount,
    status: 'PENDING'
  })

  if (error) {
    console.error('Payment log creation error:', error)
    return { error: '결제 로그 생성 실패' }
  }

  return { success: true }
}

export async function updatePaymentLog(orderId: string, status: string, failReason?: string, paymentKey?: string) {
  const supabase = await createClient()

  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }
  if (failReason) updateData.fail_reason = failReason
  if (paymentKey) updateData.payment_key = paymentKey

  const { error } = await supabase
    .from('payment_logs')
    .update(updateData)
    .eq('order_id', orderId)

  if (error) {
    console.error('Payment log update error:', error)
    return { error: '결제가 성공했으나 로그 업데이트에 실패했습니다.' }
  }

  return { success: true }
}

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const supabase = await createClient()

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
      await updatePaymentLog(orderId, 'FAILED', data.message || '결제 승인 실패')
      return { error: data.message || '결제 승인 실패' }
    }

    // 결제 로그 업데이트 (SUCCESS)
    await updatePaymentLog(orderId, 'SUCCESS', undefined, paymentKey)

    // 사용자 플랜 업데이트 (Pro)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ plan_type: 'pro', updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'page')

    return { success: true, data }
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return { error: '결제 처리 중 서버 오류가 발생했습니다.' }
  }
}

// KST(UTC+9) 기준 날짜 계산 헬퍼
function getKSTDate(date: Date = new Date()) {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  const KST_OFFSET = 9 * 60 * 60000
  return new Date(utc + KST_OFFSET)
}

// 다음 결제일 계산 (현재 KST 기준 1달 뒤의 00:00:00)
function getNextBillingDateKST() {
  const nowKST = getKSTDate()
  const nextMonth = new Date(nowKST)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setHours(0, 0, 0, 0)
  return nextMonth.toISOString()
}

export async function issueAndExecuteBilling(customerKey: string, authKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  try {
    // 1. 빌링키 발급 요청
    const authResponse = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerKey,
        authKey,
      }),
    })

    const authData = await authResponse.json()
    if (!authResponse.ok) {
      console.error('Billing key issue error:', authData)
      return { error: authData.message || '빌링키 발급 실패' }
    }

    const { billingKey } = authData

    // 2.subscriptions 테이블 저장 (KST 결제일 고정 방식)
    const nextBillingDate = getNextBillingDateKST()

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        customer_key: customerKey,
        billing_key: billingKey,
        status: 'active',
        next_billing_date: nextBillingDate,
      })

    if (subError) {
      console.error('Subscription save error:', subError)
      return { error: '구독 정보 저장 실패' }
    }

    // 3. 최초 결제 즉시 승인 요청 (9,900원)
    const orderId = "BILL_" + Math.random().toString(36).substring(2, 11)

    await supabase.from('payment_logs').insert({
      user_id: user.id,
      order_id: orderId,
      amount: 9900,
      status: 'PENDING'
    })

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
        taxFreeAmount: 0,
        customerEmail: user.email,
      }),
    })

    const payData = await payResponse.json()
    if (!payResponse.ok) {
      console.error('Initial billing payment error:', payData)
      await updatePaymentLog(orderId, 'FAILED', payData.message || '최초 결제 승인 실패')
      return { error: payData.message || '최초 결제 승인 실패' }
    }

    await updatePaymentLog(orderId, 'SUCCESS', undefined, payData.paymentKey)

    await supabase
      .from('user_profiles')
      .update({ plan_type: 'pro', updated_at: new Date().toISOString() })
      .eq('id', user.id)

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'page')

    return { success: true, data: payData }
  } catch (error) {
    console.error('issueAndExecuteBilling exception:', error)
    return { error: '정기 결제 처리 중 서버 오류가 발생했습니다.' }
  }
}

export async function executeBilling(customerKey: string, billingKey: string, userId: string, email?: string) {
  const supabase = await createAdminClient()
  const orderId = "BILL_" + Math.random().toString(36).substring(2, 11)

  await supabase.from('payment_logs').insert({
    user_id: userId,
    order_id: orderId,
    amount: 9900,
    status: 'PENDING'
  })

  try {
    const response = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
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
        taxFreeAmount: 0,
        customerEmail: email,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error(`Billing execution failed for ${userId}:`, data)
      await updatePaymentLog(orderId, 'FAILED', data.message || '정기 결제 승인 실패')
      return { success: false, error: data.message }
    }

    await updatePaymentLog(orderId, 'SUCCESS', undefined, data.paymentKey)

    const nextBillingDate = getNextBillingDateKST()

    await supabase
      .from('subscriptions')
      .update({
        next_billing_date: nextBillingDate,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    return { success: true, data }
  } catch (error: any) {
    console.error(`Billing execution error for ${userId}:`, error)
    await updatePaymentLog(orderId, 'FAILED', error.message || '서버 오류')
    return { success: false, error: error.message }
  }
}

export async function processDailySubscriptions() {
  const supabase = await createAdminClient()

  const nowKST = getKSTDate()
  const todayKST = new Date(nowKST)
  todayKST.setHours(23, 59, 59, 999)
  const todayISO = todayKST.toISOString()

  const { data: dueSubscriptions, error } = await supabase
    .from('subscriptions')
    .select('*, user_profiles(email)')
    .eq('status', 'active')
    .lte('next_billing_date', todayISO)

  if (error) {
    console.error('Error fetching due subscriptions:', error)
    return { processed: 0, successCount: 0, failedCount: 0, error: error.message }
  }

  const results = {
    processed: dueSubscriptions?.length || 0,
    successCount: 0,
    failedCount: 0
  }

  if (!dueSubscriptions || dueSubscriptions.length === 0) {
    return results
  }

  for (const sub of dueSubscriptions) {
    const res = await executeBilling(
      sub.customer_key,
      sub.billing_key,
      sub.user_id,
      (sub.user_profiles as any)?.email
    )
    if (res.success) {
      results.successCount++
    } else {
      results.failedCount++
    }
  }

  return results
}

export async function cancelSubscription(subscriptionId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: '로그인이 필요합니다.' }

  let query = supabase.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() })
  
  if (subscriptionId) {
    query = query.eq('id', subscriptionId).eq('user_id', user.id)
  } else {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query

  if (error) {
    console.error('Cancel subscription error:', error)
    return { error: '구독 취소 처리에 실패했습니다.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function processDailyDowngrades() {
  const supabase = await createAdminClient()
  
  const nowKST = getKSTDate()
  const todayKST = new Date(nowKST)
  todayKST.setHours(23, 59, 59, 999) 
  const todayISO = todayKST.toISOString()

  // 취소된 구독 중 기간이 만료된 항목 조회
  const { data: expiredSubscriptions, error } = await supabase
    .from('subscriptions')
    .select('user_id, id')
    .eq('status', 'cancelled')
    .lte('next_billing_date', todayISO)

  if (error) {
    console.error('Error fetching expired subscriptions:', error)
    return { processed: 0, error: error.message }
  }

  if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
    return { processed: 0 }
  }

  let successCount = 0

  for (const sub of expiredSubscriptions) {
    // 1. 프로필 다운그레이드
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ plan_type: 'basic', updated_at: new Date().toISOString() })
      .eq('id', sub.user_id)
      
    if (profileError) {
      console.error(`Downgrade error for User ${sub.user_id}:`, profileError)
      continue
    }

    // 2. 만료 처리된 구독은 'past_due' (또는 삭제/만료 상태)로 변경하여 중복 처리 방지
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due', updated_at: new Date().toISOString() })
      .eq('id', sub.id)
      
    successCount++
  }

  return { processed: expiredSubscriptions.length, successCount }
}
