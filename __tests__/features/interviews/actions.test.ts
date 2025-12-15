/**
 * Unit tests for interview server actions
 * Tests createInterview, updateInterview, and generateInterviewFeedback with authentication, permissions, and rate limiting
 */

import {
  createInterview,
  updateInterview,
  generateInterviewFeedback,
} from '@/features/interviews/actions'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser'
import { db } from '@/drizzle/db'
import { insertInterview, updateInterview as updateInterviewDb } from '@/features/interviews/db'
import { generateAiInterviewFeedback } from '@/services/ai/interviews'
import arcjet from '@arcjet/next'

// Mock dependencies
jest.mock('@/services/clerk/lib/getCurrentUser')
jest.mock('@/drizzle/db', () => ({
  db: {
    query: {
      JobInfoTable: {
        findFirst: jest.fn(),
      },
      InterviewTable: {
        findFirst: jest.fn(),
      },
    },
  },
}))
jest.mock('@/features/interviews/db')
jest.mock('@/services/ai/interviews')
// Mock Arcjet - use a factory to create the mock function
// Store it in a way that's accessible after hoisting
let mockProtectFn: jest.MockedFunction<any>
jest.mock('@arcjet/next', () => {
  // Create the mock function inside the factory
  const protectMock = jest.fn()
  // Store it globally so we can access it in tests
  ;(global as any).__arcjetMockProtect = protectMock
  return {
    __esModule: true,
    default: jest.fn(() => ({
      protect: protectMock,
    })),
    tokenBucket: jest.fn(),
    request: jest.fn(() => Promise.resolve({})),
  }
})
// Get the mock function - use a getter to ensure it's available
const getMockProtect = () => {
  if (!mockProtectFn) {
    mockProtectFn = (global as any).__arcjetMockProtect
  }
  return mockProtectFn
}

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockDb = db as jest.Mocked<typeof db>
const mockInsertInterview = insertInterview as jest.MockedFunction<typeof insertInterview>
const mockUpdateInterviewDb = updateInterviewDb as jest.MockedFunction<typeof updateInterviewDb>
const mockGenerateAiInterviewFeedback = generateAiInterviewFeedback as jest.MockedFunction<
  typeof generateAiInterviewFeedback
>
const mockArcjet = arcjet as jest.MockedFunction<typeof arcjet>

describe('createInterview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Get and reset mockProtectFn to default (not denied)
    const protectMock = getMockProtect()
    protectMock.mockResolvedValue({
      isDenied: () => false,
    })
  })

  // Test: Should return error when user is not logged in
  it('should return error when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null })

    const result = await createInterview({ jobInfoId: 'job-123' })

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
    expect(mockGetCurrentUser).toHaveBeenCalled()
  })

  // Test: Should return error when rate limited
  it('should return error when rate limited', async () => {
    const mockUserId = 'user-123'
    getMockProtect().mockResolvedValue({
      isDenied: () => true,
    })
    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })

    const result = await createInterview({ jobInfoId: 'job-123' })

    expect(result).toEqual({
      error: true,
      message: 'RATE_LIMIT',
    })
  })

  // Test: Should return error when job info does not exist
  it('should return error when job info does not exist', async () => {
    const mockUserId = 'user-123'
    getMockProtect().mockResolvedValue({
      isDenied: () => false,
    })
    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(null)

    const result = await createInterview({ jobInfoId: 'job-123' })

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
  })

  // Test: Should successfully create interview
  it('should successfully create interview', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const mockInterview = { id: 'interview-123', jobInfoId: mockJobInfoId }
    getMockProtect().mockResolvedValue({
      isDenied: () => false,
    })

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockInsertInterview.mockResolvedValue(mockInterview)

    const result = await createInterview({ jobInfoId: mockJobInfoId })

    expect(result).toEqual({
      error: false,
      id: 'interview-123',
    })
    expect(mockInsertInterview).toHaveBeenCalledWith({
      jobInfoId: mockJobInfoId,
      duration: '00:00:00',
    })
  })
})

