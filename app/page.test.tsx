import { render, screen } from '@testing-library/react'
import Page from './page'

describe('Landing Page', () => {
  it('renders the main headline', () => {
    render(<Page />)
    const headlinePart = screen.getByText(/생각을 담다/i)
    expect(headlinePart).toBeInTheDocument()
  })

  it('renders the brand logo name', () => {
    render(<Page />)
    const logoName = screen.getAllByText(/Cloud Memo/i)
    expect(logoName.length).toBeGreaterThan(0)
  })

  it('renders "시작하기" button in the navigation', () => {
    render(<Page />)
    const startButtons = screen.getAllByText('시작하기')
    expect(startButtons.length).toBeGreaterThan(0)
  })

  it('renders the feature section cards', () => {
    render(<Page />)
    expect(screen.getByText('실시간 동기화')).toBeInTheDocument()
    expect(screen.getByText('스마트한 정리')).toBeInTheDocument()
    expect(screen.getByText('안전한 보안')).toBeInTheDocument()
  })

  it('renders the main CTA button in hero section', () => {
    render(<Page />)
    const heroCta = screen.getByText('무료로 시작하기')
    expect(heroCta).toBeInTheDocument()
  })
})
