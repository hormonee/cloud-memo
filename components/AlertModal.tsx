'use client'

import React from 'react'

interface AlertModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
}

export default function AlertModal({ isOpen, title, message, onConfirm }: AlertModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-primary/10 animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="size-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">priority_high</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-primary/5">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
