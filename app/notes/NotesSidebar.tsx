'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { createFolder } from './actions'
import { useNotesLayout } from './NotesPaneLayout'

interface Folder {
  id: string
  name: string
}

interface NotesSidebarProps {
  folders: Folder[]
  currentFolderId?: string
  noteId?: string
  isTrash?: boolean
}

export default function NotesSidebar({ folders, currentFolderId, noteId, isTrash = false }: NotesSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toggleSidebar, isSidebarOpen } = useNotesLayout()
  const filter = searchParams.get('filter')
  // isTrashActive should only be true if we are explicitly on the trash page or viewing a trashed note WITH the trash filter
  const isTrashActive = pathname === '/notes/trash' || (isTrash && filter === 'trash')

  const [isPending, startTransition] = useTransition()
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    startTransition(async () => {
      const result = await createFolder(newFolderName)
      if (!result.error) {
        setNewFolderName('')
        setShowFolderInput(false)
        router.refresh()
      }
    })
  }

  const buildHref = (folderId?: string) => {
    // If clicking "All Cloud" (no folderId), go to /notes root to reset context
    if (!folderId) return '/notes'

    // If clicking a folder, keep the current note if it belongs to that folder, else just go to notes with folder param
    const base = noteId ? `/notes/${noteId}` : '/notes'
    return `${base}?folder=${folderId}`
  }

  return (
    <aside className={`transition-all duration-300 ease-in-out border-r border-primary/10 bg-slate-50/30 dark:bg-slate-900/40 flex flex-col p-4 gap-6 shrink-0 h-full overflow-y-auto hidden lg:flex font-sans ${isSidebarOpen ? 'w-64' : 'w-16 items-center'
      }`}>
      {/* Inner Toggle */}
      <div className={`flex ${isSidebarOpen ? 'justify-start' : 'justify-center'} mb-2`}>
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

      {/* Library */}
      <div className={`space-y-1 w-full ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
        {isSidebarOpen && <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3">라이브러리</h3>}
        <Link
          href={buildHref()}
          className={`flex items-center gap-3 rounded-xl transition-all font-bold ${isSidebarOpen ? 'px-3 py-2.5' : 'p-2 justify-center'
            } ${!currentFolderId && !isTrashActive && filter !== 'shared'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium'
            }`}
          title={!isSidebarOpen ? 'All Cloud' : undefined}
        >
          <span className="material-symbols-outlined text-xl">cloud</span>
          {isSidebarOpen && <span className="text-sm">All Cloud</span>}
        </Link>
        <Link
          href="/notes?filter=shared"
          className={`flex items-center gap-3 rounded-xl transition-all font-bold ${isSidebarOpen ? 'px-3 py-2.5' : 'p-2 justify-center'
            } ${filter === 'shared'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium'
            }`}
          title={!isSidebarOpen ? '공유된 메모' : undefined}
        >
          <span className="material-symbols-outlined text-xl">group</span>
          {isSidebarOpen && <span className="text-sm">공유된 메모</span>}
        </Link>
      </div>

      {/* Folders */}
      <div className={`space-y-1 w-full ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between px-3 mb-3' : 'justify-center mb-1'}`}>
          {isSidebarOpen && <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60">폴더</h3>}
          <button
            onClick={() => setShowFolderInput(true)}
            className="text-primary hover:bg-primary/10 p-1 rounded-lg transition-colors"
            title="새 폴더 만들기"
          >
            <span className="material-symbols-outlined text-sm font-bold">create_new_folder</span>
          </button>
        </div>

        {isSidebarOpen && showFolderInput && (
          <div className="px-3 mb-2 flex gap-1">
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFolder()
                if (e.key === 'Escape') { setShowFolderInput(false); setNewFolderName('') }
              }}
              placeholder="폴더명"
              className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-primary/20 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleCreateFolder}
              disabled={isPending || !newFolderName.trim()}
              className="px-2 py-1 bg-primary text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {isPending ? '...' : '추가'}
            </button>
          </div>
        )}

        {folders.map(folder => (
          <Link
            key={folder.id}
            href={buildHref(folder.id)}
            className={`flex items-center gap-3 rounded-xl transition-all ${isSidebarOpen ? 'px-3 py-2.5' : 'p-2 justify-center'
              } ${currentFolderId === folder.id
                ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                : 'hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium'
              }`}
            title={!isSidebarOpen ? folder.name : undefined}
          >
            <span className="material-symbols-outlined text-xl">folder</span>
            {isSidebarOpen && <span className="text-sm truncate">{folder.name}</span>}
          </Link>
        ))}

        {isSidebarOpen && folders.length === 0 && !showFolderInput && (
          <p className="px-3 text-xs text-slate-400 dark:text-slate-500">폴더가 없습니다.</p>
        )}
      </div>

      {/* Trash */}
      <div className={`mt-auto space-y-1 w-full ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
        <Link
          href="/notes/trash"
          className={`flex items-center gap-3 rounded-xl transition-all font-bold ${isSidebarOpen ? 'px-3 py-2.5' : 'p-2 justify-center'
            } ${isTrashActive
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-500 font-medium'
            }`}
          title={!isSidebarOpen ? '최근 삭제된 항목' : undefined}
        >
          <span className="material-symbols-outlined text-xl">delete</span>
          {isSidebarOpen && <span className="text-sm">최근 삭제된 항목</span>}
        </Link>
      </div>
    </aside>
  )
}
