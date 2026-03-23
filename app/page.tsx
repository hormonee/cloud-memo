import React from 'react'
import { Metadata } from 'next'
import LandingContent from './LandingContent'

export const metadata: Metadata = {
  title: "Cloud Memo -클라우드에 생각을 담다",
  description: "언제 어디서나 아이디어를 기록하고 모든 기기에서 즉시 동기화하세요. 가장 스마트하고 안전한 메모 클라우드 서비스 Cloud Memo입니다.",
  openGraph: {
    title: "Cloud Memo - 클라우드에 생각을 담다",
    description: "언제 어디서나 아이디어를 기록하고 모든 기기에서 즉시 동기화하세요. 가장 스마트하고 안전한 메모 클라우드 서비스 Cloud Memo입니다.",
  }
}

export default function LandingPage() {
  return <LandingContent />
}
