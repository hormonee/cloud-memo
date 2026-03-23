import { render, screen } from '@testing-library/react'
import DashboardPage from './page'
import DashboardLayout from './layout'

// Mock everything that could cause server-only or load-time errors
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
  redirect: jest.fn(),
}))

jest.mock('@/components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-header">Header</div>,
}))

jest.mock('@/components/Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}))

jest.mock('@/components/SidebarContext', () => ({
  useSidebar: jest.fn(() => ({ isSidebarOpen: true, toggleSidebar: jest.fn() })),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/utils/supabase/server', () => {
  const mockQueryBuilder: any = {
    eq: jest.fn(() => mockQueryBuilder),
    in: jest.fn(() => mockQueryBuilder),
    order: jest.fn(() => mockQueryBuilder),
    limit: jest.fn(() => Promise.resolve({ data: [], count: 0 })),
    single: jest.fn(() => Promise.resolve({ data: { nickname: 'Alex', plan_type: 'pro', created_at: new Date().toISOString() } })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null })),
    select: jest.fn(() => mockQueryBuilder),
  };

  return {
    createClient: jest.fn(() => Promise.resolve({
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'u1', email: 'test@example.com' } } })) },
      from: jest.fn(() => mockQueryBuilder),
    })),
  };
})

// Async render helper
async function renderAsync(Component: any, props: any = {}) {
  const jsx = await Component(props)
  return render(jsx)
}

describe('Dashboard', () => {
  it('renders dashboard page content', async () => {
    await renderAsync(DashboardPage)
    expect(screen.getByText(/반가워요/i)).toBeInTheDocument()
  })

  it('renders dashboard layout mocks', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
  })
})
