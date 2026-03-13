'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'

interface NotesLayoutContextType {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

const NotesLayoutContext = createContext<NotesLayoutContextType | undefined>(undefined)

export const useNotesLayout = () => {
  const context = useContext(NotesLayoutContext)
  if (!context) throw new Error('useNotesLayout must be used within NotesPaneLayout')
  return context
}

interface NotesPaneLayoutProps {
  sidebar: React.ReactNode
  list: React.ReactNode
  editor: React.ReactNode
}

export default function NotesPaneLayout({ sidebar, list, editor }: NotesPaneLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const savedState = localStorage.getItem('notes-sidebar-open')
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true')
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    localStorage.setItem('notes-sidebar-open', String(newState))
  }

  return (
    <NotesLayoutContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className="flex flex-1 overflow-hidden h-full relative">
        {/* Pane 1: Sidebar (Folders) */}
        <div 
          className={`transition-all duration-300 ease-in-out h-full overflow-hidden border-r border-primary/10 bg-slate-50/30 dark:bg-slate-900/40 relative ${
            isSidebarOpen ? 'w-64 opacity-100' : 'w-16 opacity-100'
          }`}
        >
          <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} h-full transition-all duration-300`}>
            {sidebar}
          </div>
        </div>

        {/* Pane 2: Notes List */}
        <div className="w-80 flex-shrink-0 border-r border-primary/10">
          {list}
        </div>

        {/* Pane 3: Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {editor}
        </div>
      </div>
    </NotesLayoutContext.Provider>
  )
}
