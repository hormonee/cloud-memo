'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import LogoIcon from './LogoIcon'
import ThemeToggle from './ThemeToggle'
import { signOut } from '@/app/auth/actions'

export default function Header({ variant = 'main' }: { variant?: 'main' | 'dashboard' | 'payment' }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [displayName, setDisplayName] = useState('사용자')
  const [joinedYear, setJoinedYear] = useState(new Date().getFullYear())
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const fetchAuthAndProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        if (variant === 'dashboard') {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('nickname, full_name, avatar_url, created_at')
            .eq('id', user.id)
            .single()
            
          const name = profile?.nickname || profile?.full_name || user.email?.split('@')[0] || '사용자'
          setDisplayName(name)
          setJoinedYear(profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear())
          setAvatarUrl(profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F6F52&color=fff`)
        }
      } else {
        setIsLoggedIn(false)
      }
    }
    fetchAuthAndProfile()
  }, [variant])

  return (
    <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 lg:px-12 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 h-20">
      <div className="flex items-center gap-2">
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="hover:opacity-80 transition-opacity">
          <LogoIcon />
        </Link>
      </div>

      {(variant === 'main' || variant === 'payment') ? (
        <div className="flex flex-1 justify-end gap-4 lg:gap-8">
          {(!isLoggedIn || variant !== 'payment') && (
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors cursor-pointer">기능</Link>
              <Link href="/payment" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors cursor-pointer">가격</Link>
              <Link href="/#about" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors cursor-pointer">소개</Link>
            </nav>
          )}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <button className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-primary text-white text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                    대시보드
                  </button>
                </Link>
                <form action={signOut}>
                  {variant === 'payment' ? (
                    <button type="submit" className="flex items-center justify-center size-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all group ml-2" title="로그아웃">
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">logout</span>
                    </button>
                  ) : (
                    <button type="submit" className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors ml-2">
                      로그아웃
                    </button>
                  )}
                </form>
              </>
            ) : (
              <Link href="/auth">
                <button className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-primary text-white text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                  시작하기
                </button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 justify-between items-center ml-8 lg:ml-16">
          <div className="relative w-full max-w-md hidden sm:block">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              className="w-full pl-12 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all" 
              placeholder="메모 검색..." 
              type="text"
            />
          </div>
          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <ThemeToggle />
            <button className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 relative hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            <div className="h-8 w-px bg-primary/10 hidden sm:block"></div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{displayName}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{joinedYear}년부터 회원</p>
              </div>
              <div className="size-10 rounded-full bg-cover bg-center border-2 border-primary/20 shadow-sm" style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
            </div>
            <form action={signOut} className="ml-2 hidden sm:block">
              <button type="submit" className="flex items-center justify-center size-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all group" title="로그아웃">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">logout</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
