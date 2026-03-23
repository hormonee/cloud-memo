import { render, screen } from '@testing-library/react'
import React, { Suspense } from 'react'
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

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
  useParams: jest.fn(() => ({ id: 'test-note-id' })),
  usePathname: jest.fn(() => '/notes/test-note-id'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => null)
  })),
}))

// Mock server actions
jest.mock('../actions', () => ({
  createNote: jest.fn(),
  deleteNote: jest.fn(),
  createFolder: jest.fn(),
  shareNote: jest.fn(),
  unshareNote: jest.fn(),
}))

// Mock NotesPaneLayout context
jest.mock('../NotesPaneLayout', () => ({
  useNotesLayout: jest.fn(() => ({
    isSidebarOpen: true,
    toggleSidebar: jest.fn(),
  })),
}))

const renderWithSuspense = (component: React.ReactNode) =>
  render(<Suspense fallback={<div>Loading...</div>}>{component}</Suspense>)

describe('NoteEditor', () => {
  it('renders editor toolbar icons', () => {
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

    // Check for the existence of some material icons text
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
})

describe('NotesSidebar', () => {
  it('renders library and folder sections', () => {
    render(<NotesSidebar folders={[]} currentFolderId={undefined} noteId={undefined} />)
    expect(screen.getByText('라이브러리')).toBeInTheDocument()
    expect(screen.getByText('폴더')).toBeInTheDocument()
  })
})
