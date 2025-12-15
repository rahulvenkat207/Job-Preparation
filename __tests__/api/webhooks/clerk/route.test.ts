/**
 * Unit tests for the Clerk webhook API route
 * Tests webhook verification, user.created/updated/deleted events, and error handling
 */

import { POST } from '@/app/api/webhooks/clerk/route'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { upsertUser, deleteUser } from '@/features/users/db'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@clerk/nextjs/webhooks')
jest.mock('@/features/users/db', () => ({
  upsertUser: jest.fn(),
  deleteUser: jest.fn(),
}))

const mockVerifyWebhook = verifyWebhook as jest.MockedFunction<typeof verifyWebhook>
const mockUpsertUser = upsertUser as jest.MockedFunction<typeof upsertUser>
const mockDeleteUser = deleteUser as jest.MockedFunction<typeof deleteUser>

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return 400 for invalid webhook
  it('should return 400 when webhook verification fails', async () => {
    mockVerifyWebhook.mockRejectedValue(new Error('Invalid webhook'))

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Invalid webhook')
    expect(mockVerifyWebhook).toHaveBeenCalled()
  })

  // Test: Should handle user.created event
  it('should handle user.created event and upsert user', async () => {
    const mockEvent = {
      type: 'user.created',
      data: {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        image_url: 'https://example.com/avatar.jpg',
        created_at: 1234567890,
        updated_at: 1234567890,
        primary_email_address_id: 'email-1',
        email_addresses: [
          {
            id: 'email-1',
            email_address: 'john.doe@example.com',
          },
        ],
      },
    }

    mockVerifyWebhook.mockResolvedValue(mockEvent as any)
    mockUpsertUser.mockResolvedValue(undefined)

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBe('Webhook received')
    expect(mockUpsertUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'john.doe@example.com',
      name: 'John Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date(1234567890),
      updatedAt: new Date(1234567890),
    })
  })

  // Test: Should handle user.updated event
  it('should handle user.updated event and upsert user', async () => {
    const mockEvent = {
      type: 'user.updated',
      data: {
        id: 'user-123',
        first_name: 'Jane',
        last_name: 'Smith',
        image_url: 'https://example.com/new-avatar.jpg',
        created_at: 1234567890,
        updated_at: 1234567891,
        primary_email_address_id: 'email-2',
        email_addresses: [
          {
            id: 'email-1',
            email_address: 'old@example.com',
          },
          {
            id: 'email-2',
            email_address: 'jane.smith@example.com',
          },
        ],
      },
    }

    mockVerifyWebhook.mockResolvedValue(mockEvent as any)
    mockUpsertUser.mockResolvedValue(undefined)

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBe('Webhook received')
    expect(mockUpsertUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      imageUrl: 'https://example.com/new-avatar.jpg',
      createdAt: new Date(1234567890),
      updatedAt: new Date(1234567891),
    })
  })

  // Test: Should return 400 when primary email is not found
  it('should return 400 when primary email is not found in user.created event', async () => {
    const mockEvent = {
      type: 'user.created',
      data: {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        image_url: 'https://example.com/avatar.jpg',
        created_at: 1234567890,
        updated_at: 1234567890,
        primary_email_address_id: 'email-999',
        email_addresses: [
          {
            id: 'email-1',
            email_address: 'john.doe@example.com',
          },
        ],
      },
    }

    mockVerifyWebhook.mockResolvedValue(mockEvent as any)

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('No primary email found')
    expect(mockUpsertUser).not.toHaveBeenCalled()
  })

  // Test: Should handle user.deleted event
  it('should handle user.deleted event and delete user', async () => {
    const mockEvent = {
      type: 'user.deleted',
      data: {
        id: 'user-123',
      },
    }

    mockVerifyWebhook.mockResolvedValue(mockEvent as any)
    mockDeleteUser.mockResolvedValue(undefined)

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBe('Webhook received')
    expect(mockDeleteUser).toHaveBeenCalledWith('user-123')
  })

  // Test: Should return 400 when user ID is missing in user.deleted event
  it('should return 400 when user ID is missing in user.deleted event', async () => {
    const mockEvent = {
      type: 'user.deleted',
      data: {
        id: null,
      },
    }

    mockVerifyWebhook.mockResolvedValue(mockEvent as any)

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('No user ID found')
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  // Test: Should handle user with no first or last name
  it('should handle user with no first or last name', async () => {
    const mockEvent = {
      type: 'user.created',
      data: {
        id: 'user-123',
        first_name: null,
        last_name: null,
        image_url: null,
        created_at: 1234567890,
        updated_at: 1234567890,
        primary_email_address_id: 'email-1',
        email_addresses: [
          {
            id: 'email-1',
            email_address: 'user@example.com',
          },
        ],
      },
    }

    mockVerifyWebhook.mockResolvedValue(mockEvent as any)
    mockUpsertUser.mockResolvedValue(undefined)

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBe('Webhook received')
    expect(mockUpsertUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'user@example.com',
      name: 'null null',
      imageUrl: null,
      createdAt: new Date(1234567890),
      updatedAt: new Date(1234567890),
    })
  })

  // Test: Should ignore unknown event types
  it('should ignore unknown event types and return 200', async () => {
    const mockEvent = {
      type: 'session.created',
      data: {},
    }

    mockVerifyWebhook.mockResolvedValue(mockEvent as any)

    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBe('Webhook received')
    expect(mockUpsertUser).not.toHaveBeenCalled()
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })
})

