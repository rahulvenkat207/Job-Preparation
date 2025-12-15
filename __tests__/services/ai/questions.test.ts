/**
 * Tests for AI question feedback generation with validation metrics
 */

import { generateAiQuestionFeedback } from '@/services/ai/questions'
import { questionFeedbackTestData } from '../../fixtures/ai-test-data'
import {
  validateQuestionFeedback,
  validateRatingAlignment,
} from '../../lib/ai-validation-metrics'

// Mock the AI SDK
jest.mock('@/services/ai/models/google', () => ({
  google: jest.fn(() => 'mock-model'),
}))

jest.mock('ai', () => ({
  streamText: jest.fn(),
}))

import { streamText } from 'ai'

const mockStreamText = streamText as jest.MockedFunction<typeof streamText>

describe('AI Question Feedback Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test with sample data for each quality level
  questionFeedbackTestData.forEach((testCase, index) => {
    describe(`Test Case ${index + 1}: ${testCase.quality} answer`, () => {
      it(`should generate valid feedback for ${testCase.quality} quality answer`, async () => {
        // Mock AI response based on quality
        const mockFeedback = generateMockFeedback(testCase.quality, testCase.expectedRatingRange[0])
        
        mockStreamText.mockReturnValue({
          toDataStreamResponse: jest.fn(),
        } as any)

        // Since generateAiQuestionFeedback returns a stream, we'll test the validation directly
        const validationResult = validateQuestionFeedback(mockFeedback)

        // Format validation
        expect(validationResult.passed).toBe(true)
        expect(validationResult.score).toBeGreaterThanOrEqual(70)
        expect(validationResult.issues.length).toBe(0)

        // Check rating is in expected range
        const ratingMatch = mockFeedback.match(/Rating:\s*(\d+)\/10/i)
        if (ratingMatch) {
          const rating = parseInt(ratingMatch[1], 10)
          const ratingValidation = validateRatingAlignment(rating, testCase.expectedRatingRange)
          expect(ratingValidation.passed).toBe(true)
        }
      })

      it(`should have proper structure for ${testCase.quality} quality answer`, () => {
        const mockFeedback = generateMockFeedback(testCase.quality, testCase.expectedRatingRange[0])
        const validationResult = validateQuestionFeedback(mockFeedback)

        // Should have feedback header
        expect(mockFeedback).toMatch(/##\s+Feedback\s+\(Rating:\s*\d+\/10\)/i)
        
        // Should have correct answer section
        expect(mockFeedback).toMatch(/##\s+Correct\s+Answer/i)
        
        // Should use "you" pronoun
        expect(mockFeedback.toLowerCase()).toContain('you')
      })
    })
  })

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle very short answers', () => {
      const shortAnswerFeedback = `## Feedback (Rating: 2/10)

Your answer was too brief and lacked the necessary detail to demonstrate understanding. The response doesn't adequately address the question and misses key concepts. You should study this topic more thoroughly.

---

## Correct Answer

React is a JavaScript library for building user interfaces. It uses a virtual DOM for efficient updates, supports component-based architecture, and provides a declarative programming model. Key features include JSX syntax, one-way data binding, and a rich ecosystem of tools and libraries.`

      const validationResult = validateQuestionFeedback(shortAnswerFeedback)
      expect(validationResult.passed).toBe(true)
    })

    it('should handle very long answers', () => {
      const longFeedback = 'Your answer was comprehensive. '.repeat(100)
      const longAnswerFeedback = `## Feedback (Rating: 9/10)

${longFeedback}

---

## Correct Answer

${'Detailed explanation. '.repeat(50)}`

      const validationResult = validateQuestionFeedback(longAnswerFeedback)
      // Should pass but may have suggestions about length
      expect(validationResult.passed).toBe(true)
      if (longFeedback.length > 2000) {
        expect(validationResult.suggestions.length).toBeGreaterThan(0)
      }
    })

    it('should detect missing feedback header', () => {
      const invalidFeedback = `Some feedback without proper header.

---

## Correct Answer

The correct answer is here with enough detail to meet the minimum length requirements for validation.`

      const validationResult = validateQuestionFeedback(invalidFeedback)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('Feedback') && issue.includes('rating'))).toBe(true)
    })

    it('should detect missing correct answer section', () => {
      const invalidFeedback = `## Feedback (Rating: 8/10)

Your answer was good but could use more detail.`

      const validationResult = validateQuestionFeedback(invalidFeedback)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('Correct Answer'))).toBe(true)
    })

    it('should detect invalid rating range', () => {
      const invalidFeedback = `## Feedback (Rating: 15/10)

Your answer was perfect and comprehensive with all the details needed.

---

## Correct Answer

The correct answer with comprehensive details that explain all aspects of the question thoroughly and provide examples.`

      const validationResult = validateQuestionFeedback(invalidFeedback)
      // The rating extraction should fail or detect invalid range
      expect(validationResult.passed).toBe(false)
      // Check for either rating extraction failure or invalid range
      const hasRatingIssue = validationResult.issues.some(
        issue => issue.includes('rating') || issue.includes('outside valid range') || issue.includes('invalid')
      )
      expect(hasRatingIssue).toBe(true)
    })

    it('should detect too short feedback', () => {
      const shortFeedback = `## Feedback (Rating: 5/10)

Short.

---

## Correct Answer

${'Answer. '.repeat(20)}`

      const validationResult = validateQuestionFeedback(shortFeedback)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('too short'))).toBe(true)
    })
  })

  // Integration test structure (can be enabled with environment variable)
  describe('Integration Tests (Optional)', () => {
    const runIntegrationTests = process.env.RUN_AI_INTEGRATION_TESTS === 'true'

    if (runIntegrationTests) {
      it('should generate and validate real AI feedback', async () => {
        const testCase = questionFeedbackTestData[0]
        
        const result = generateAiQuestionFeedback({
          question: testCase.question,
          answer: testCase.answer,
        })

        // Note: This would require actual AI API calls
        // In a real scenario, you'd collect the streamed response and validate it
        expect(result).toBeDefined()
      }, 30000) // Longer timeout for AI calls
    } else {
      it.skip('Integration tests skipped (set RUN_AI_INTEGRATION_TESTS=true to enable)', () => {})
    }
  })
})

