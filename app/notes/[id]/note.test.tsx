import { render, screen, act } from '@testing-library/react'
import NotePage from './page'
import React, { Suspense } from 'react'

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => {
        const queryBuilder: any = {
          eq: jest.fn(() => queryBuilder),
          single: jest.fn(() => Promise.resolve({ data: null, error: new Error('not found') })),
        }
        return queryBuilder
      }),
    })),
  })),
}))

// Mock useRouter & useParams
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({ id: '1' })),
}))

const renderWithSuspense = (component: React.ReactNode) => {
  return render(<Suspense fallback={<div>Loading...</div>}>{component}</Suspense>)
}

describe('Note Editor Page', () => {
  it('renders 3-pane layout components', async () => {
    renderWithSuspense(<NotePage />)
    
    // Pane 1: Library/Folders
    expect(await screen.findByText('라이브러리')).toBeInTheDocument()
    expect(screen.getByText('폴더')).toBeInTheDocument()
    
    // Pane 2: Notes List
    expect(screen.getAllByText('메모').length).toBeGreaterThan(0)
    expect(screen.getByText('새 메모')).toBeInTheDocument()
    
    // Pane 3: Editor surface
    expect(screen.getByPlaceholderText(/Search all notes/i)).toBeInTheDocument()
  })

  it('renders editor toolbar buttons', async () => {
    renderWithSuspense(<NotePage />)
    
    // wait for render
    await screen.findByText('라이브러리')
    
    // Toolbar buttons are rendered as spans inside buttons
    expect(screen.getAllByText('format_bold').length).toBeGreaterThan(0)
    expect(screen.getAllByText('format_italic').length).toBeGreaterThan(0)
  })

  it('displays note title and content', async () => {
    renderWithSuspense(<NotePage />)
    // There are multiple instances of 'Project Brainstorm' (list and editor) once loaded
    const titles = await screen.findAllByText('Project Brainstorm', {}, { timeout: 3000 })
    expect(titles.length).toBeGreaterThan(0)
  })
})
