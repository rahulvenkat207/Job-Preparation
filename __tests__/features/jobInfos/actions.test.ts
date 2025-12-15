/**
 * Unit tests for job info server actions
 * Tests createJobInfo and updateJobInfo with validation, authentication, and permissions
 */

import { createJobInfo, updateJobInfo } from '@/features/jobInfos/actions'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser'
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from '@/features/jobInfos/db'
import { db } from '@/drizzle/db'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('@/services/clerk/lib/getCurrentUser')
jest.mock('@/features/jobInfos/db')
jest.mock('@/drizzle/db', () => ({
  db: {
    query: {
      JobInfoTable: {
        findFirst: jest.fn(),
      },
    },
  },
}))
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockInsertJobInfo = insertJobInfo as jest.MockedFunction<typeof insertJobInfo>
const mockUpdateJobInfoDb = updateJobInfoDb as jest.MockedFunction<typeof updateJobInfoDb>
const mockDb = db as jest.Mocked<typeof db>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('createJobInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return error when user is not logged in
  it('should return error when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null })

    const result = await createJobInfo({
      name: 'Test Company',
      title: 'Software Engineer',
      experienceLevel: 'mid-level',
      description: 'Test description',
    })

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
    expect(mockGetCurrentUser).toHaveBeenCalled()
  })

  // Test: Should return error when data is invalid
  it('should return error when data is invalid', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })

    const result = await createJobInfo({
      name: '', // Invalid: empty string
      title: 'Software Engineer',
      experienceLevel: 'mid-level',
      description: 'Test description',
    })

    expect(result).toEqual({
      error: true,
      message: 'Invalid job data',
    })
    expect(mockInsertJobInfo).not.toHaveBeenCalled()
  })

  // Test: Should successfully create job info and redirect
  it('should successfully create job info and redirect', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = { id: mockJobInfoId, userId: mockUserId }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockInsertJobInfo.mockResolvedValue(mockJobInfo)

    const result = await createJobInfo({
      name: 'Test Company',
      title: 'Software Engineer',
      experienceLevel: 'mid-level',
      description: 'Test description',
    })

    expect(mockInsertJobInfo).toHaveBeenCalledWith({
      name: 'Test Company',
      title: 'Software Engineer',
      experienceLevel: 'mid-level',
      description: 'Test description',
      userId: mockUserId,
    })
    expect(mockRedirect).toHaveBeenCalledWith(`/app/job-infos/${mockJobInfoId}`)
  })

  // Test: Should handle nullable title
  it('should handle nullable title', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = { id: mockJobInfoId, userId: mockUserId }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockInsertJobInfo.mockResolvedValue(mockJobInfo)

    await createJobInfo({
      name: 'Test Company',
      title: null,
      experienceLevel: 'junior',
      description: 'Test description',
    })

    expect(mockInsertJobInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: null,
      })
    )
  })
})

describe('updateJobInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should return error when user is not logged in
  it('should return error when user is not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: null })

    const result = await updateJobInfo('job-123', {
      name: 'Updated Company',
      title: 'Senior Engineer',
      experienceLevel: 'senior',
      description: 'Updated description',
    })

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
  })

  // Test: Should return error when data is invalid
  it('should return error when data is invalid', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'user-123' })

    const result = await updateJobInfo('job-123', {
      name: '', // Invalid: empty string
      title: 'Senior Engineer',
      experienceLevel: 'senior',
      description: 'Updated description',
    })

    expect(result).toEqual({
      error: true,
      message: 'Invalid job data',
    })
  })

  // Test: Should return error when job info does not exist
  it('should return error when job info does not exist', async () => {
    const mockUserId = 'user-123'
    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(null)

    const result = await updateJobInfo('job-123', {
      name: 'Updated Company',
      title: 'Senior Engineer',
      experienceLevel: 'senior',
      description: 'Updated description',
    })

    expect(result).toEqual({
      error: true,
      message: "You don't have permission to do this",
    })
  })

  // Test: Should successfully update job info and redirect
  it('should successfully update job info and redirect', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const mockJobInfo = {
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    }
    const updatedJobInfo = { id: mockJobInfoId, userId: mockUserId }

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue(mockJobInfo)
    mockUpdateJobInfoDb.mockResolvedValue(updatedJobInfo)

    const result = await updateJobInfo(mockJobInfoId, {
      name: 'Updated Company',
      title: 'Senior Engineer',
      experienceLevel: 'senior',
      description: 'Updated description',
    })

    expect(mockUpdateJobInfoDb).toHaveBeenCalledWith(mockJobInfoId, {
      name: 'Updated Company',
      title: 'Senior Engineer',
      experienceLevel: 'senior',
      description: 'Updated description',
    })
    expect(mockRedirect).toHaveBeenCalledWith(`/app/job-infos/${mockJobInfoId}`)
  })

  // Test: Should handle all experience levels
  it('should handle all experience levels', async () => {
    const mockUserId = 'user-123'
    const mockJobInfoId = 'job-123'
    const experienceLevels = ['junior', 'mid-level', 'senior'] as const

    mockGetCurrentUser.mockResolvedValue({ userId: mockUserId })
    mockDb.query.JobInfoTable.findFirst.mockResolvedValue({
      id: mockJobInfoId,
      userId: mockUserId,
      title: 'Software Engineer',
      description: 'Test description',
      experienceLevel: 'mid-level' as const,
    })
    mockUpdateJobInfoDb.mockResolvedValue({ id: mockJobInfoId, userId: mockUserId })

    for (const level of experienceLevels) {
      await updateJobInfo(mockJobInfoId, {
        name: 'Test Company',
        title: 'Software Engineer',
        experienceLevel: level,
        description: 'Test description',
      })

      expect(mockUpdateJobInfoDb).toHaveBeenCalledWith(
        mockJobInfoId,
        expect.objectContaining({
          experienceLevel: level,
        })
      )
    }
  })
})