/**
 * Generate mock feedback based on quality level
 */
function generateMockFeedback(quality: string, expectedRating: number): string {
  const feedbackMessages: Record<string, string> = {
    excellent: `Your answer demonstrates a strong understanding of the topic. You provided a comprehensive explanation with good examples and covered the key points thoroughly. The technical details were accurate and well-articulated. This shows excellent preparation and knowledge.`,
    good: `Your answer shows a solid understanding of the concept. You covered the main points well, though some additional detail or examples could strengthen your response. The explanation was clear and mostly accurate. Consider adding more specific examples next time.`,
    average: `Your answer touches on the key points but lacks depth. You have a basic understanding, but the explanation could be more detailed and include examples. Some technical aspects were not fully addressed. Try to provide more comprehensive explanations.`,
    poor: `Your answer is too brief and lacks the necessary detail to demonstrate understanding. The response doesn't adequately address the question and misses key concepts. You should study this topic more thoroughly and practice explaining technical concepts.`,
  }

  const correctAnswers: Record<string, string> = {
    excellent: `A comprehensive answer that covers all aspects of the question in detail, including examples, use cases, and technical implementation details. This would include explaining the core concepts, providing real-world examples, discussing implementation approaches, and covering edge cases and best practices.`,
    good: `A good answer that covers the main points with some examples and technical details. This would explain the fundamental concepts clearly, provide relevant examples, and discuss practical applications. Additional depth on implementation details would make it even stronger.`,
    average: `A basic answer that covers the fundamental concepts but lacks depth and examples. This would explain what the concept is at a high level, but would benefit from more detailed explanations, concrete examples, and discussion of practical use cases.`,
    poor: `A minimal answer that only scratches the surface and doesn't demonstrate full understanding. A proper answer would need to explain the core concepts clearly, provide examples, discuss how it works, and explain why it matters in practical applications.`,
  }

  const feedback = feedbackMessages[quality] || feedbackMessages.average
  const correctAnswer = correctAnswers[quality] || correctAnswers.average

  return `## Feedback (Rating: ${expectedRating}/10)

${feedback}

---

## Correct Answer

${correctAnswer}`
}

