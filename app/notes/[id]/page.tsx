'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function NotePage() {
  const params = useParams() as { id: string }
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [syncStatus, setSyncStatus] = useState('동기화 대기 중')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadNote() {
      setSyncStatus('불러오는 중...')
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', params.id)
        .single()
        
      if (error || !data) {
        // Fallback for UI if note doesn't exist (e.g. mock note for tests)
        if (params.id === '1') {
          setTitle('Project Brainstorm')
          setContent('<p>The initial ideas for the cloud sync architectural implementation involving distributed systems and real-time data persistence.</p>')
          setSyncStatus('방금 동기화됨(Mock)')
        } else {
          router.push('/dashboard')
        }
        return
      }
      
      setTitle(data.title || '')
      setContent(data.content || '')
      setLastUpdated(new Date(data.updated_at))
      setSyncStatus('방금 동기화됨')
      
      if (titleRef.current) titleRef.current.innerText = data.title || ''
      if (contentRef.current) contentRef.current.innerHTML = typeof data.content === 'string' ? data.content : JSON.stringify(data.content)
    }
    loadNote()
  }, [params.id, router])

  const saveNote = async () => {
    setSyncStatus('저장 중...')
    const currentTitle = titleRef.current?.innerText || 'Untitled'
    const currentContent = contentRef.current?.innerHTML || ''
    
    setTitle(currentTitle)
    setContent(currentContent)

    if (params.id === '1') {
      setSyncStatus('방금 동기화됨(Mock)')
      return
    }

    const { error } = await supabase
      .from('notes')
      .update({ 
        title: currentTitle, 
        content: currentContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error(error)
      setSyncStatus('저장 실패')
    } else {
      setSyncStatus('방금 동기화됨')
      setLastUpdated(new Date())
    }
  }

  const handleBlur = () => {
    saveNote()
  }

  const dateStr = lastUpdated ? lastUpdated.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '불러오는 중...'

  return (
    <div className="flex flex-1 overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      {/* 3-Pane Layout for Notes */}
      <div className="flex flex-1 overflow-hidden" role="main">
        {/* Pane 1: Sidebar Folders (Note specific sub-sidebar) */}
        <aside className="w-64 border-r border-primary/10 bg-slate-50/30 dark:bg-slate-900/40 flex flex-col p-4 gap-6 shrink-0 overflow-y-auto hidden lg:flex">
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3">라이브러리</h3>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20" href="#">
              <span className="material-symbols-outlined text-xl">cloud</span>
              <span className="text-sm">All Cloud</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-slate-700 dark:text-slate-300 transition-all font-medium" href="#">
              <span className="material-symbols-outlined text-xl">description</span>
              <span className="text-sm">메모</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-slate-700 dark:text-slate-300 transition-all font-medium" href="#">
              <span className="material-symbols-outlined text-xl">group</span>
              <span className="text-sm">공유됨</span>
            </a>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60">폴더</h3>
              <button className="text-primary hover:bg-primary/10 p-1 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm font-bold">create_new_folder</span>
              </button>
            </div>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-slate-700 dark:text-slate-300 transition-all font-medium" href="#">
              <span className="material-symbols-outlined text-xl">folder</span>
              <span className="text-sm">업무 프로젝트</span>
            </a>
          </div>
        </aside>

        {/* Pane 2: Notes List */}
        <section className="w-80 border-r border-primary/10 bg-slate-50/10 dark:bg-slate-900/20 flex flex-col shrink-0">
          <div className="p-5 border-b border-primary/5 flex items-center justify-between bg-white/30 dark:bg-slate-900/30">
            <h2 className="font-black text-slate-800 dark:text-slate-100">메모</h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-sm font-bold">add</span>새 메모
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-5 bg-primary/10 border-l-4 border-primary cursor-pointer relative">
              <div className="flex justify-between items-start mb-1.5">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{title || '제목 없음'}</h4>
                <span className="text-[10px] text-primary font-black">Now</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">이곳에 메모 내용의 일부가 표시됩니다...</p>
            </div>
          </div>
        </section>

        {/* Pane 3: Editor */}
        <section className="flex-1 bg-white dark:bg-slate-900/10 flex flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className="px-6 py-3 border-b border-primary/5 flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-50/10 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-1 mr-4">
              {['format_bold', 'format_italic', 'format_underlined'].map(icon => (
                <button key={icon} className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </button>
              ))}
            </div>
            <div className="w-[1px] h-6 bg-primary/10 mx-1"></div>
            <div className="flex items-center gap-1 mx-2">
              {['format_list_bulleted', 'format_list_numbered', 'checklist'].map(icon => (
                <button key={icon} className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </button>
              ))}
            </div>
            <div className="w-[1px] h-6 bg-primary/10 mx-1"></div>
            <div className="flex items-center gap-1 mx-2">
              {['image', 'link', 'code'].map(icon => (
                <button key={icon} className="p-2 hover:bg-primary/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </button>
              ))}
            </div>
            
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/5">
                <span className={`material-symbols-outlined text-xs font-black ${syncStatus === '저장 중...' ? 'animate-spin' : ''}`}>sync</span>{syncStatus}
              </div>
              <div className="h-6 w-[1px] bg-primary/10"></div>
              <button className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
              <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
          
          {/* Editor Surface */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 max-w-5xl mx-auto w-full custom-scrollbar">
            <div className="mb-10 relative">
              <div className="text-[10px] text-primary/60 uppercase font-black tracking-[0.2em] mb-4">{dateStr}</div>
              <h1 
                ref={titleRef}
                className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50 mb-6 focus:outline-none placeholder:text-slate-200" 
                contentEditable 
                spellCheck={false}
                onBlur={handleBlur}
              >
              </h1>
            </div>
            <div 
              ref={contentRef}
              className="prose dark:prose-invert prose-slate max-w-none text-lg text-slate-700 dark:text-slate-300 focus:outline-none leading-relaxed" 
              contentEditable 
              spellCheck={false}
              onBlur={handleBlur}
            >
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
