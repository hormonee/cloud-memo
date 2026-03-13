'use client'

import React from 'react'

import { useNotesLayout } from '../NotesPaneLayout'

interface TrashEmptyViewProps {
  notesCount: number
}

export default function TrashEmptyView({ notesCount }: TrashEmptyViewProps) {
  const { isSidebarOpen } = useNotesLayout()
  return (
    <main className="flex-1 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Mini Toolbar for Sidebar Toggle in Trash Empty View */}
      <div className="px-6 py-3 border-b border-primary/5 flex items-center bg-slate-50/10 backdrop-blur-sm sticky top-0 z-10 min-h-[57px]">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">휴지통</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center overflow-y-auto">
        <div className="max-w-md w-full">
          <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <span className="material-symbols-outlined text-4xl">delete</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">휴지통</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            최근 삭제된 메모들이 여기에 보관됩니다. <br />
            메모를 선택하면 복원 또는 영구 삭제 옵션이 표시됩니다.
          </p>
          {notesCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-3 text-left">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <p>메모를 선택하면 복합적인 액션(복원, 영구 삭제)을 취할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
