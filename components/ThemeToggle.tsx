'use client'

import React from 'react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle({ className, variant = 'default' }: { className?: string, variant?: 'default' | 'auth' }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (variant === 'auth') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md active:scale-95 z-50 ${className || ''}`}
        aria-label="Toggle Theme"
      >
        <span className="material-symbols-outlined text-[26px] leading-none">
          {theme === 'light' ? 'dark_mode' : 'light_mode'}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95 ${className || ''}`}
      aria-label="Toggle Theme"
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  )
}
