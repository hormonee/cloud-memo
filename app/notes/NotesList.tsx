'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createNote } from './actions'

interface NoteItem {
  id: string
  title: string
  content: string | null
  updated_at: string
  folder_id: string | null
}

interface NotesListProps {
  notes: NoteItem[]
  activeNoteId?: string
  folderId?: string
  isTrashView?: boolean
}

export default function NotesList({ notes, activeNoteId, folderId, isTrashView = false }: NotesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  const currentUrlFolder = searchParams.get('folder')

  const [isPending, startTransition] = useTransition()

  const handleCreateNote = () => {
    startTransition(async () => {
      const result = await createNote(folderId)
      if (result && 'id' in result) {
        let url = `/notes/${result.id}`
        if (filter) url += `?filter=${filter}`
        else if (currentUrlFolder) url += `?folder=${currentUrlFolder}`
        router.push(url)
      } else if (result && 'error' in result) {
        console.error('Note creation failed:', result.error)
      }
    })
  }

  const getPreview = (content: string | null) => {
    if (!content) return '내용 없음'
    // Strip HTML tags and entities for preview
    const stripped = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
    return stripped.slice(0, 80) || '내용 없음'
  }

  const getTimeLabel = (updatedAt: string) => {
    const now = new Date()
    const updated = new Date(updatedAt)
    const diffMs = now.getTime() - updated.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return '방금'
    if (diffMin < 60) return `${diffMin}분 전`
    if (diffHr < 24) return `${diffHr}시간 전`
    if (diffDay < 7) return `${diffDay}일 전`
    return updated.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const buildNoteHref = (noteId: string) => {
    let url = `/notes/${noteId}`
    const params = new URLSearchParams()
    if (filter) params.set('filter', filter)
    else if (isTrashView) params.set('filter', 'trash')
    
    if (currentUrlFolder) params.set('folder', currentUrlFolder)
    
    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  return (
    <section className="w-80 border-r border-primary/10 bg-slate-50/10 dark:bg-slate-900/20 flex flex-col shrink-0">
      <div className="p-5 border-b border-primary/5 flex items-center justify-between bg-white/30 dark:bg-slate-900/30">
        <h2 className="font-black text-slate-800 dark:text-slate-100">메모</h2>
        <button
          onClick={handleCreateNote}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20"
        >
          {isPending ? (
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-sm font-bold">add</span>
          )}
          새 메모
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">note_stack</span>
            <p className="text-sm font-medium">메모가 없습니다.</p>
            <p className="text-xs mt-1 opacity-70">위의 "새 메모" 버튼을 눌러 시작하세요.</p>
          </div>
        ) : (
          notes.map(note => {
            const isActive = note.id === activeNoteId
            return (
              <Link
                key={note.id}
                href={buildNoteHref(note.id)}
                className={`block p-5 cursor-pointer relative transition-all ${
                  isActive
                    ? 'bg-primary/10 border-l-4 border-primary'
                    : 'border-l-4 border-transparent hover:bg-primary/5 hover:border-primary/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className={`font-bold truncate pr-2 ${isActive ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>
                    {note.title || '제목 없음'}
                  </h4>
                  <span className={`text-[10px] font-black shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {getTimeLabel(note.updated_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {getPreview(note.content)}
                </p>
              </Link>
            )
          })
        )}
      </div>
    </section>
  )
}
