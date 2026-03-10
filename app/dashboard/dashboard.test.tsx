import { render, screen } from '@testing-library/react'
import DashboardPage from './page'
import DashboardLayout from './layout'

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-1', email: 'test@example.com' } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => {
        const queryBuilder: any = {
          eq: jest.fn(() => queryBuilder),
          order: jest.fn(() => queryBuilder),
          limit: jest.fn(() => Promise.resolve({ data: [] })),
          single: jest.fn(() => Promise.resolve({ data: { nickname: 'Alex Rivera', plan_type: 'pro', created_at: new Date().toISOString() } })),
        }
        return queryBuilder
      }),
    })),
  })),
}))

// React 18 async component workaround for testing
async function renderAsyncComponent(Component: any, props: any = {}) {
  const jsx = await Component(props)
  return render(jsx)
}

describe('Dashboard Page', () => {
  it('renders welcome message with user name', async () => {
    await renderAsyncComponent(DashboardPage)
    expect(screen.getByText(/반가워요/i)).toBeInTheDocument()
  })

  it('renders status cards', async () => {
    await renderAsyncComponent(DashboardPage)
    expect(screen.getByText(/프로페셔널 플랜/i)).toBeInTheDocument()
    expect(screen.getByText('이달의 사용량')).toBeInTheDocument()
  })

  it('renders recent activity section', async () => {
    await renderAsyncComponent(DashboardPage)
    expect(screen.getByText('최근 활동')).toBeInTheDocument()
  })

  it('renders footer statistics', async () => {
    await renderAsyncComponent(DashboardPage)
    expect(screen.getByText('전체 메모')).toBeInTheDocument()
  })
})

describe('Dashboard Layout', () => {
  it('renders sidebar navigation items', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )
    expect(screen.getByText('대시보드')).toBeInTheDocument()
    expect(screen.getByText('모든 메모')).toBeInTheDocument()
    expect(screen.getByText('설정')).toBeInTheDocument()
  })

  it('renders storage usage info', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )
    expect(screen.getByText('저장공간 사용량')).toBeInTheDocument()
  })
})
