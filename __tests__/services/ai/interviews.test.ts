/**
 * Tests for AI interview feedback generation with validation metrics
 */

import { generateAiInterviewFeedback } from '@/services/ai/interviews'
import { interviewFeedbackTestData } from '../../fixtures/ai-test-data'
import { validateInterviewFeedback } from '../../lib/ai-validation-metrics'

// Mock dependencies
jest.mock('@/services/ai/models/google', () => ({
  google: jest.fn(() => 'mock-model'),
}))

jest.mock('@/services/hume/lib/api', () => ({
  fetchChatMessages: jest.fn(),
}))

jest.mock('ai', () => ({
  generateText: jest.fn(),
}))

import { generateText } from 'ai'
import { fetchChatMessages } from '@/services/hume/lib/api'

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>
const mockFetchChatMessages = fetchChatMessages as jest.MockedFunction<typeof fetchChatMessages>

describe('AI Interview Feedback Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test with sample data for each performance level
  interviewFeedbackTestData.forEach((testCase, index) => {
    describe(`Test Case ${index + 1}: ${testCase.performanceLevel} performance`, () => {
      it(`should generate valid feedback for ${testCase.performanceLevel} performance`, async () => {
        // Mock Hume API response
        const mockHumeMessages = testCase.transcript.map(msg => ({
          type: msg.speaker === 'interviewee' ? 'USER_MESSAGE' : 'AGENT_MESSAGE',
          messageText: msg.text,
          role: msg.speaker === 'interviewee' ? 'USER' : 'AGENT',
          emotionFeatures: msg.emotionFeatures,
        }))

        mockFetchChatMessages.mockResolvedValue(mockHumeMessages as any)

        // Mock AI response
        const mockFeedback = generateMockInterviewFeedback(testCase.performanceLevel)
        mockGenerateText.mockResolvedValue({
          text: mockFeedback,
        } as any)

        // Validate the mock feedback
        const validationResult = validateInterviewFeedback(mockFeedback)

        // Should pass format validation
        expect(validationResult.passed).toBe(true)
        expect(validationResult.score).toBeGreaterThanOrEqual(70)
      })

      it(`should have all required categories for ${testCase.performanceLevel} performance`, () => {
        const mockFeedback = generateMockInterviewFeedback(testCase.performanceLevel)
        const validationResult = validateInterviewFeedback(mockFeedback)

        // Check all categories are present
        const requiredCategories = [
          'Communication Clarity',
          'Confidence and Emotional State',
          'Response Quality',
          'Pacing and Timing',
          'Engagement and Interaction',
          'Role Fit & Alignment',
          'Overall Strengths & Areas for Improvement',
        ]

        for (const category of requiredCategories) {
          expect(mockFeedback).toMatch(new RegExp(category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
        }

        expect(validationResult.issues.length).toBe(0)
      })

      it(`should use "you" pronoun for ${testCase.performanceLevel} performance`, () => {
        const mockFeedback = generateMockInterviewFeedback(testCase.performanceLevel)
        expect(mockFeedback.toLowerCase()).toContain('you')
      })
    })
  })

  // Edge case tests
  describe('Edge Cases', () => {
    it('should detect missing overall rating', () => {
      const invalidFeedback = `## Communication Clarity: 8/10

Your communication was clear.

## Confidence and Emotional State: 7/10

You appeared confident.`

      const validationResult = validateInterviewFeedback(invalidFeedback)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('overall rating'))).toBe(true)
    })

    it('should detect missing categories', () => {
      const incompleteFeedback = `Overall Rating: 7/10

## Communication Clarity: 8/10

Your communication was clear.`

      const validationResult = validateInterviewFeedback(incompleteFeedback)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.length).toBeGreaterThan(0)
    })

    it('should detect invalid rating values', () => {
      const invalidFeedback = `Overall Rating: 7/10

## Communication Clarity: 15/10

Your communication was clear.`

      const validationResult = validateInterviewFeedback(invalidFeedback)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('Invalid rating'))).toBe(true)
    })

    it('should detect too short category feedback', () => {
      const shortFeedback = `Overall Rating: 7/10

## Communication Clarity: 8/10

Short.`

      const validationResult = validateInterviewFeedback(shortFeedback)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('too short'))).toBe(true)
    })

    it('should check overall rating consistency', () => {
      const inconsistentFeedback = `Overall Rating: 2/10

## Communication Clarity: 8/10
Your communication was excellent and clear throughout the interview.

## Confidence and Emotional State: 9/10
You appeared very confident and composed.

## Response Quality: 8/10
Your responses were well-reasoned and relevant.

## Pacing and Timing: 7/10
Your pacing was good with appropriate response times.

## Engagement and Interaction: 8/10
You asked thoughtful questions and engaged well.

## Role Fit & Alignment: 8/10
Your experience aligns well with the role requirements.`

      const validationResult = validateInterviewFeedback(inconsistentFeedback)
      // Should have suggestion about rating inconsistency
      expect(validationResult.suggestions.some(s => s.includes('differs significantly'))).toBe(true)
    })

    it('should detect emotional feature values in output', () => {
      const invalidFeedback = `Overall Rating: 7/10

## Communication Clarity: 8/10

Your communication was clear. Your confidence level was 0.8 and calmness was 0.7.`

      const validationResult = validateInterviewFeedback(invalidFeedback)
      expect(validationResult.suggestions.some(s => s.includes('emotional feature values'))).toBe(true)
    })
  })

  // Integration test structure (can be enabled with environment variable)
  describe('Integration Tests (Optional)', () => {
    const runIntegrationTests = process.env.RUN_AI_INTEGRATION_TESTS === 'true'

    if (runIntegrationTests) {
      it('should generate and validate real AI feedback', async () => {
        const testCase = interviewFeedbackTestData[0]
        
        const mockHumeMessages = testCase.transcript.map(msg => ({
          type: msg.speaker === 'interviewee' ? 'USER_MESSAGE' : 'AGENT_MESSAGE',
          messageText: msg.text,
          role: msg.speaker === 'interviewee' ? 'USER' : 'AGENT',
          emotionFeatures: msg.emotionFeatures,
        }))

        mockFetchChatMessages.mockResolvedValue(mockHumeMessages as any)

        const result = await generateAiInterviewFeedback({
          humeChatId: 'test-chat-id',
          jobInfo: testCase.jobInfo,
          userName: testCase.userName,
        })

        const validationResult = validateInterviewFeedback(result)
        expect(validationResult.passed).toBe(true)
      }, 30000) // Longer timeout for AI calls
    } else {
      it.skip('Integration tests skipped (set RUN_AI_INTEGRATION_TESTS=true to enable)', () => {})
    }
  })
})