describe('updateInterview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return error when user is not logged in
  it('should return error when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null })

    const result = await updateInterview('interview-123', { duration: '01:00:00' })

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
  })

  // Test: Should return error when interview does not exist
  it('should return error when interview does not exist', async () => {
    const mockUserId = 'user-123'
    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.InterviewTable.findFirst.mockResolvedValue(null)

    const result = await updateInterview('interview-123', { duration: '01:00:00' })

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
  })

  // Test: Should successfully update interview
  it('should successfully update interview', async () => {
    const mockUserId = 'user-123'
    const mockInterviewId = 'interview-123'
    const mockInterview = {
      id: mockInterviewId,
      jobInfo: {
        id: 'job-123',
        userId: mockUserId,
        title: 'Software Engineer',
        description: 'Test description',
        experienceLevel: 'mid-level' as const,
      },
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.InterviewTable.findFirst.mockResolvedValue(mockInterview as any)
    mockUpdateInterviewDb.mockResolvedValue({ id: mockInterviewId, jobInfoId: 'job-123' })

    const result = await updateInterview(mockInterviewId, { duration: '01:00:00' })

    expect(result).toEqual({
      error: false,
    })
    expect(mockUpdateInterviewDb).toHaveBeenCalledWith(mockInterviewId, { duration: '01:00:00' })
  })
})

describe('generateInterviewFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return error when user is not logged in
  it('should return error when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null, user: null })

    const result = await generateInterviewFeedback('interview-123')

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
  })

  // Test: Should return error when interview does not exist
  it('should return error when interview does not exist', async () => {
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, name: 'Test User' }
    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId, user: mockUser } as any)
    mockDb.query.InterviewTable.findFirst.mockResolvedValue(null)

    const result = await generateInterviewFeedback('interview-123')

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
  })

  // Test: Should return error when interview has no humeChatId
  it('should return error when interview has no humeChatId', async () => {
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, name: 'Test User' }
    const mockInterview = {
      id: 'interview-123',
      humeChatId: null,
      jobInfo: {
        id: 'job-123',
        userId: mockUserId,
        title: 'Software Engineer',
        description: 'Test description',
        experienceLevel: 'mid-level' as const,
      },
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId, user: mockUser } as any)
    mockDb.query.InterviewTable.findFirst.mockResolvedValue(mockInterview as any)

    const result = await generateInterviewFeedback('interview-123')

    expect(result).toEqual({
      error: true,
      message: 'Interview has not been completed yet',
    })
  })

  // Test: Should successfully generate feedback
  it('should successfully generate feedback', async () => {
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, name: 'Test User' }
    const mockInterviewId = 'interview-123'
    const mockInterview = {
      id: mockInterviewId,
      humeChatId: 'hume-chat-123',
      jobInfo: {
        id: 'job-123',
        userId: mockUserId,
        title: 'Software Engineer',
        description: 'Test description',
        experienceLevel: 'mid-level' as const,
      },
    }
    const mockFeedback = 'Great interview performance!'

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId, user: mockUser } as any)
    mockDb.query.InterviewTable.findFirst.mockResolvedValue(mockInterview as any)
    mockGenerateAiInterviewFeedback.mockResolvedValue(mockFeedback)
    mockUpdateInterviewDb.mockResolvedValue({ id: mockInterviewId, jobInfoId: 'job-123' })

    const result = await generateInterviewFeedback(mockInterviewId)

    expect(result).toEqual({
      error: false,
    })
    expect(mockGenerateAiInterviewFeedback).toHaveBeenCalledWith({
      humeChatId: 'hume-chat-123',
      jobInfo: mockInterview.jobInfo,
      userName: 'Test User',
    })
    expect(mockUpdateInterviewDb).toHaveBeenCalledWith(mockInterviewId, {
      feedback: mockFeedback,
    })
  })

  // Test: Should return error when feedback generation fails
  it('should return error when feedback generation fails', async () => {
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, name: 'Test User' }
    const mockInterview = {
      id: 'interview-123',
      humeChatId: 'hume-chat-123',
      jobInfo: {
        id: 'job-123',
        userId: mockUserId,
        title: 'Software Engineer',
        description: 'Test description',
        experienceLevel: 'mid-level' as const,
      },
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId, user: mockUser } as any)
    mockDb.query.InterviewTable.findFirst.mockResolvedValue(mockInterview as any)
    mockGenerateAiInterviewFeedback.mockResolvedValue(null)

    const result = await generateInterviewFeedback('interview-123')

    expect(result).toEqual({
      error: true,
      message: 'Failed to generate feedback',
    })
  })
})

