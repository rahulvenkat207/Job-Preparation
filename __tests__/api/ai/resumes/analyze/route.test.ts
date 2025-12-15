/**
 * Unit tests for the analyze resume API route
 * Tests file upload validation, size limits, type checking, and resume analysis functionality
 */

import { POST } from '@/app/api/ai/resumes/analyze/route'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser'
import { db } from '@/drizzle/db'
import { analyzeResumeForJob } from '@/services/ai/resumes/ai'

// Mock dependencies
jest.mock('@/services/clerk/lib/getCurrentUser')
jest.mock('@/drizzle/db', () => ({
  db: {
    query: {
      JobInfoTable: {
        findFirst: jest.fn(),
      },
    },
  },
}))
jest.mock('@/services/ai/resumes/ai')
jest.mock('next/dist/server/use-cache/cache-tag', () => ({
  cacheTag: jest.fn(),
}))

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockDb = db as jest.Mocked<typeof db>
const mockAnalyzeResumeForJob = analyzeResumeForJob as jest.MockedFunction<typeof analyzeResumeForJob>

// Helper function to create a Request with FormData that works in tests
function createFormDataRequest(url: string, formData: FormData): Request {
  const req = new Request(url, {
    method: 'POST',
    body: formData,
  })
  // Mock formData() method to return our FormData
  req.formData = jest.fn().mockResolvedValue(formData)
  return req
}

describe('POST /api/ai/resumes/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return 401 when user is not logged in
  it('should return 401 when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null })

    const formData = new FormData()
    formData.append('resumeFile', new File(['content'], 'resume.pdf', { type: 'application/pdf' }))
    formData.append('jobInfoId', 'job-123')

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(401)
    expect(text).toBe('You are not logged in')
    expect(mockGetCurrentUser).toHaveBeenCalled()
  })

  // Test: Should return 400 when resumeFile is missing
  it('should return 400 when resumeFile is missing', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })

    const formData = new FormData()
    formData.append('jobInfoId', 'job-123')

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Invalid request')
  })

  // Test: Should return 400 when jobInfoId is missing
  it('should return 400 when jobInfoId is missing', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })

    const formData = new FormData()
    formData.append('resumeFile', new File(['content'], 'resume.pdf', { type: 'application/pdf' }))

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Invalid request')
  })

  // Test: Should return 400 when file size exceeds 10MB
  it('should return 400 when file size exceeds 10MB limit', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })

    // Create a file larger than 10MB
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const formData = new FormData()
    formData.append('resumeFile', new File([largeContent], 'resume.pdf', { type: 'application/pdf' }))
    formData.append('jobInfoId', 'job-123')

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('File size exceeds 10MB limit')
  })

  // Test: Should return 400 when file type is not allowed
  it('should return 400 when file type is not allowed', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })

    const formData = new FormData()
    formData.append('resumeFile', new File(['content'], 'resume.exe', { type: 'application/x-msdownload' }))
    formData.append('jobInfoId', 'job-123')

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Please upload a PDF, Word document, or text file')
  })

  // Test: Should accept PDF files
  it('should accept PDF files', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const mockAiResponse = {
      toTextStreamResponse: jest.fn(() => new Response('Analysis result')),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockAnalyzeResumeForJob.mockResolvedValue(mockAiResponse as any)

    const formData = new FormData()
    formData.append('resumeFile', new File(['content'], 'resume.pdf', { type: 'application/pdf' }))
    formData.append('jobInfoId', mockJobInfoId)

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockAnalyzeResumeForJob).toHaveBeenCalled()
  })

  // Test: Should accept Word documents
  it('should accept Word documents (.doc and .docx)', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const mockAiResponse = {
      toTextStreamResponse: jest.fn(() => new Response('Analysis result')),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockAnalyzeResumeForJob.mockResolvedValue(mockAiResponse as any)

    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    for (const type of allowedTypes) {
      const formData = new FormData()
      formData.append('resumeFile', new File(['content'], 'resume.doc', { type }))
      formData.append('jobInfoId', mockJobInfoId)

      const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

      const response = await POST(req)

      expect(response.status).toBe(200)
    }
  })

  // Test: Should accept text files
  it('should accept text files', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const mockAiResponse = {
      toTextStreamResponse: jest.fn(() => new Response('Analysis result')),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockAnalyzeResumeForJob.mockResolvedValue(mockAiResponse as any)

    const formData = new FormData()
    formData.append('resumeFile', new File(['content'], 'resume.txt', { type: 'text/plain' }))
    formData.append('jobInfoId', mockJobInfoId)

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockAnalyzeResumeForJob).toHaveBeenCalled()
  })

  // Test: Should return 403 when user does not have permission to access job info
  it('should return 403 when user does not have permission to access job info', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(null)

    const formData = new FormData()
    formData.append('resumeFile', new File(['content'], 'resume.pdf', { type: 'application/pdf' }))
    formData.append('jobInfoId', 'job-123')

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    const response = await POST(req)
    const text = await response.text()

    expect(response.status).toBe(403)
    expect(text).toBe('You do not have permission to do this')
  })

  // Test: Should call analyzeResumeForJob with correct parameters
  it('should call analyzeResumeForJob with correct resume file and job info', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'senior' as const,
    }
    const mockResumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' })
    const mockAiResponse = {
      toTextStreamResponse: jest.fn(() => new Response('Analysis result')),
    }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockAnalyzeResumeForJob.mockResolvedValue(mockAiResponse as any)

    const formData = new FormData()
    formData.append('resumeFile', mockResumeFile)
    formData.append('jobInfoId', mockJobInfoId)

    const req = createFormDataRequest('http://localhost/api/ai/resumes/analyze', formData)

    await POST(req)

    expect(mockAnalyzeResumeForJob).toHaveBeenCalledWith({
      resumeFile: mockResumeFile,
      jobInfo: mockJobInfo,
    })
  })
})

