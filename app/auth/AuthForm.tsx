'use client'

import React, { useState, useEffect, useActionState, useRef } from 'react'
import { login, signup, signInWithOAuth } from './actions'
import { useSearchParams, useRouter } from 'next/navigation'
import { type Provider } from '@supabase/supabase-js'
import LogoIcon from '@/components/LogoIcon'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

export default function AuthForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get initial mode from URL or default to login
  const initialMode = searchParams.get('mode') === 'signup' ? false : true
  const [isLogin, setIsLogin] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Input refs for auto-focus
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nicknameRef = useRef<HTMLInputElement>(null)

  // Manage form values locally to ensure they persist across server actions
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
  })

  // useActionState handles error/message return values from server actions
  const [state, formAction, isPending] = useActionState<
    { error?: string; message?: string; field?: 'email' | 'password' | 'nickname' } | null,
    FormData
  >(
    async (prevState, formDataPayload) => {
      const result = isLogin ? await login(prevState, formDataPayload) : await signup(prevState, formDataPayload)
      return result as any
    },
    null
  )

  // Sync isLogin with URL mode parameter
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup' && isLogin) setIsLogin(false)
    if (mode !== 'signup' && !isLogin) setIsLogin(true)
  }, [searchParams])

  // Handle focus on error
  useEffect(() => {
    if (state?.error && state.field) {
      if (state.field === 'email') emailRef.current?.focus()
      else if (state.field === 'password') passwordRef.current?.focus()
      else if (state.field === 'nickname') nicknameRef.current?.focus()
    }
  }, [state])

  // Handle success modal
  useEffect(() => {
    if (state?.message) {
      setShowSuccessModal(true)
    }
  }, [state])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const switchMode = (toLogin: boolean) => {
    setIsLogin(toLogin)
    setFormData({ email: '', password: '', nickname: '' })
    const params = new URLSearchParams(searchParams.toString())
    if (toLogin) params.delete('mode')
    else params.set('mode', 'signup')
    router.push(`?${params.toString()}`)
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
    if (!isLogin) {
      setFormData({
        email: '',
        password: '',
        nickname: '',
      })
      switchMode(true) // Redirect to login after successful signup
    }
  }

  // Handle errors and messages from searchParams (initial load) as well as state
  const error = state?.error || searchParams.get('error')
  const message = state?.message || searchParams.get('message')

  return (
    <div className="flex min-h-screen w-full font-sans bg-[#fcfcf2] dark:bg-[#1A1C19] text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="text-2xl font-black mb-3">축하합니다!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {state?.message || '처리가 완료되었습니다.'}
            </p>
            <button
              onClick={closeSuccessModal}
              className="w-full bg-[#4F6F52] hover:bg-[#3e5841] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#4F6F52]/25 transition-all active:scale-[0.98]"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Left Side: Visual/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden"
        style={{
          backgroundColor: '#4F6F52',
          backgroundImage: 'radial-gradient(at 0% 0%, hsla(85, 20%, 60%, 1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(125, 17%, 38%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(45, 30%, 80%, 1) 0, transparent 50%)'
        }}>
        <div className="relative z-10 max-w-lg text-white">
          <Link href="/" className="mb-8 flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center size-12 backdrop-blur-md bg-black/20 rounded-xl">
              <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Cloud Memo</h1>
          </Link>
          <h2 className="text-5xl font-bold leading-tight mb-6">클라우드 메모에 당신의<br /> 생각을 담으세요.</h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">일상을 정리하고 모든 기기에서 동기화하며, 소중한 아이디어를 절대 놓치지 마세요. 매일 영감을 얻기 위해 Cloud Memo를 신뢰하는 수만 명의 사용자와 함께하세요.</p>

          <div className="mt-12 flex gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#4F6F52] bg-slate-400 overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${i + 10})` }}></div>
                </div>
              ))}
            </div>
            <div className="text-sm font-medium self-center">
              <span className="block">1만 명 이상의 사용자가 신뢰함</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[10%] left-[-5%] w-64 h-64 bg-[#4e6e52]/30 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 dark:bg-[#1A1C19] bg-[#fcfcf2] relative">
        {/* Theme Toggle */}
        <ThemeToggle variant="auth" className="absolute top-8 right-8" />

        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden mb-10 flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <LogoIcon iconSize="text-2xl" containerClass="size-10 rounded-xl" />
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black">{isLogin ? '다시 오신 것을 환영합니다' : '새로운 시작을 환영합니다'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {isLogin ? '노트에 접속하기 위해 상세 정보를 입력해주세요.' : 'Cloud Memo와 함께 기록을 시작하세요.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {message && !showSuccessModal && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
              {message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 pl-1" htmlFor="nickname">닉네임</label>
                <input
                  ref={nicknameRef}
                  className={`w-full px-4 py-3.5 rounded-xl border ${state?.field === 'nickname' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#4F6F52] outline-none transition-all`}
                  id="nickname" 
                  name="nickname" 
                  placeholder="사용할 닉네임을 입력하세요" 
                  type="text"
                  value={formData.nickname}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 pl-1" htmlFor="email">이메일 주소</label>
              <input
                ref={emailRef}
                className={`w-full px-4 py-3.5 rounded-xl border ${state?.field === 'email' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#4F6F52] outline-none transition-all`}
                id="email" 
                name="email" 
                placeholder="name@company.com" 
                type="email" 
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 pl-1" htmlFor="password">비밀번호</label>
                {isLogin && <a className="text-xs font-bold text-[#4F6F52] hover:underline" href="#">비밀번호를 잊으셨나요?</a>}
              </div>
              <div className="relative">
                <input
                  ref={passwordRef}
                  className={`w-full px-4 py-3.5 rounded-xl border ${state?.field === 'password' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#4F6F52] outline-none transition-all`}
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4F6F52]"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center">
                <input className="w-4 h-4 rounded text-[#4F6F52] focus:ring-[#4F6F52] border-slate-300 dark:border-slate-700" id="remember" type="checkbox" />
                <label className="ml-2 text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">30일 동안 로그인 유지</label>
              </div>
            )}

            <button
              className="w-full bg-[#4F6F52] hover:bg-[#3e5841] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#4F6F52]/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              type="submit"
              disabled={isPending}
            >
              {isPending ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#fcfcf2] dark:bg-[#1A1C19] text-slate-500 font-medium">또는 다음 계정으로 계속하기</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => signInWithOAuth('kakao' as Provider)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 5.51 2 9.85c0 2.76 1.8 5.18 4.54 6.64-.17.6-.62 2.21-.71 2.53-.11.41.14.4.3.29.12-.08 1.96-1.33 2.74-1.86.37.05.74.08 1.13.08 5.52 0 10-3.51 10-7.85S17.52 2 12 2z"></path>
              </svg>
              Kakao
            </button>
            <button
              onClick={() => signInWithOAuth('naver' as Provider)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold text-sm"
            >
              <div className="w-5 h-5 bg-[#03C75A] flex items-center justify-center text-white text-[10px] font-bold rounded-sm">N</div>
              Naver
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'} {' '}
            <button
              onClick={() => switchMode(!isLogin)}
              className="font-bold text-[#4F6F52] hover:underline bg-transparent"
            >
              {isLogin ? '무료로 가입하세요' : '로그인하기'}
            </button>
          </p>

          <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 flex justify-between text-[11px] text-slate-400 uppercase tracking-widest font-bold">
            <span>© 2024 Cloud Memo</span>
            <div className="flex gap-4">
              <a className="hover:text-[#4F6F52]" href="#">개인정보처리방침</a>
              <a className="hover:text-[#4F6F52]" href="#">이용약관</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
