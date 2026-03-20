/**
 * @jest-environment node
 */
import { processDailySubscriptions } from '../actions'
import { createClient, createAdminClient } from '@/utils/supabase/server'

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
  createAdminClient: jest.fn(),
}))

// Mock fetch for TossPayments API
global.fetch = jest.fn()

describe('processDailySubscriptions', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Create a chainable mock object
    const chain = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    
    mockSupabase = chain
    ;(createClient as any).mockResolvedValue(mockSupabase)
    ;(createAdminClient as any).mockResolvedValue(mockSupabase)
    
    // Default mock response for subscriptions fetch
    chain.lte.mockResolvedValue({ data: [], error: null })
    chain.eq.mockReturnThis() 
  })

  it('should process active subscriptions due for billing today', async () => {
    const mockSubscriptions = [
      {
        user_id: 'user1',
        customer_key: 'cust1',
        billing_key: 'bill1',
        next_billing_date: new Date().toISOString(),
        user_profiles: { email: 'user1@test.com' }
      },
    ]

    mockSupabase.lte.mockResolvedValue({ data: mockSubscriptions, error: null })

    // Mock successful Toss payment
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ paymentKey: 'pay1' }),
    })

    const result = await processDailySubscriptions()

    expect(result.processed).toBe(1)
    expect(result.successCount).toBe(1)
    expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('bill1'),
      expect.any(Object)
    )
  })

  it('should handle failures for individual subscriptions and update status', async () => {
    const mockSubscriptions = [
      {
        user_id: 'user2',
        customer_key: 'cust2',
        billing_key: 'bill2',
        next_billing_date: new Date().toISOString(),
        user_profiles: { email: 'user2@test.com' }
      },
    ]

    mockSupabase.lte.mockResolvedValue({ data: mockSubscriptions, error: null })

    // Mock failed Toss payment
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Insufficient funds' }),
    })

    const result = await processDailySubscriptions()

    expect(result.processed).toBe(1)
    expect(result.successCount).toBe(0)
    expect(result.failedCount).toBe(1)
    
    // Should update payment log to FAILED
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user2',
      status: 'PENDING'
    }))
  })
})
