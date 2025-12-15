/**
 * Unit tests for the generate-question API route
 * Tests POST handler functionality including validation, authentication, permissions, and AI service integration
 */

import { POST } from '@/app/api/ai/questions/generate-question/route'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser'
import { db } from '@/drizzle/db'
import { generateAiQuestion } from '@/services/ai/questions'
import { insertQuestion } from '@/features/questions/db'
import { createDataStreamResponse } from 'ai'

// Mock dependencies
jest.mock('@/services/clerk/lib/getCurrentUser')
jest.mock('@/drizzle/db', () => ({
  db: {
    query: {
      JobInfoTable: {
        findFirst: jest.fn(),
      },
      QuestionTable: {
        findMany: jest.fn(),
      },
    },
  },
}))
jest.mock('@/services/ai/questions')
jest.mock('@/features/questions/db')
jest.mock('ai')
jest.mock('next/dist/server/use-cache/cache-tag', () => ({
  cacheTag: jest.fn(),
}))

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockDb = db as jest.Mocked<typeof db>
const mockGenerateAiQuestion = generateAiQuestion as jest.MockedFunction<typeof generateAiQuestion>
const mockInsertQuestion = insertQuestion as jest.MockedFunction<typeof insertQuestion>
const mockCreateDataStreamResponse = createDataStreamResponse as jest.MockedFunction<typeof createDataStreamResponse>

describe('POST /api/ai/questions/generate-question', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return 400 for invalid request body
  it('should return 400 when request body is invalid', async () => {
    const req = new Request('http://localhost/api/ai/questions/generate-question', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Error generating your question')
  })

  // Test: Should return 400 when prompt is not a valid difficulty
  it('should return 400 when prompt is not a valid difficulty', async () => {
    const req = new Request('http://localhost/api/ai/questions/generate-question', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'invalid', jobInfoId: 'test-id' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Error generating your question')
  })

  // Test: Should return 400 when jobInfoId is empty
  it('should return 400 when jobInfoId is empty', async () => {
    const req = new Request('http://localhost/api/ai/questions/generate-question', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'easy', jobInfoId: '' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Error generating your question')
  })

  // Test: Should return 401 when user is not logged in
  it('should return 401 when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null })

    const req = new Request('http://localhost/api/ai/questions/generate-question', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'easy', jobInfoId: 'test-id' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(401)
    expect(text).toBe('You are not logged in')
    expect(mockGetCurrentUser).toHaveBeenCalled()
  })

  // Test: Should return 403 when user does not have permission to access job info
  it('should return 403 when user does not have permission to access job info', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(null)

    const req = new Request('http://localhost/api/ai/questions/generate-question', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'easy', jobInfoId: 'test-id' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(403)
    expect(text).toBe('You do not have permission to do this')
  })

  // Test: Should successfully generate question and return data stream response
  it('should successfully generate question and return data stream response', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const mockPreviousQuestions = []
    const mockQuestionId = 'question-123'
    const mockDataStream = {
      writeData: jest.fn(),
    }
    const mockAiResponse = {
      mergeIntoDataStream: jest.fn(),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockDb.query.QuestionTable.findMany.mockResolvedValue(mockPreviousQuestions)
    mockInsertQuestion.mockResolvedValue({ id: mockQuestionId, jobInfoId: mockJobInfoId })
    mockGenerateAiQuestion.mockReturnValue(mockAiResponse as any)
    mockCreateDataStreamResponse.mockReturnValue({
      execute: jest.fn(async (callback) => {
        await callback(mockDataStream)
        return new Response('OK')
      }),
    } as any)

    const req = new Request('http://localhost/api/ai/questions/generate-question', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'easy', jobInfoId: mockJobInfoId }),
    })

    const response = await POST(req)

    expect(mockGetCurrentUser).toHaveBeenCalled()
    expect(mockDb.query.JobInfoTable.findFirst).toHaveBeenCalled()
    expect(mockDb.query.QuestionTable.findMany).toHaveBeenCalled()
    expect(mockCreateDataStreamResponse).toHaveBeenCalled()
  })

  // Test: Should call generateAiQuestion with correct parameters
  it('should call generateAiQuestion with correct parameters', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const mockPreviousQuestions = [{ id: 'q1', text: 'Question 1' }]
    const mockQuestionId = 'question-123'
    const mockDataStream = {
      writeData: jest.fn(),
    }
    const mockAiResponse = {
      mergeIntoDataStream: jest.fn(),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockDb.query.QuestionTable.findMany.mockResolvedValue(mockPreviousQuestions)
    mockInsertQuestion.mockResolvedValue({ id: mockQuestionId, jobInfoId: mockJobInfoId })
    mockGenerateAiQuestion.mockReturnValue(mockAiResponse as any)
    // Mock createDataStreamResponse to actually execute the callback
    mockCreateDataStreamResponse.mockImplementation(({ execute }) => {
      // Execute the callback immediately to trigger generateAiQuestion
      execute(mockDataStream).catch(() => {}) // Catch any errors
      return new Response('OK') as any
    })

    const req = new Request('http://localhost/api/ai/questions/generate-question', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'hard', jobInfoId: mockJobInfoId }),
    })

    await POST(req)
    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockGenerateAiQuestion).toHaveBeenCalledWith({
      previousQuestions: mockPreviousQuestions,
      jobInfo: mockJobInfo,
      difficulty: 'hard',
      onFinish: expect.any(Function),
    })
  })

  // Test: Should handle all difficulty levels
  it('should handle all difficulty levels (easy, medium, hard)', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const difficulties = ['easy', 'medium', 'hard'] as const

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockDb.query.QuestionTable.findMany.mockResolvedValue([])
    mockGenerateAiQuestion.mockReturnValue({ mergeIntoDataStream: jest.fn() } as any)
    mockInsertQuestion.mockResolvedValue({ id: 'new-question-id' })
    const mockDataStream = { writeData: jest.fn() }

    for (const difficulty of difficulties) {
      // Mock createDataStreamResponse to actually execute the callback
      mockCreateDataStreamResponse.mockImplementation(({ execute }) => {
        // Execute the callback immediately to trigger generateAiQuestion
        execute(mockDataStream).catch(() => {}) // Catch any errors
        return new Response('OK') as any
      })

      const req = new Request('http://localhost/api/ai/questions/generate-question', {
        method: 'POST',
        body: JSON.stringify({ prompt: difficulty, jobInfoId: mockJobInfoId }),
      })

      await POST(req)
      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockGenerateAiQuestion).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty,
        })
      )
    }
  })
})

