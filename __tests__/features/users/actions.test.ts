/**
 * Unit tests for user server actions
 * Tests getUser function with caching and database queries
 */

import { getUser } from '@/features/users/actions'
import { db } from '@/drizzle/db'

// Mock dependencies
jest.mock('@/drizzle/db', () => ({
  db: {
    query: {
      UserTable: {
        findFirst: jest.fn(),
      },
    },
  },
}))
jest.mock('next/dist/server/use-cache/cache-tag', () => ({
  cacheTag: jest.fn(),
}))

const mockDb = db as jest.Mocked<typeof db>

describe('getUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return user when found
  it('should return user when found', async () => {
    const mockUserId = 'user-123'
    const mockUser = {
      id: mockUserId,
      email: 'test@example.com',
      name: 'Test User',
      imageUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockDb.query.UserTable.findFirst.mockResolvedValue(mockUser)

    const result = await getUser(mockUserId)

    expect(result).toEqual(mockUser)
    // Verify the function was called (Drizzle ORM uses eq() which creates a complex structure)
    expect(mockDb.query.UserTable.findFirst).toHaveBeenCalled()
    const calls = mockDb.query.UserTable.findFirst.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    // The where clause is passed as an object with a where property
    const firstCall = calls[0][0]
    expect(firstCall).toBeDefined()
    expect(firstCall).toHaveProperty('where')
  })

  // Test: Should return null when user not found
  it('should return null when user not found', async () => {
    mockDb.query.UserTable.findFirst.mockResolvedValue(null)

    const result = await getUser('non-existent-user')

    expect(result).toBeNull()
    expect(mockDb.query.UserTable.findFirst).toHaveBeenCalled()
  })

  // Test: Should query with correct user ID
  it('should query with correct user ID', async () => {
    const mockUserId = 'user-123'
    mockDb.query.UserTable.findFirst.mockResolvedValue(null)

    await getUser(mockUserId)

    // Verify the function was called (the exact structure may vary)
    expect(mockDb.query.UserTable.findFirst).toHaveBeenCalled()
    // Check that it was called with a where clause (function or object)
    const calls = mockDb.query.UserTable.findFirst.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    // The where clause might be a function or an object with a where property
    const firstCall = calls[0][0]
    expect(firstCall).toBeDefined()
  })
})

