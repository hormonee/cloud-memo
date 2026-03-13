import { render, screen } from '@testing-library/react'
import React, { Suspense } from 'react'

// Note: The main page.tsx is now a Server Component (async) that requires
// Supabase auth. We test the NoteEditor client component directly.
import NoteEditor from './NoteEditor'
import NotesList from '../NotesList'
import NotesSidebar from '../NotesSidebar'

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}))

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
  useParams: jest.fn(() => ({ id: 'test-note-id' })),
}))

// Mock server actions
jest.mock('../actions', () => ({
  createNote: jest.fn(),
  deleteNote: jest.fn(),
  createFolder: jest.fn(),
  shareNote: jest.fn(),
  unshareNote: jest.fn(),
}))

const renderWithSuspense = (component: React.ReactNode) =>
  render(<Suspense fallback={<div>Loading...</div>}>{component}</Suspense>)

describe('NoteEditor', () => {
  it('renders editor toolbar with formatting buttons', () => {
    renderWithSuspense(
      <NoteEditor
        noteId="test-note-id"
        initialTitle="Project Brainstorm"
        initialContent="<p>Hello world</p>"
        lastUpdated={null}
        canEdit={true}
        collaborators={[]}
      />
    )

    expect(screen.getAllByText('format_bold').length).toBeGreaterThan(0)
    expect(screen.getAllByText('format_italic').length).toBeGreaterThan(0)
    expect(screen.getAllByText('format_underlined').length).toBeGreaterThan(0)
    expect(screen.getByText('share')).toBeInTheDocument()
    expect(screen.getByText('delete')).toBeInTheDocument()
  })

  it('shows read-only indicator for viewer', () => {
    renderWithSuspense(
      <NoteEditor
        noteId="test-note-id"
        initialTitle="읽기 전용 노트"
        initialContent=""
        lastUpdated={null}
        canEdit={false}
        collaborators={[]}
      />
    )

    expect(screen.getByText(/읽기 전용/)).toBeInTheDocument()
  })
})

describe('NotesList', () => {
  it('renders new note button', () => {
    render(
      <NotesList
        notes={[]}
        activeNoteId={undefined}
        folderId={undefined}
      />
    )
    expect(screen.getByText('새 메모')).toBeInTheDocument()
  })

  it('renders note items with title', () => {
    const notes = [
      { id: '1', title: 'Project Brainstorm', content: '<p>Test content</p>', updated_at: new Date().toISOString(), folder_id: null },
    ]
    render(<NotesList notes={notes} activeNoteId="1" folderId={undefined} />)
    expect(screen.getByText('Project Brainstorm')).toBeInTheDocument()
  })

  it('shows empty state when no notes', () => {
    render(<NotesList notes={[]} activeNoteId={undefined} folderId={undefined} />)
    expect(screen.getByText(/메모가 없습니다/)).toBeInTheDocument()
  })
})

describe('NotesSidebar', () => {
  it('renders library section and folder section', () => {
    render(<NotesSidebar folders={[]} currentFolderId={undefined} noteId={undefined} />)
    expect(screen.getByText('라이브러리')).toBeInTheDocument()
    expect(screen.getByText('폴더')).toBeInTheDocument()
    expect(screen.getByText('All Cloud')).toBeInTheDocument()
    expect(screen.getByText('공유 메모')).toBeInTheDocument()
  })

  it('renders user folders', () => {
    const folders = [{ id: 'f1', name: '업무 프로젝트' }]
    render(<NotesSidebar folders={folders} currentFolderId={undefined} noteId={undefined} />)
    expect(screen.getByText('업무 프로젝트')).toBeInTheDocument()
  })
})
