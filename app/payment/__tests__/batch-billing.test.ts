/**
 * @jest-environment node
 */
import { processDailySubscriptions } from '../actions'
import { createClient, createAdminClient } from '@/utils/supabase/server'

// Mock the module
jest.mock('@/utils/supabase/server')

// Mock fetch
global.fetch = jest.fn()

describe('processDailySubscriptions', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { nickname: 'Alex' }, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    }

    // Always return the mockSupabase
    ;(createClient as jest.Mock).mockImplementation(() => Promise.resolve(mockSupabase))
    ;(createAdminClient as jest.Mock).mockImplementation(() => Promise.resolve(mockSupabase))
    
    // Default fetch mock
    ;(global.fetch as any).mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ paymentKey: 'pay' }),
    }))
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

    mockSupabase.lte.mockResolvedValueOnce({ data: mockSubscriptions, error: null })

    const result = await processDailySubscriptions()

    expect(result.processed).toBe(1)
    expect(result.successCount).toBe(1)
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

    mockSupabase.lte.mockResolvedValueOnce({ data: mockSubscriptions, error: null })

    // Mock failed Toss payment
    ;(global.fetch as any).mockImplementation(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ message: 'Insufficient funds' }),
    }))

    const result = await processDailySubscriptions()

    expect(result.processed).toBe(1)
    expect(result.failedCount).toBe(1)
  })
})
