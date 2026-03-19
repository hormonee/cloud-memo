'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import AlertModal from '@/components/AlertModal'
import { createClient } from '@/utils/supabase/client'
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk'
import { createPaymentLog, updatePaymentLog } from './actions'

export default function PaymentPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSdkLoading, setIsSdkLoading] = useState(false)
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)
  
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null)
  const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"
  const customerKey = "CUSTOMER_UNIQUE_ID_" + Math.random().toString(36).substring(2, 11)

  const handleProPlanClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Auth Check
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth?message=' + encodeURIComponent('결제를 진행하려면 로그인이 필요합니다.'))
      return
    }

    // 이미 구독 중인지 확인
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan_type')
      .eq('id', user.id)
      .single()

    if (profile?.plan_type === 'pro' || profile?.plan_type === 'team') {
      setIsAlreadySubscribed(true)
      return
    }

    setIsPaymentModalOpen(true)
  }

  useEffect(() => {
    if (!isPaymentModalOpen) return

    async function fetchPaymentWidgets() {
      try {
        setIsSdkLoading(true)
        const tossPayments = await loadTossPayments(clientKey)
        const widgets = tossPayments.widgets({ customerKey })
        widgetsRef.current = widgets

        await widgets.setAmount({
          value: 9900,
          currency: "KRW",
        })

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          })
        ])
      } catch (error) {
        console.error("Error loading TossPayments:", error)
      } finally {
        setIsSdkLoading(false)
      }
    }

    fetchPaymentWidgets()
  }, [isPaymentModalOpen])

  const handlePaymentRequest = async () => {
    if (!widgetsRef.current) return

    const orderId = "ORDER_" + Math.random().toString(36).substring(2, 11)
    const amount = 9900

    try {
      // 1. PENDING 상태 로그 생성
      await createPaymentLog(orderId, amount)

      await widgetsRef.current.requestPayment({
        orderId,
        orderName: "Cloud Memo Pro Plan",
        successUrl: window.location.origin + "/payment/completed",
        failUrl: window.location.origin + "/payment/fail",
      })
    } catch (error: any) {
      console.error("Payment request failed:", error)
      
      // 사용자 취소 처리
      if (error.code === 'USER_CANCEL') {
        await updatePaymentLog(orderId, 'CANCELLED', '사용자가 결제창을 닫았습니다.')
      } else {
        await updatePaymentLog(orderId, 'FAILED', error.message || '결제 요청 중 오류 발생')
      }
    }
  }

  const plans = [
    {
      name: '베이직',
      price: '$0',
      description: '시작하는 개인에게 완벽합니다.',
      buttonText: '시작하기',
      features: ['5GB 클라우드 저장공간', '2개 기기 동기화', '기본 검색'],
      excluded: ['고급 OCR'],
      popular: false,
    },
    {
      name: '프로',
      price: '$9.99',
      description: '본격적인 메모 작성을 위한 강력한 도구들.',
      buttonText: '플랜 선택하기',
      features: ['무제한 저장공간', '모든 기기 동기화', '우선 지원', '이미지 및 PDF OCR', '고급 서식 설정'],
      excluded: [],
      popular: true,
    },
    {
      name: '팀',
      price: '$29.99',
      description: '현대적인 팀을 위한 협업 기능.',
      buttonText: '영업 문의',
      features: ['프로의 모든 기능 포함', '관리자 대시보드', '팀 협업', 'SSO 로그인 지원', '맞춤형 온보딩'],
      excluded: [],
      popular: false,
    }
  ]

  const faqs = [
    {
      question: '언제든지 구독을 취소할 수 있나요?',
      answer: '네, 계정 설정에서 언제든지 구독을 취소할 수 있습니다. 액세스 권한은 현재 결제 기간이 종료될 때까지 유지됩니다. 숨겨진 수수료나 해지 비용은 없습니다.'
    },
    {
      question: '어떤 결제 수단을 사용할 수 있나요?',
      answer: '모든 주요 신용카드(Visa, Mastercard, American Express), PayPal, Apple Pay를 사용할 수 있습니다. 팀 플랜의 경우 연간 결제 시 청구서 발행 옵션도 제공합니다.'
    },
    {
      question: '비영리 단체나 학생을 위한 할인이 있나요?',
      answer: '네! 인증된 학생 및 등록된 비영리 단체에 50% 할인을 제공합니다. 자격 증명 서류와 함께 고객 지원 팀에 문의해 주세요.'
    }
  ]

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen antialiased">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        {/* Navigation Header */}
        <Header variant="payment" />

        <main className="flex flex-1 justify-center py-12 md:py-20 px-6">
          <div className="flex flex-col max-w-[1080px] flex-1">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tight max-w-2xl">
                당신의 노트를 위한<br />최적의 플랜을 선택하세요.
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-lg">
                개인과 팀을 위한 투명하고 단순한 요금제입니다. 한계 없이 창의성을 확장하세요.
              </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 items-stretch">
              {plans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`relative flex flex-col gap-6 rounded-2xl border ${
                    plan.popular 
                      ? 'border-2 border-primary bg-white dark:bg-slate-900 shadow-2xl shadow-primary/10 md:scale-105 z-10' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/30'
                  } p-8 transition-all group`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      가장 인기 있음
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <h3 className={`${plan.popular ? 'text-primary' : 'text-slate-500 dark:text-slate-400'} text-sm font-bold uppercase tracking-wider`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-900 dark:text-white text-5xl font-black tracking-tighter">{plan.price}</span>
                      <span className="text-slate-500 text-lg font-medium">/월</span>
                    </div>
                    <p className="text-slate-500 text-sm">{plan.description}</p>
                  </div>

                  <div onClick={plan.name === '프로' ? handleProPlanClick : undefined} className="w-full">
                    <Button 
                      fullWidth 
                      variant={plan.popular ? 'primary' : plan.name === '팀' ? 'secondary' : 'secondary'}
                      className={plan.name === '팀' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-none hover:bg-slate-800 dark:hover:bg-slate-200 shadow-none' : ''}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="text-sm font-medium flex gap-3 text-slate-700 dark:text-slate-300 items-start">
                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.excluded?.map((feature, fidx) => (
                      <div key={fidx} className="text-sm font-medium flex gap-3 text-slate-400 dark:text-slate-600 line-through items-start">
                         <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-[20px] shrink-0">cancel</span>
                         <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-24 max-w-3xl mx-auto w-full">
              <h2 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight mb-8 text-center">자주 묻는 질문 (FAQ)</h2>
              <div className="flex flex-col gap-4">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx
                  return (
                    <div 
                      key={idx} 
                      className="group bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <button 
                        className="w-full flex cursor-pointer items-center justify-between p-5 focus:outline-none text-left"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                      >
                        <span className="text-slate-900 dark:text-white font-bold">{faq.question}</span>
                        <span className={`material-symbols-outlined transition-transform text-primary ${isOpen ? 'rotate-180' : ''}`}>
                          keyboard_arrow_down
                        </span>
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="mt-20 p-10 rounded-3xl bg-primary text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">아직 궁금한 점이 있으신가요?</h2>
                <p className="text-white/80 mb-8 max-w-lg mx-auto">고객 지원 팀이 귀하의 필요에 맞는 최적의 플랜을 찾도록 도와드립니다.</p>
                <Button variant="secondary" className="text-primary hover:bg-slate-50 dark:hover:bg-slate-200 font-bold px-8 py-3">고객 지원 문의</Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />

        {/* TossPayments Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black">프로 플랜 결제하기</h3>
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 p-4 bg-primary/5 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-primary uppercase tracking-wider">선택한 플랜</p>
                    <p className="text-lg font-black tracking-tight">Cloud Memo Pro</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">₩9,900</p>
                    <p className="text-xs text-slate-500 font-medium">부가가치세 포함</p>
                  </div>
                </div>

                {isSdkLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">결제 모듈을 불러오는 중입니다...</p>
                  </div>
                )}
                
                <div id="payment-method" className="w-full"></div>
                <div id="agreement" className="w-full mt-4"></div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  fullWidth 
                  variant="primary" 
                  onClick={handlePaymentRequest}
                  disabled={isSdkLoading}
                  className="h-14 text-base font-bold"
                >
                  결제하기
                </Button>
              </div>
            </div>
          </div>
        )}

        <AlertModal 
          isOpen={isAlreadySubscribed}
          title="이미 구독 중입니다"
          message="현재 프로 요금제를 사용하고 계십니다. 대시보드로 이동합니다."
          onConfirm={() => router.push('/dashboard')}
        />
      </div>
    </div>
  )
}
