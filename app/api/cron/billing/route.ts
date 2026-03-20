import { NextResponse } from 'next/server'
import { processDailySubscriptions, processDailyDowngrades } from '@/app/payment/actions'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  // Vercel Cron Job 보안 검증 (CRON_SECRET)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const billingResult = await processDailySubscriptions()
    const downgradeResult = await processDailyDowngrades()
    
    return NextResponse.json({
      success: true,
      billing: billingResult,
      downgrades: downgradeResult,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Cron job billing error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