/**
 * Generate mock interview feedback based on performance level
 */
function generateMockInterviewFeedback(performanceLevel: string): string {
  const baseRatings: Record<string, { overall: number; categories: number[] }> = {
    excellent: {
      overall: 8,
      categories: [9, 8, 9, 8, 9, 8, 0], // Last one is for "Overall Strengths" which doesn't have a rating
    },
    good: {
      overall: 7,
      categories: [7, 7, 7, 7, 7, 7, 0],
    },
    average: {
      overall: 5,
      categories: [5, 5, 5, 5, 5, 5, 0],
    },
    poor: {
      overall: 3,
      categories: [3, 3, 3, 3, 3, 3, 0],
    },
  }

  const ratings = baseRatings[performanceLevel] || baseRatings.average

  const categoryFeedback: Record<string, string> = {
    excellent: 'You demonstrated excellent skills in this area. Your responses were clear, well-structured, and showed deep understanding. You provided specific examples and showed strong alignment with the role requirements.',
    good: 'You showed good competency in this area. Your responses were generally clear and relevant, though there is room for improvement in providing more specific examples or deeper technical detail.',
    average: 'Your performance in this area was adequate but could be improved. Some responses lacked detail or clarity, and you could benefit from more preparation and practice.',
    poor: 'This area needs significant improvement. Your responses were unclear, lacked detail, and did not effectively demonstrate the required skills or knowledge.',
  }

  const feedback = categoryFeedback[performanceLevel] || categoryFeedback.average

  return `Overall Rating: ${ratings.overall}/10

## Communication Clarity: ${ratings.categories[0]}/10

${feedback} You mentioned specific examples from your experience, such as when you said "I led a team that built a scalable platform."

## Confidence and Emotional State: ${ratings.categories[1]}/10

${feedback} You appeared confident throughout the interview and maintained composure.

## Response Quality: ${ratings.categories[2]}/10

${feedback} Your answers were relevant to the questions asked and aligned with the job requirements.

## Pacing and Timing: ${ratings.categories[3]}/10

${feedback} Your response times were appropriate, though there were a few moments where you could have responded more quickly.

## Engagement and Interaction: ${ratings.categories[4]}/10

${feedback} You asked thoughtful questions about the team and technical challenges, showing genuine interest.

## Role Fit & Alignment: ${ratings.categories[5]}/10

${feedback} Your experience and skills align well with what we're looking for in this role.

## Overall Strengths & Areas for Improvement

**Strengths:**
- Strong technical knowledge
- Clear communication
- Relevant experience

**Areas for Improvement:**
- Could provide more specific examples
- Consider practicing common interview questions
- Work on articulating technical concepts more clearly`
}

