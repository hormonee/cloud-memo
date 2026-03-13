'use client'

import React, { useState, useTransition } from 'react'
import { shareNote, unshareNote } from './actions'

interface Collaborator {
  user_id: string
  role: 'viewer' | 'editor'
  user_profiles: {
    email: string
    nickname: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface ShareModalProps {
  noteId: string
  collaborators: Collaborator[]
  onClose: () => void
}

export default function ShareModal({ noteId, collaborators: initialCollaborators, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'editor'>('editor')
  const [collaborators, setCollaborators] = useState(initialCollaborators)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleShare = () => {
    if (!email.trim()) return
    setError('')
    setSuccess('')

    startTransition(async () => {
      const result = await shareNote(noteId, email, role)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`${email}에게 공유되었습니다.`)
        setEmail('')
      }
    })
  }

  const handleUnshare = (userId: string) => {
    startTransition(async () => {
      const result = await unshareNote(noteId, userId)
      if (!result.error) {
        setCollaborators(prev => prev.filter(c => c.user_id !== userId))
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-primary/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">share</span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">공유하기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        {/* Share input */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">이메일로 공유</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleShare()}
              placeholder="이메일 주소 입력"
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-primary/20 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-slate-400"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'viewer' | 'editor')}
              className="px-3 py-2.5 text-sm rounded-xl border border-primary/20 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="editor">편집자</option>
              <option value="viewer">뷰어</option>
            </select>
          </div>

          <button
            onClick={handleShare}
            disabled={isPending || !email.trim()}
            className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {isPending ? '공유 중...' : '공유하기'}
          </button>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <span className="material-symbols-outlined text-red-500 text-sm">error</span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
            </div>
          )}
        </div>

        {/* Collaborators list */}
        {collaborators.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">공유된 사람</p>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {collaborators.map(collab => {
                const profile = collab.user_profiles
                const displayName = profile?.nickname || profile?.full_name || profile?.email || '알 수 없음'
                const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4F6F52&color=fff&size=40`

                return (
                  <div key={collab.user_id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <img src={avatarUrl} alt={displayName} className="size-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{collab.role === 'editor' ? '편집자' : '뷰어'}</p>
                    </div>
                    <button
                      onClick={() => handleUnshare(collab.user_id)}
                      disabled={isPending}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors text-slate-400"
                      title="공유 해제"
                    >
                      <span className="material-symbols-outlined text-sm">person_remove</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {collaborators.length === 0 && (
          <div className="text-center py-4 text-slate-400">
            <span className="material-symbols-outlined text-3xl mb-1 opacity-40">group_off</span>
            <p className="text-xs">아직 공유된 사람이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
