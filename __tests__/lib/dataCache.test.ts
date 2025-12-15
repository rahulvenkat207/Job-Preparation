/**
 * Unit tests for dataCache utility functions
 * Tests cache tag generation functions: getGlobalTag, getUserTag, getJobInfoTag, and getIdTag
 */

import {
  getGlobalTag,
  getUserTag,
  getJobInfoTag,
  getIdTag,
} from '@/lib/dataCache'

describe('getGlobalTag', () => {
  // Test: Should generate global tag for users
  it('should generate global tag for users', () => {
    const result = getGlobalTag('users')
    expect(result).toBe('global:users')
  })

  // Test: Should generate global tag for jobInfos
  it('should generate global tag for jobInfos', () => {
    const result = getGlobalTag('jobInfos')
    expect(result).toBe('global:jobInfos')
  })

  // Test: Should generate global tag for interviews
  it('should generate global tag for interviews', () => {
    const result = getGlobalTag('interviews')
    expect(result).toBe('global:interviews')
  })

  // Test: Should generate global tag for questions
  it('should generate global tag for questions', () => {
    const result = getGlobalTag('questions')
    expect(result).toBe('global:questions')
  })
})

describe('getUserTag', () => {
  // Test: Should generate user tag with userId
  it('should generate user tag with userId', () => {
    const result = getUserTag('users', 'user-123')
    expect(result).toBe('user:user-123:users')
  })

  // Test: Should generate user tag for different cache types
  it('should generate user tag for different cache types', () => {
    const userId = 'user-123'
    const types: Array<'users' | 'jobInfos' | 'interviews' | 'questions'> = [
      'users',
      'jobInfos',
      'interviews',
      'questions',
    ]

    types.forEach((type) => {
      const result = getUserTag(type, userId)
      expect(result).toBe(`user:${userId}:${type}`)
    })
  })

  // Test: Should handle different userId formats
  it('should handle different userId formats', () => {
    const userIds = ['user-123', 'user_456', 'user789', 'user-abc-def']
    
    userIds.forEach((userId) => {
      const result = getUserTag('users', userId)
      expect(result).toBe(`user:${userId}:users`)
    })
  })
})

describe('getJobInfoTag', () => {
  // Test: Should generate job info tag with jobInfoId
  it('should generate job info tag with jobInfoId', () => {
    const result = getJobInfoTag('questions', 'job-123')
    expect(result).toBe('jobInfo:job-123:questions')
  })

  // Test: Should generate job info tag for different cache types
  it('should generate job info tag for different cache types', () => {
    const jobInfoId = 'job-123'
    const types: Array<'users' | 'jobInfos' | 'interviews' | 'questions'> = [
      'users',
      'jobInfos',
      'interviews',
      'questions',
    ]

    types.forEach((type) => {
      const result = getJobInfoTag(type, jobInfoId)
      expect(result).toBe(`jobInfo:${jobInfoId}:${type}`)
    })
  })

  // Test: Should handle different jobInfoId formats
  it('should handle different jobInfoId formats', () => {
    const jobInfoIds = ['job-123', 'job_456', 'job789', 'job-abc-def']
    
    jobInfoIds.forEach((jobInfoId) => {
      const result = getJobInfoTag('questions', jobInfoId)
      expect(result).toBe(`jobInfo:${jobInfoId}:questions`)
    })
  })
})

describe('getIdTag', () => {
  // Test: Should generate id tag with id
  it('should generate id tag with id', () => {
    const result = getIdTag('questions', 'question-123')
    expect(result).toBe('id:question-123:questions')
  })

  // Test: Should generate id tag for different cache types
  it('should generate id tag for different cache types', () => {
    const id = 'item-123'
    const types: Array<'users' | 'jobInfos' | 'interviews' | 'questions'> = [
      'users',
      'jobInfos',
      'interviews',
      'questions',
    ]

    types.forEach((type) => {
      const result = getIdTag(type, id)
      expect(result).toBe(`id:${id}:${type}`)
    })
  })

  // Test: Should handle different id formats
  it('should handle different id formats', () => {
    const ids = ['item-123', 'item_456', 'item789', 'item-abc-def']
    
    ids.forEach((id) => {
      const result = getIdTag('questions', id)
      expect(result).toBe(`id:${id}:questions`)
    })
  })
})

describe('Cache Tag Consistency', () => {
  // Test: All tag functions should follow consistent format
  it('all tag functions should follow consistent format', () => {
    const testId = 'test-123'
    const testType = 'questions' as const

    const globalTag = getGlobalTag(testType)
    const userTag = getUserTag(testType, testId)
    const jobInfoTag = getJobInfoTag(testType, testId)
    const idTag = getIdTag(testType, testId)

    expect(globalTag).toMatch(/^global:/)
    expect(userTag).toMatch(/^user:.*:/)
    expect(jobInfoTag).toMatch(/^jobInfo:.*:/)
    expect(idTag).toMatch(/^id:.*:/)

    // All should end with the cache type
    expect(globalTag).toContain(`:${testType}`)
    expect(userTag).toContain(`:${testType}`)
    expect(jobInfoTag).toContain(`:${testType}`)
    expect(idTag).toContain(`:${testType}`)
  })
})

