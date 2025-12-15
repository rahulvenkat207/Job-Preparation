/**
 * Tests for AI resume analysis with validation metrics
 */

import { analyzeResumeForJob } from '@/services/ai/resumes/ai'
import { resumeAnalysisTestData, createResumeFile } from '../../fixtures/ai-test-data'
import { validateResumeAnalysis } from '../../lib/ai-validation-metrics'

// Mock dependencies
jest.mock('@/services/ai/models/google', () => ({
  google: jest.fn(() => 'mock-model'),
}))

jest.mock('ai', () => ({
  streamObject: jest.fn(),
}))

import { streamObject } from 'ai'

const mockStreamObject = streamObject as jest.MockedFunction<typeof streamObject>

describe('AI Resume Analysis Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test with sample data for each quality level
  resumeAnalysisTestData.forEach((testCase, index) => {
    describe(`Test Case ${index + 1}: ${testCase.quality} resume`, () => {
      it(`should generate valid analysis for ${testCase.quality} quality resume`, () => {
        const mockAnalysis = generateMockResumeAnalysis(testCase.quality)
        const validationResult = validateResumeAnalysis(mockAnalysis)

        // Should pass schema validation
        expect(validationResult.passed).toBe(true)
        expect(validationResult.score).toBeGreaterThanOrEqual(70)
        expect(validationResult.issues.length).toBe(0)
      })

      it(`should have all required categories for ${testCase.quality} quality resume`, () => {
        const mockAnalysis = generateMockResumeAnalysis(testCase.quality)
        const validationResult = validateResumeAnalysis(mockAnalysis)

        // Check all categories are present
        expect(mockAnalysis).toHaveProperty('ats')
        expect(mockAnalysis).toHaveProperty('jobMatch')
        expect(mockAnalysis).toHaveProperty('writingAndFormatting')
        expect(mockAnalysis).toHaveProperty('keywordCoverage')
        expect(mockAnalysis).toHaveProperty('other')
        expect(mockAnalysis).toHaveProperty('overallScore')

        expect(validationResult.issues.length).toBe(0)
      })

      it(`should have valid scores in range 1-10 for ${testCase.quality} quality resume`, () => {
        const mockAnalysis = generateMockResumeAnalysis(testCase.quality)
        
        expect(mockAnalysis.overallScore).toBeGreaterThanOrEqual(1)
        expect(mockAnalysis.overallScore).toBeLessThanOrEqual(10)
        
        const categories = ['ats', 'jobMatch', 'writingAndFormatting', 'keywordCoverage', 'other']
        categories.forEach(category => {
          const categoryData = mockAnalysis[category as keyof typeof mockAnalysis] as {
            score: number
          }
          expect(categoryData.score).toBeGreaterThanOrEqual(1)
          expect(categoryData.score).toBeLessThanOrEqual(10)
        })
      })

      it(`should have feedback items for ${testCase.quality} quality resume`, () => {
        const mockAnalysis = generateMockResumeAnalysis(testCase.quality)
        
        const categories = ['ats', 'jobMatch', 'writingAndFormatting', 'keywordCoverage', 'other']
        categories.forEach(category => {
          const categoryData = mockAnalysis[category as keyof typeof mockAnalysis] as {
            feedback: Array<{ type: string; name: string; message: string }>
          }
          expect(Array.isArray(categoryData.feedback)).toBe(true)
          expect(categoryData.feedback.length).toBeGreaterThan(0)
          
          categoryData.feedback.forEach(item => {
            expect(['strength', 'minor-improvement', 'major-improvement']).toContain(item.type)
            expect(item.name).toBeTruthy()
            expect(item.message).toBeTruthy()
            expect(item.message.length).toBeGreaterThanOrEqual(30)
          })
        })
      })

      it(`should use "you" pronoun in feedback for ${testCase.quality} quality resume`, () => {
        const mockAnalysis = generateMockResumeAnalysis(testCase.quality)
        
        const categories = ['ats', 'jobMatch', 'writingAndFormatting', 'keywordCoverage', 'other']
        let hasYouPronoun = false
        
        categories.forEach(category => {
          const categoryData = mockAnalysis[category as keyof typeof mockAnalysis] as {
            feedback: Array<{ message: string }>
            summary: string
          }
          
          if (categoryData.summary.toLowerCase().includes('you')) {
            hasYouPronoun = true
          }
          
          categoryData.feedback.forEach(item => {
            if (item.message.toLowerCase().includes('you')) {
              hasYouPronoun = true
            }
          })
        })
        
        expect(hasYouPronoun).toBe(true)
      })
    })
  })

  // Edge case tests
  describe('Edge Cases', () => {
    it('should detect invalid schema structure', () => {
      const invalidAnalysis = {
        overallScore: 8,
        // Missing required categories
      }

      const validationResult = validateResumeAnalysis(invalidAnalysis)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.length).toBeGreaterThan(0)
    })

    it('should detect invalid overall score range', () => {
      const invalidAnalysis = {
        overallScore: 15, // Invalid
        ats: createCategoryData(8),
        jobMatch: createCategoryData(8),
        writingAndFormatting: createCategoryData(8),
        keywordCoverage: createCategoryData(8),
        other: createCategoryData(8),
      }

      const validationResult = validateResumeAnalysis(invalidAnalysis)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('outside valid range'))).toBe(true)
    })

    it('should detect missing feedback items', () => {
      const invalidAnalysis = {
        overallScore: 8,
        ats: {
          score: 8,
          summary: 'Good ATS formatting',
          feedback: [], // Empty array
        },
        jobMatch: createCategoryData(8),
        writingAndFormatting: createCategoryData(8),
        keywordCoverage: createCategoryData(8),
        other: createCategoryData(8),
      }

      const validationResult = validateResumeAnalysis(invalidAnalysis)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('at least one feedback item'))).toBe(true)
    })

    it('should detect too short summary', () => {
      const invalidAnalysis = {
        overallScore: 8,
        ats: {
          score: 8,
          summary: 'Short', // Too short
          feedback: [
            {
              type: 'strength',
              name: 'Good formatting',
              message: 'Your resume has good formatting that should work well with ATS systems.',
            },
          ],
        },
        jobMatch: createCategoryData(8),
        writingAndFormatting: createCategoryData(8),
        keywordCoverage: createCategoryData(8),
        other: createCategoryData(8),
      }

      const validationResult = validateResumeAnalysis(invalidAnalysis)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('summary is too short'))).toBe(true)
    })

    it('should detect too short feedback messages', () => {
      const invalidAnalysis = {
        overallScore: 8,
        ats: createCategoryData(8),
        jobMatch: {
          score: 8,
          summary: 'Good job match with some areas for improvement',
          feedback: [
            {
              type: 'minor-improvement',
              name: 'Add more keywords',
              message: 'Short', // Too short
            },
          ],
        },
        writingAndFormatting: createCategoryData(8),
        keywordCoverage: createCategoryData(8),
        other: createCategoryData(8),
      }

      const validationResult = validateResumeAnalysis(invalidAnalysis)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('too short'))).toBe(true)
    })

    it('should detect invalid feedback type', () => {
      const invalidAnalysis = {
        overallScore: 8,
        ats: createCategoryData(8),
        jobMatch: createCategoryData(8),
        writingAndFormatting: {
          score: 8,
          summary: 'Good writing quality',
          feedback: [
            {
              type: 'invalid-type', // Invalid
              name: 'Test',
              message: 'This is a test feedback message that is long enough to pass validation.',
            },
          ],
        },
        keywordCoverage: createCategoryData(8),
        other: createCategoryData(8),
      }

      const validationResult = validateResumeAnalysis(invalidAnalysis)
      expect(validationResult.passed).toBe(false)
      expect(validationResult.issues.some(issue => issue.includes('invalid feedback type'))).toBe(true)
    })

    it('should check overall score consistency', () => {
      const inconsistentAnalysis = {
        overallScore: 2, // Very low
        ats: createCategoryData(9),
        jobMatch: createCategoryData(9),
        writingAndFormatting: createCategoryData(9),
        keywordCoverage: createCategoryData(9),
        other: createCategoryData(9),
      }

      const validationResult = validateResumeAnalysis(inconsistentAnalysis)
      // Should have suggestion about score inconsistency
      expect(validationResult.suggestions.some(s => s.includes('differs significantly'))).toBe(true)
    })
  })

  // Integration test structure (can be enabled with environment variable)
  describe('Integration Tests (Optional)', () => {
    const runIntegrationTests = process.env.RUN_AI_INTEGRATION_TESTS === 'true'

    if (runIntegrationTests) {
      it('should generate and validate real AI analysis', async () => {
        const testCase = resumeAnalysisTestData[0]
        const resumeFile = createResumeFile(testCase.resumeText)

        mockStreamObject.mockReturnValue({
          // Mock stream object response
        } as any)

        const result = await analyzeResumeForJob({
          resumeFile,
          jobInfo: testCase.jobInfo,
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
 * Generate mock resume analysis based on quality level
 */
function generateMockResumeAnalysis(quality: string) {
  const baseScores: Record<string, number> = {
    excellent: 8,
    good: 7,
    average: 5,
    poor: 3,
  }

  const score = baseScores[quality] || baseScores.average

  return {
    overallScore: score,
    ats: createCategoryData(score, [
      {
        type: 'strength' as const,
        name: 'Clean formatting',
        message: 'Your resume uses a clean, ATS-friendly format with standard section headings.',
      },
      {
        type: quality === 'poor' ? ('major-improvement' as const) : ('minor-improvement' as const),
        name: 'Section organization',
        message: quality === 'poor'
          ? 'You should reorganize your sections to follow a more standard format for better ATS parsing.'
          : 'Consider using more standard section headings for better ATS compatibility.',
      },
    ]),
    jobMatch: createCategoryData(score, [
      {
        type: 'strength' as const,
        name: 'Relevant experience',
        message: 'Your experience aligns well with the job requirements.',
      },
      {
        type: quality === 'poor' ? ('major-improvement' as const) : ('minor-improvement' as const),
        name: 'Skill alignment',
        message: quality === 'poor'
          ? 'You need to better highlight skills that match the job description.'
          : 'You could emphasize more skills that directly match the job requirements.',
      },
    ]),
    writingAndFormatting: createCategoryData(score, [
      {
        type: 'strength' as const,
        name: 'Clear writing',
        message: 'Your resume is well-written and easy to read.',
      },
      {
        type: 'minor-improvement' as const,
        name: 'Consistency',
        message: 'You could improve consistency in formatting and verb tense throughout your resume.',
      },
    ]),
    keywordCoverage: createCategoryData(score, [
      {
        type: quality === 'poor' ? ('major-improvement' as const) : ('minor-improvement' as const),
        name: 'Keyword optimization',
        message: quality === 'poor'
          ? 'You are missing many important keywords from the job description. Add more relevant technical terms.'
          : 'You could include more keywords from the job description to improve ATS matching.',
      },
    ]),
    other: createCategoryData(score, [
      {
        type: 'strength' as const,
        name: 'Complete information',
        message: 'Your resume includes all necessary contact information and sections.',
      },
    ]),
  }
}

/**
 * Helper to create category data
 */
function createCategoryData(
  score: number,
  feedback: Array<{
    type: 'strength' | 'minor-improvement' | 'major-improvement'
    name: string
    message: string
  }> = [
    {
      type: 'strength',
      name: 'Good aspect',
      message: 'This is a good aspect of your resume that demonstrates quality.',
    },
  ]
) {
  return {
    score,
    summary: `This category received a score of ${score} based on the analysis of your resume.`,
    feedback,
  }
}

describe('ML Metrics Evaluation', () => {
  describe('ROUGE Scores', () => {
    it('should calculate ROUGE scores when reference analysis is provided', () => {
      const mockAnalysis = generateMockResumeAnalysis('good')
      const referenceAnalysis = {
        overallScore: 7,
        ats: {
          score: 7,
          summary: 'Your resume has good ATS compatibility with standard formatting.',
          feedback: [
            {
              type: 'strength' as const,
              name: 'Formatting',
              message: 'Clean and ATS-friendly format used.',
            },
          ],
        },
        jobMatch: {
          score: 7,
          summary: 'Good alignment with job requirements.',
          feedback: [
            {
              type: 'strength' as const,
              name: 'Experience',
              message: 'Relevant experience demonstrated.',
            },
          ],
        },
        writingAndFormatting: {
          score: 7,
          summary: 'Well-written resume with clear structure.',
          feedback: [],
        },
        keywordCoverage: {
          score: 6,
          summary: 'Could include more keywords from job description.',
          feedback: [],
        },
        other: {
          score: 7,
          summary: 'Complete information provided.',
          feedback: [],
        },
      }

      const validationResult = validateResumeAnalysis(
        mockAnalysis,
        referenceAnalysis
      )

      expect(validationResult.rougeScores).toBeDefined()
      expect(validationResult.rougeScores?.rouge1).toBeDefined()
      expect(validationResult.rougeScores?.rouge2).toBeDefined()
      expect(validationResult.rougeScores?.rougeL).toBeDefined()

      // ROUGE scores should be between 0 and 1
      expect(validationResult.rougeScores?.rouge1.f1).toBeGreaterThanOrEqual(0)
      expect(validationResult.rougeScores?.rouge1.f1).toBeLessThanOrEqual(1)
    })
  })

  describe('Perplexity', () => {
    it('should calculate perplexity even without reference analysis', () => {
      const mockAnalysis = generateMockResumeAnalysis('average')

      const validationResult = validateResumeAnalysis(mockAnalysis)

      expect(validationResult.perplexity).toBeDefined()
      expect(validationResult.perplexity?.perplexity).toBeGreaterThan(0)
      expect(validationResult.perplexity?.tokenCount).toBeGreaterThan(0)
    })

    it('should calculate both ROUGE and perplexity with reference analysis', () => {
      const mockAnalysis = generateMockResumeAnalysis('excellent')
      const referenceAnalysis = generateMockResumeAnalysis('good')

      const validationResult = validateResumeAnalysis(
        mockAnalysis,
        referenceAnalysis
      )

      expect(validationResult.perplexity).toBeDefined()
      expect(validationResult.perplexity?.perplexity).toBeGreaterThan(0)
      expect(validationResult.rougeScores).toBeDefined()
    })
  })
})