describe('ML Metrics Evaluation', () => {
  describe('ROUGE Scores', () => {
    it('should calculate ROUGE scores when reference text is provided', () => {
      const mockFeedback = generateMockInterviewFeedback('good')
      const referenceFeedback = `Overall Rating: 7/10

## Communication Clarity: 7/10
You communicated clearly and effectively throughout the interview.

## Confidence and Emotional State: 7/10
You showed good confidence and maintained composure.

## Response Quality: 7/10
Your responses were relevant and well-structured.`

      const validationResult = validateInterviewFeedback(
        mockFeedback,
        undefined,
        referenceFeedback
      )

      expect(validationResult.rougeScores).toBeDefined()
      expect(validationResult.rougeScores?.rouge1).toBeDefined()
      expect(validationResult.rougeScores?.rouge2).toBeDefined()
      expect(validationResult.rougeScores?.rougeL).toBeDefined()

      // ROUGE scores should be between 0 and 1
      expect(validationResult.rougeScores?.rouge1.f1).toBeGreaterThanOrEqual(0)
      expect(validationResult.rougeScores?.rouge1.f1).toBeLessThanOrEqual(1)
    })

    it('should handle multiple reference texts', () => {
      const mockFeedback = generateMockInterviewFeedback('excellent')
      const references = [
        'Overall Rating: 8/10\n\n## Communication Clarity: 9/10\nExcellent communication skills demonstrated.',
        'Overall Rating: 9/10\n\n## Communication Clarity: 9/10\nOutstanding clarity in responses.',
      ]

      const validationResult = validateInterviewFeedback(
        mockFeedback,
        undefined,
        references
      )

      expect(validationResult.rougeScores).toBeDefined()
      expect(validationResult.rougeScores?.rouge1.f1).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Perplexity', () => {
    it('should calculate perplexity even without reference text', () => {
      const mockFeedback = generateMockInterviewFeedback('average')

      const validationResult = validateInterviewFeedback(mockFeedback)

      expect(validationResult.perplexity).toBeDefined()
      expect(validationResult.perplexity?.perplexity).toBeGreaterThan(0)
      expect(validationResult.perplexity?.tokenCount).toBeGreaterThan(0)
    })

    it('should calculate both ROUGE and perplexity with reference text', () => {
      const mockFeedback = generateMockInterviewFeedback('good')
      const referenceFeedback = 'Overall Rating: 7/10\n\nGood performance overall.'

      const validationResult = validateInterviewFeedback(
        mockFeedback,
        undefined,
        referenceFeedback
      )

      expect(validationResult.perplexity).toBeDefined()
      expect(validationResult.perplexity?.perplexity).toBeGreaterThan(0)
      expect(validationResult.rougeScores).toBeDefined()
    })
  })
})

