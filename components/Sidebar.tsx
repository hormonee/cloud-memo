'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useSidebar()

  const navItems = [
    { label: '대시보드', icon: 'dashboard', href: '/dashboard' },
    { label: '모든 메모', icon: 'description', href: '/notes' },
    { label: '저장공간', icon: 'hard_drive', href: '/dashboard/storage' },
    { label: '설정', icon: 'settings', href: '/dashboard/settings' },
  ]

  return (
    <aside className={`transition-all duration-300 ease-in-out border-r border-primary/10 bg-white/80 dark:bg-slate-900/50 flex flex-col justify-between p-4 backdrop-blur-sm z-10 shrink-0 overflow-hidden relative ${isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
      <div className={`flex flex-col gap-6 ${isSidebarOpen ? 'w-56' : 'w-12 items-center'}`}>
        {/* Toggle Button Inside */}
        <div className={`flex ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary flex items-center justify-center shadow-sm border border-primary/5"
            title={isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'px-3 py-2.5' : 'p-2 justify-center'
                  } ${isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/5'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary font-medium'
                  }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <p className="text-sm truncate">{item.label}</p>}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className={`mt-auto space-y-4 ${isSidebarOpen ? '' : 'hidden'}`}>
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

      {/* Mini-mode Footer Icon (Optional) */}
      {!isSidebarOpen && (
        <div className="mt-auto flex justify-center pb-2">
          <Link href="/payment" className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all" title="구독 관리">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </Link>
        </div>
      )}
    </aside>
  )
}
