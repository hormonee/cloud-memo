import React from 'react'
import { Metadata } from 'next'
import PaymentContent from './PaymentContent'

export const metadata: Metadata = {
  title: "Cloud Memo - 플랜 및 요금 안내",
  description: "Cloud Memo Pro의 무제한 기능과 팀 협업 혜택을 확인하고 당신에게 맞는 플랜을 선택하세요.",
  openGraph: {
    title: "Cloud Memo - 플랜 및 요금 안내",
    description: "Cloud Memo Pro의 무제한 기능과 팀 협업 혜택을 확인하고 당신에게 맞는 플랜을 선택하세요.",
  }
}

export default function PaymentPage() {
  return <PaymentContent />
}