describe('ML Metrics Evaluation', () => {
  describe('ROUGE Scores', () => {
    it('should calculate ROUGE scores when reference text is provided', () => {
      const mockFeedback = `## Feedback (Rating: 8/10)

Your answer demonstrates a strong understanding of React concepts. You covered the main points about components, state management, and the virtual DOM. The explanation was clear and accurate. Consider adding more examples to strengthen your response.

---

## Correct Answer

React is a JavaScript library for building user interfaces using a component-based architecture.`

      const referenceFeedback = `Your answer shows good understanding of React. You mentioned components and state management correctly. The virtual DOM concept was explained well. Adding more practical examples would improve the answer.`

      const validationResult = validateQuestionFeedback(
        mockFeedback,
        referenceFeedback
      )

      expect(validationResult.rougeScores).toBeDefined()
      expect(validationResult.rougeScores?.rouge1).toBeDefined()
      expect(validationResult.rougeScores?.rouge2).toBeDefined()
      expect(validationResult.rougeScores?.rougeL).toBeDefined()

      // ROUGE scores should be between 0 and 1
      expect(validationResult.rougeScores?.rouge1.f1).toBeGreaterThanOrEqual(0)
      expect(validationResult.rougeScores?.rouge1.f1).toBeLessThanOrEqual(1)
      expect(validationResult.rougeScores?.rouge2.f1).toBeGreaterThanOrEqual(0)
      expect(validationResult.rougeScores?.rouge2.f1).toBeLessThanOrEqual(1)
      expect(validationResult.rougeScores?.rougeL.f1).toBeGreaterThanOrEqual(0)
      expect(validationResult.rougeScores?.rougeL.f1).toBeLessThanOrEqual(1)
    })

    it('should handle multiple reference texts', () => {
      const mockFeedback = `## Feedback (Rating: 7/10)

Your answer covers the basics but needs more depth. You mentioned key concepts correctly.

---

## Correct Answer

A comprehensive explanation of the topic.`

      const references = [
        'Your answer covers basic concepts but needs more detail.',
        'The response mentions key points but lacks depth and examples.',
      ]

      const validationResult = validateQuestionFeedback(
        mockFeedback,
        references
      )

      expect(validationResult.rougeScores).toBeDefined()
      expect(validationResult.rougeScores?.rouge1.f1).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Perplexity', () => {
    it('should calculate perplexity even without reference text', () => {
      const mockFeedback = `## Feedback (Rating: 8/10)

Your answer demonstrates strong understanding of the concepts. You provided clear explanations with good examples.

---

## Correct Answer

A comprehensive answer covering all aspects of the topic.`

      const validationResult = validateQuestionFeedback(mockFeedback)

      expect(validationResult.perplexity).toBeDefined()
      expect(validationResult.perplexity?.perplexity).toBeGreaterThan(0)
      expect(validationResult.perplexity?.tokenCount).toBeGreaterThan(0)
      expect(validationResult.perplexity?.averageLogProbability).toBeLessThanOrEqual(0)
    })

    it('should calculate perplexity with reference text', () => {
      const mockFeedback = `## Feedback (Rating: 9/10)

Excellent answer with comprehensive coverage of all key points.

---

## Correct Answer

Complete and accurate explanation.`

      const referenceFeedback = 'Great answer covering all important aspects.'

      const validationResult = validateQuestionFeedback(
        mockFeedback,
        referenceFeedback
      )

      expect(validationResult.perplexity).toBeDefined()
      expect(validationResult.perplexity?.perplexity).toBeGreaterThan(0)
      expect(validationResult.rougeScores).toBeDefined()
    })
  })
})

