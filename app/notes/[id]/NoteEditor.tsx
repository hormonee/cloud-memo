'use client'

import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { deleteNote } from '../actions'
import { useNotesLayout } from '../NotesPaneLayout'
import ShareModal from '../ShareModal'

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

interface NoteEditorProps {
  noteId: string
  initialTitle: string
  initialContent: string
  lastUpdated: string | null
  canEdit: boolean
  collaborators: Collaborator[]
  isTrashed?: boolean
}

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  lastUpdated,
  canEdit,
  collaborators,
  isTrashed = false,
}: NoteEditorProps) {
  const { isSidebarOpen } = useNotesLayout()
  const router = useRouter()
  const supabase = createClient()

  const [syncStatus, setSyncStatus] = useState('방금 동기화됨')
  const [lastUpdatedDate, setLastUpdatedDate] = useState<Date | null>(lastUpdated ? new Date(lastUpdated) : null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false)
  const [, startTransition] = useTransition()

  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lastSyncedContent = useRef(initialContent)
  const lastSyncedTitle = useRef(initialTitle)

  // Initialize editor content only when noteId changes or external sync happens
  useEffect(() => {
    if (titleRef.current && titleRef.current.innerText !== initialTitle) {
      titleRef.current.innerText = initialTitle || ''
      lastSyncedTitle.current = initialTitle
    }
    if (contentRef.current && contentRef.current.innerHTML !== initialContent) {
      // Only update if it's an external change (not what we just typed)
      contentRef.current.innerHTML = initialContent || ''
      lastSyncedContent.current = initialContent
    }
  }, [noteId, initialTitle, initialContent])

  const saveNote = useCallback(async () => {
    if (isTrashed) return // Don't save if in trash

    const currentTitle = titleRef.current?.innerText || '제목 없음'
    const currentContent = contentRef.current?.innerHTML || ''

    setSyncStatus('저장 중...')

    const { error } = await supabase
      .from('notes')
      .update({
        title: currentTitle,
        content: currentContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)

    if (error) {
      console.error('saveNote error:', error)
      setSyncStatus('저장 실패')
    } else {
      setSyncStatus('방금 동기화됨')
      setLastUpdatedDate(new Date())
      router.refresh() // Refresh server data (notes list updated_at)
    }
  }, [noteId, supabase, router, isTrashed])

  // Debounced auto-save on input
  const handleInput = useCallback(() => {
    if (isTrashed) return
    setSyncStatus('수정 중...')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveNote()
    }, 1500)
  }, [saveNote, isTrashed])

  // Immediate save on blur
  const handleBlur = useCallback(() => {
    if (isTrashed) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveNote()
  }, [saveNote, isTrashed])

  // Toolbar command helper
  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    contentRef.current?.focus()
  }

  // Insert a code block
  const insertCode = () => {
    const pre = document.createElement('pre')
    pre.className = 'bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm my-4'
    pre.contentEditable = 'true'
    pre.textContent = '// 코드를 입력하세요'
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(pre)
    } else {
      contentRef.current?.appendChild(pre)
    }
  }

  // Move to trash
  const handleDelete = () => {
    setShowDeleteConfirm(false)
    startTransition(async () => {
      const result = await deleteNote(noteId)
      if (!result.error) {
        router.push('/notes')
        router.refresh()
      }
    })
  }

  // Restore from trash
  const handleRestore = () => {
    setShowRestoreConfirm(false)
    startTransition(async () => {
      const { restoreNote } = await import('../actions')
      const result = await restoreNote(noteId)
      if (!result.error) {
        router.push(`/notes/${noteId}`)
        router.refresh()
      }
    })
  }

  // Permanent delete
  const handlePermanentDelete = () => {
    setShowPermanentDeleteConfirm(false)
    startTransition(async () => {
      const { permanentlyDeleteNote } = await import('../actions')
      const result = await permanentlyDeleteNote(noteId)
      if (!result.error) {
        router.push('/notes/trash')
        router.refresh()
      }
    })
  }

  const [dateStr, setDateStr] = useState<string>('')

  useEffect(() => {
    if (lastUpdatedDate) {
      setDateStr(lastUpdatedDate.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    } else {
      setDateStr('날짜 없음')
    }
  }, [lastUpdatedDate])

  const isSyncing = syncStatus === '저장 중...' || syncStatus === '수정 중...'

  return (
    <>
      <section className="flex-1 bg-white dark:bg-slate-900/10 flex flex-col overflow-hidden">
        {/* Editor Toolbar */}
        <div className="px-6 py-3 border-b border-primary/5 flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-50/10 backdrop-blur-sm sticky top-0 z-10 min-h-[57px]">
          {!isTrashed && canEdit && (
            <>
              {/* Text formatting */}
              <div className="flex items-center gap-1 mr-2">
                {[
                  { icon: 'format_bold', cmd: 'bold' },
                  { icon: 'format_italic', cmd: 'italic' },
                  { icon: 'format_underlined', cmd: 'underline' },
                ].map(({ icon, cmd }) => (
                  <button
                    key={icon}
                    onMouseDown={e => { e.preventDefault(); execCmd(cmd) }}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary"
                    title={cmd}
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </button>
                ))}
              </div>

              <div className="w-[1px] h-6 bg-primary/10 mx-1" />

              {/* List formatting */}
              <div className="flex items-center gap-1 mx-2">
                {[
                  { icon: 'format_list_bulleted', cmd: 'insertUnorderedList' },
                  { icon: 'format_list_numbered', cmd: 'insertOrderedList' },
                  { icon: 'checklist', cmd: 'insertUnorderedList' },
                ].map(({ icon, cmd }) => (
                  <button
                    key={icon}
                    onMouseDown={e => { e.preventDefault(); execCmd(cmd) }}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </button>
                ))}
              </div>

              <div className="w-[1px] h-6 bg-primary/10 mx-1" />

              {/* Alignment */}
              <div className="flex items-center gap-1 mx-2">
                {[
                  { icon: 'format_align_left', cmd: 'justifyLeft' },
                  { icon: 'format_align_center', cmd: 'justifyCenter' },
                ].map(({ icon, cmd }) => (
                  <button
                    key={icon}
                    onMouseDown={e => { e.preventDefault(); execCmd(cmd) }}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </button>
                ))}
              </div>

              <div className="w-[1px] h-6 bg-primary/10 mx-1" />

              {/* Media */}
              <div className="flex items-center gap-1 mx-2">
                <button
                  onMouseDown={e => { e.preventDefault(); const url = prompt('이미지 URL을 입력하세요'); if (url) execCmd('insertImage', url) }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">image</span>
                </button>
                <button
                  onMouseDown={e => { e.preventDefault(); const url = prompt('링크 URL을 입력하세요'); if (url) execCmd('createLink', url) }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">link</span>
                </button>
                <button
                  onMouseDown={e => { e.preventDefault(); insertCode() }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">code</span>
                </button>
              </div>
            </>
          )}

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-3">
            {!isTrashed && (
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                syncStatus === '저장 실패'
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'text-slate-400 bg-primary/5 border-primary/5'
              }`}>
                <span className={`material-symbols-outlined text-xs font-black ${isSyncing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                {syncStatus}
              </div>
            )}

            {isTrashed && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800">
                <span className="material-symbols-outlined text-xs font-black">delete</span>
                휴지통에 있음
              </div>
            )}

            <div className="h-6 w-[1px] bg-primary/10" />

            {!isTrashed && canEdit && (
              <>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                  title="공유하기"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </>
            )}

            {isTrashed && (
              <>
                <button
                  onClick={() => setShowRestoreConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">restore_from_trash</span>
                  복원
                </button>
                <button
                  onClick={() => setShowPermanentDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                  영구 삭제
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor Surface */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 max-w-5xl mx-auto w-full custom-scrollbar">
          <div className="mb-10 relative p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/20 border border-primary/10 rounded-2xl shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <div className="text-[10px] text-primary/60 uppercase font-black tracking-[0.2em] mb-4">{dateStr}</div>
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50 focus:outline-none empty:before:content-['제목을_입력하세요'] empty:before:text-slate-300 dark:empty:before:text-slate-600 leading-tight"
              contentEditable={!isTrashed && canEdit}
              suppressContentEditableWarning
              spellCheck={false}
              onInput={handleInput}
              onBlur={handleBlur}
            />
          </div>
          <div
            ref={contentRef}
            className="prose dark:prose-invert prose-slate max-w-none text-lg text-slate-700 dark:text-slate-300 focus:outline-none leading-relaxed empty:before:content-['내용을_입력하세요...'] empty:before:text-slate-300 dark:empty:before:text-slate-600 empty:before:pointer-events-none"
            contentEditable={!isTrashed && canEdit}
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleInput}
            onBlur={handleBlur}
          />
          {!canEdit && (
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">👁️ 이 메모는 읽기 전용입니다. (뷰어 권한)</p>
            </div>
          )}
          {isTrashed && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">🗑️ 이 메모는 휴지통에 있습니다. 수정하려면 먼저 복원하세요.</p>
            </div>
          )}
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          noteId={noteId}
          collaborators={collaborators}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Delete Confirm Modal (Move to Trash) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500">delete</span>
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">메모 삭제</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">정말로 삭제하시겠습니까?</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">삭제된 메모는 휴지통으로 이동됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirm Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">restore_from_trash</span>
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">메모 복원</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">메모를 복원하시겠습니까?</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleRestore}
                className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                복원
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirm Modal */}
      {showPermanentDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500">delete_forever</span>
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">영구 삭제</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">이 작업은 취소할 수 없습니다.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">메모를 영구적으로 삭제하시겠습니까?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPermanentDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                취소
              </button>
              <button
                onClick={handlePermanentDelete}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
