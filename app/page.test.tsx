import { render, screen } from '@testing-library/react'
import Page from './page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(),
}))

// Mock Header and Footer to avoid loading their dependencies (like auth actions)
jest.mock('@/components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-header">Header</div>,
}))

jest.mock('@/components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-footer">Footer</div>,
}))

describe('Landing Page', () => {
  it('renders the main headline', () => {
    render(<Page />)
    expect(screen.getByText(/생각을 담다/i)).toBeInTheDocument()
  })

  it('renders header and footer mocks', () => {
    render(<Page />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument()
  })

  it('renders the feature section cards', () => {
    render(<Page />)
    expect(screen.getByText('실시간 동기화')).toBeInTheDocument()
    expect(screen.getByText('스마트한 정리')).toBeInTheDocument()
    expect(screen.getByText('안전한 보안')).toBeInTheDocument()
  })

  it('renders the main CTA buttons', () => {
    render(<Page />)
    const ctaButtons = screen.getAllByText(/지금 무료 시작/i)
    expect(ctaButtons.length).toBeGreaterThan(0)
  })
})
