'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { label: '대시보드', icon: 'dashboard', href: '/dashboard' },
    { label: '모든 메모', icon: 'description', href: '/notes' },
    { label: '공유됨', icon: 'group', href: '/dashboard/shared' },
    { label: '저장공간', icon: 'hard_drive', href: '/dashboard/storage' },
    { label: '설정', icon: 'settings', href: '/dashboard/settings' },
  ]

  return (
    <aside className="w-64 border-r border-primary/10 bg-white/80 dark:bg-slate-900/50 flex flex-col justify-between p-4 backdrop-blur-sm z-10 shrink-0">
      <div className="flex flex-col gap-8 pt-4">
        {/* Logo Section Removed */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href)

            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/5' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary font-medium'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                <p className="text-sm">{item.label}</p>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-4">
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">저장공간 사용량</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '25%' }}></div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">10 GB 중 2.5 GB 사용</p>
        </div>
        <Link href="/payment" className="block w-full">
          <button className="w-full py-3 px-4 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95">구독 관리</button>
        </Link>
      </div>
    </aside>
  )
}
