/**
 * Unit tests for the generate-feedback API route
 * Tests feedback generation functionality, question validation, and permissions
 */

import { POST } from '@/app/api/ai/questions/generate-feedback/route'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser'
import { db } from '@/drizzle/db'
import { generateAiQuestionFeedback } from '@/services/ai/questions'

// Mock dependencies
jest.mock('@/services/clerk/lib/getCurrentUser')
jest.mock('@/drizzle/db', () => ({
  db: {
    query: {
      QuestionTable: {
        findFirst: jest.fn(),
      },
    },
  },
}))
jest.mock('@/services/ai/questions')
jest.mock('next/dist/server/use-cache/cache-tag', () => ({
  cacheTag: jest.fn(),
}))

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockDb = db as jest.Mocked<typeof db>
const mockGenerateAiQuestionFeedback = generateAiQuestionFeedback as jest.MockedFunction<
  typeof generateAiQuestionFeedback
>

describe('POST /api/ai/questions/generate-feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return 400 for invalid request body
  it('should return 400 when request body is invalid', async () => {
    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Error generating your feedback')
  })

  // Test: Should return 400 when prompt is empty
  it('should return 400 when prompt is empty', async () => {
    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ prompt: '', questionId: 'test-id' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Error generating your feedback')
  })

  // Test: Should return 400 when questionId is empty
  it('should return 400 when questionId is empty', async () => {
    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'My answer', questionId: '' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Error generating your feedback')
  })

  // Test: Should return 401 when user is not logged in
  it('should return 401 when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null })

    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'My answer', questionId: 'question-123' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(401)
    expect(text).toBe('You are not logged in')
    expect(mockGetCurrentUser).toHaveBeenCalled()
  })

  // Test: Should return 403 when question does not exist
  it('should return 403 when question does not exist', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })
    mockDb.query.QuestionTable.findFirst.mockResolvedValue(null)

    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'My answer', questionId: 'question-123' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(403)
    expect(text).toBe('You do not have permission to do this')
  })

  // Test: Should return 403 when user does not own the question
  it('should return 403 when user does not own the question', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })
    mockDb.query.QuestionTable.findFirst.mockResolvedValue({
      id: 'question-123',
      text: 'Test question',
      jobInfo: {
        id: 'job-123',
        userId: 'different-user',
      },
    } as any)

    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'My answer', questionId: 'question-123' }),
    })

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(403)
    expect(text).toBe('You do not have permission to do this')
  })

  // Test: Should successfully generate feedback
  it('should successfully generate feedback when all conditions are met', async () => {
    const mockUserId = 'user-123'
    const mockQuestionId = 'question-123'
    const mockQuestion = {
      id: mockQuestionId,
      text: 'What is React?',
      jobInfo: {
        id: 'job-123',
        userId: mockUserId,
      },
    }
    const mockAnswer = 'React is a JavaScript library for building user interfaces.'
    const mockAiResponse = {
      toDataStreamResponse: jest.fn(() => new Response('OK')),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.QuestionTable.findFirst.mockResolvedValue(mockQuestion as any)
    mockGenerateAiQuestionFeedback.mockReturnValue(mockAiResponse as any)

    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ prompt: mockAnswer, questionId: mockQuestionId }),
    })

    const response = await POST(req)

    expect(mockGetCurrentUser).toHaveBeenCalled()
    expect(mockDb.query.QuestionTable.findFirst).toHaveBeenCalled()
    expect(mockGenerateAiQuestionFeedback).toHaveBeenCalledWith({
      question: mockQuestion.text,
      answer: mockAnswer,
    })
    expect(mockAiResponse.toDataStreamResponse).toHaveBeenCalledWith({ sendUsage: false })
  })

  // Test: Should call generateAiQuestionFeedback with correct parameters
  it('should call generateAiQuestionFeedback with correct question and answer', async () => {
    const mockUserId = 'user-123'
    const mockQuestionId = 'question-123'
    const mockQuestion = {
      id: mockQuestionId,
      text: 'Explain closures in JavaScript',
      jobInfo: {
        id: 'job-123',
        userId: mockUserId,
      },
    }
    const mockAnswer = 'Closures are functions that have access to variables in their outer scope.'
    const mockAiResponse = {
      toDataStreamResponse: jest.fn(() => new Response('OK')),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.QuestionTable.findFirst.mockResolvedValue(mockQuestion as any)
    mockGenerateAiQuestionFeedback.mockReturnValue(mockAiResponse as any)

    const req = new Request('http://localhost/api/ai/questions/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ prompt: mockAnswer, questionId: mockQuestionId }),
    })

    await POST(req)

    expect(mockGenerateAiQuestionFeedback).toHaveBeenCalledWith({
      question: 'Explain closures in JavaScript',
      answer: mockAnswer,
    })
  })
})

