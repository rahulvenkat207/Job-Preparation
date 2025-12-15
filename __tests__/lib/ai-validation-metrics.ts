/**
 * Validation metrics for AI-generated responses
 */

import { aiAnalyzeSchema } from '@/services/ai/resumes/schemas'
import {
  extractRating,
  extractAllRatings,
  validateMarkdownStructure,
  checkPronounUsage,
  calculateScoreAverage,
  validateFeedbackCompleteness,
  isWithinTolerance,
  extractMarkdownSection,
} from './ai-validation-helpers'
import { ROUGEScores, PerplexityResult } from './ml-metrics'
import { evaluateText, evaluateSection } from './ml-metrics-helpers'

export interface ValidationResult {
  passed: boolean
  score: number // 0-100
  issues: string[]
  suggestions: string[]
  rougeScores?: ROUGEScores
  perplexity?: PerplexityResult
}

/**
 * Validate question feedback response
 * @param feedback - The feedback text to validate
 * @param referenceText - Optional reference text for ROUGE calculation
 * @param referenceSection - Optional section name to extract from reference (e.g., "Feedback", "Correct Answer")
 */
export function validateQuestionFeedback(
  feedback: string,
  referenceText?: string | string[],
  referenceSection?: string
): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    score: 100,
    issues: [],
    suggestions: [],
  }

  // Format Validation
  const feedbackHeaderPattern = /##\s+Feedback\s+\(Rating:\s*(\d+)\/10\)/i
  const correctAnswerPattern = /##\s+Correct\s+Answer/i

  // Check for feedback header with rating
  const rating = extractRating(feedback, feedbackHeaderPattern)
  if (rating === null) {
    result.passed = false
    result.score -= 30
    result.issues.push('Missing or invalid feedback header with rating (## Feedback (Rating: X/10))')
  } else {
    if (rating < 1 || rating > 10) {
      result.passed = false
      result.score -= 20
      result.issues.push(`Rating ${rating} is outside valid range (1-10)`)
    }
  }

  // Check for correct answer section
  if (!correctAnswerPattern.test(feedback)) {
    result.passed = false
    result.score -= 30
    result.issues.push('Missing "## Correct Answer" section')
  }

  // Extract sections
  const feedbackSection = extractMarkdownSection(feedback, 'Feedback')
  const correctAnswerSection = extractMarkdownSection(feedback, 'Correct Answer')

  // Content Quality Metrics
  if (feedbackSection) {
    // Remove the rating from feedback section for length check
    const feedbackText = feedbackSection.replace(/Rating:\s*\d+\/10/gi, '').trim()
    
    if (!validateFeedbackCompleteness(feedbackText, 50)) {
      result.passed = false
      result.score -= 15
      result.issues.push('Feedback text is too short (minimum 50 characters)')
    } else if (feedbackText.length > 2000) {
      result.score -= 5
      result.suggestions.push('Feedback text is very long (over 2000 characters), consider making it more concise')
    }

    // Check for constructive elements
    const hasStrengths = /strength|good|well|excellent|positive|strong/i.test(feedbackText)
    const hasImprovements = /improve|better|consider|suggest|recommend|could|should/i.test(feedbackText)
    
    if (!hasStrengths && !hasImprovements) {
      result.score -= 10
      result.suggestions.push('Feedback should include both strengths and areas for improvement')
    }
  } else {
    result.passed = false
    result.score -= 20
    result.issues.push('Could not extract feedback section content')
  }

  if (correctAnswerSection) {
    if (!validateFeedbackCompleteness(correctAnswerSection, 100)) {
      result.passed = false
      result.score -= 15
      result.issues.push('Correct answer section is too short (minimum 100 characters)')
    }
  } else {
    result.passed = false
    result.score -= 20
    result.issues.push('Could not extract correct answer section content')
  }

  // Check pronoun usage
  if (!checkPronounUsage(feedback, 'you')) {
    result.score -= 5
    result.suggestions.push('Feedback should use "you" pronoun to address the candidate directly')
  }

  result.score = Math.max(0, result.score)

  // Calculate ML metrics if reference text is provided
  if (referenceText) {
    const feedbackSection = extractMarkdownSection(feedback, 'Feedback')
    if (feedbackSection) {
      const cleanFeedback = feedbackSection.replace(
        /Rating:\s*\d+\/10/gi,
        ''
      ).trim()
      const evaluation = evaluateText(cleanFeedback, referenceText)
      result.rougeScores = evaluation.rougeScores
      result.perplexity = evaluation.perplexity
    }
  } else {
    // Still calculate perplexity even without reference
    const feedbackSection = extractMarkdownSection(feedback, 'Feedback')
    if (feedbackSection) {
      const cleanFeedback = feedbackSection.replace(
        /Rating:\s*\d+\/10/gi,
        ''
      ).trim()
      const evaluation = evaluateText(cleanFeedback)
      result.perplexity = evaluation.perplexity
    }
  }

  return result
}

/**
 * Validate interview feedback response
 * @param feedback - The feedback text to validate
 * @param expectedCategories - Array of expected category names
 * @param referenceText - Optional reference text for ROUGE calculation
 */
export function validateInterviewFeedback(
  feedback: string,
  expectedCategories: string[] = [
    'Communication Clarity',
    'Confidence and Emotional State',
    'Response Quality',
    'Pacing and Timing',
    'Engagement and Interaction',
    'Role Fit & Alignment',
    'Overall Strengths & Areas for Improvement',
  ],
  referenceText?: string | string[]
): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    score: 100,
    issues: [],
    suggestions: [],
  }

  // Format Validation - Check for overall rating at start
  const overallRatingPattern = /Overall\s+Rating:\s*(\d+)\/10/i
  const overallRating = extractRating(feedback, overallRatingPattern)
  
  if (overallRating === null) {
    // Try alternative patterns
    const altPattern1 = /^(\d+)\/10/i
    const altPattern2 = /Rating:\s*(\d+)\/10/i
    const rating = extractRating(feedback, altPattern1) || extractRating(feedback, altPattern2)
    
    if (rating === null) {
      result.passed = false
      result.score -= 20
      result.issues.push('Missing overall rating at the start of feedback')
    }
  }

  // Check for all required categories with ratings
  const categoryRatings: number[] = []
  const foundCategories: string[] = []

  for (const category of expectedCategories) {
    // Escape special regex characters
    const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const categoryPattern = new RegExp(
      `##?\\s+${escapedCategory}[^\\d]*?(\\d+)\\/10`,
      'i'
    )
    
    const rating = extractRating(feedback, categoryPattern)
    
    if (category !== 'Overall Strengths & Areas for Improvement') {
      // This category doesn't need a rating
      if (rating === null) {
        result.passed = false
        result.score -= 10
        result.issues.push(`Missing rating for category: ${category}`)
      } else {
        categoryRatings.push(rating)
        foundCategories.push(category)
      }
    }

    // Check if category section exists
    const categoryHeaderPattern = new RegExp(
      `^##?\\s+${escapedCategory}`,
      'im'
    )
    if (!categoryHeaderPattern.test(feedback)) {
      result.passed = false
      result.score -= 15
      result.issues.push(`Missing category section: ${category}`)
    } else {
      foundCategories.push(category)
    }
  }

  // Validate rating ranges - also check for ratings in text that might be outside range
  const allRatingPattern = /(\d+)\/10/gi
  const allRatings = Array.from(feedback.matchAll(allRatingPattern))
  
  for (const match of allRatings) {
    const rating = parseInt(match[1], 10)
    if (rating < 1 || rating > 10) {
      result.passed = false
      result.score -= 10
      result.issues.push(`Invalid rating ${rating} found (must be 1-10)`)
    }
  }
  
  // Also validate extracted category ratings
  for (const rating of categoryRatings) {
    if (rating < 1 || rating > 10) {
      result.passed = false
      result.score -= 10
      result.issues.push(`Invalid rating ${rating} found (must be 1-10)`)
    }
  }

  // Check overall rating consistency
  if (overallRating !== null && categoryRatings.length > 0) {
    const avgRating = calculateScoreAverage(categoryRatings)
    if (!isWithinTolerance(overallRating, avgRating, 2)) {
      result.score -= 10
      result.suggestions.push(
        `Overall rating (${overallRating}) differs significantly from category average (${avgRating.toFixed(1)})`
      )
    }
  }

  // Content Quality Metrics
  for (const category of expectedCategories) {
    const section = extractMarkdownSection(feedback, category)
    if (section) {
      if (!validateFeedbackCompleteness(section, 100)) {
        result.passed = false
        result.score -= 5
        result.issues.push(`Category "${category}" feedback is too short (minimum 100 characters)`)
      }
    }
  }

  // Check for transcript references (quotes or specific moments)
  const hasQuotes = /"[^"]+"|'[^']+'|mentioned|said|stated/i.test(feedback)
  if (!hasQuotes) {
    result.score -= 5
    result.suggestions.push('Feedback should reference specific moments or quotes from the transcript')
  }

  // Check pronoun usage
  if (!checkPronounUsage(feedback, 'you')) {
    result.score -= 5
    result.suggestions.push('Feedback should use "you" pronoun to address the interviewee directly')
  }

  // Check that emotional feature values are not mentioned
  // Look for decimal values (0.0 to 1.0) that might be emotional feature values
  // Common patterns: "0.8", "0.7", "1.0", etc. near emotion-related words or in context
  const emotionValuePattern = /\b(0\.\d+|1\.0)\b.*(confidence|calmness|nervousness|uncertainty|emotion|emotional|feeling|sentiment)/i
  const emotionValuePattern2 = /(confidence|calmness|nervousness|uncertainty|emotion|emotional|feeling|sentiment).*\b(0\.\d+|1\.0)\b/i
  if (emotionValuePattern.test(feedback) || emotionValuePattern2.test(feedback)) {
    result.score -= 10
    result.suggestions.push('Feedback should not include specific emotional feature values')
  }

  result.score = Math.max(0, result.score)

  // Calculate ML metrics if reference text is provided
  if (referenceText) {
    const evaluation = evaluateText(feedback, referenceText)
    result.rougeScores = evaluation.rougeScores
    result.perplexity = evaluation.perplexity
  } else {
    // Still calculate perplexity even without reference
    const evaluation = evaluateText(feedback)
    result.perplexity = evaluation.perplexity
  }

  return result
}

/**
 * Validate resume analysis response
 * @param response - The resume analysis response to validate
 * @param referenceAnalysis - Optional reference analysis for ROUGE calculation
 */
export function validateResumeAnalysis(
  response: unknown,
  referenceAnalysis?: unknown
): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    score: 100,
    issues: [],
    suggestions: [],
  }

  // Format Validation - Check JSON schema
  // First, do basic validation before schema parsing to catch specific issues
  if (typeof response === 'object' && response !== null) {
    const responseObj = response as Record<string, unknown>
    
    // Check overall score before schema validation
    if ('overallScore' in responseObj) {
      const overallScore = responseObj.overallScore
      if (typeof overallScore === 'number' && (overallScore < 1 || overallScore > 10)) {
        result.passed = false
        result.score -= 20
        result.issues.push(`Overall score ${overallScore} is outside valid range (1-10)`)
      }
    }
    
    // Check for invalid feedback types before schema validation
    const requiredCategories = ['ats', 'jobMatch', 'writingAndFormatting', 'keywordCoverage', 'other']
    const validFeedbackTypes = ['strength', 'minor-improvement', 'major-improvement']
    
    for (const category of requiredCategories) {
      const categoryData = responseObj[category] as Record<string, unknown> | undefined
      if (categoryData && Array.isArray(categoryData.feedback)) {
        for (const feedbackItem of categoryData.feedback as Array<{ type?: string }>) {
          if (feedbackItem.type && !validFeedbackTypes.includes(feedbackItem.type)) {
            result.passed = false
            result.score -= 5
            result.issues.push(
              `Category "${category}" has invalid feedback type: ${feedbackItem.type}`
            )
          }
        }
      }
    }
  }
  
  try {
    const parsed = aiAnalyzeSchema.parse(response)
    
    // Validate overall score (in case it passed schema but is still invalid)
    if (parsed.overallScore < 1 || parsed.overallScore > 10) {
      result.passed = false
      result.score -= 20
      result.issues.push(`Overall score ${parsed.overallScore} is outside valid range (1-10)`)
    }

    // Validate all categories are present
    const requiredCategories = ['ats', 'jobMatch', 'writingAndFormatting', 'keywordCoverage', 'other']
    const categoryScores: number[] = []

    for (const category of requiredCategories) {
      const categoryData = parsed[category as keyof typeof parsed] as {
        score: number
        summary: string
        feedback: Array<{
          type: string
          name: string
          message: string
        }>
      }

      if (!categoryData) {
        result.passed = false
        result.score -= 15
        result.issues.push(`Missing category: ${category}`)
        continue
      }

      // Validate category score
      if (categoryData.score < 1 || categoryData.score > 10) {
        result.passed = false
        result.score -= 10
        result.issues.push(`Category "${category}" score ${categoryData.score} is outside valid range (1-10)`)
      } else {
        categoryScores.push(categoryData.score)
      }

      // Validate summary
      if (!categoryData.summary || categoryData.summary.trim().length < 20) {
        result.passed = false
        result.score -= 10
        result.issues.push(`Category "${category}" summary is too short (minimum 20 characters)`)
      } else if (categoryData.summary.length > 500) {
        result.score -= 5
        result.suggestions.push(`Category "${category}" summary is very long (over 500 characters)`)
      }

      // Validate feedback array
      if (!Array.isArray(categoryData.feedback) || categoryData.feedback.length === 0) {
        result.passed = false
        result.score -= 10
        result.issues.push(`Category "${category}" must have at least one feedback item`)
      } else {
        // Validate each feedback item
        for (const feedbackItem of categoryData.feedback) {
          const validTypes = ['strength', 'minor-improvement', 'major-improvement']
          if (!validTypes.includes(feedbackItem.type)) {
            result.passed = false
            result.score -= 5
            result.issues.push(
              `Category "${category}" has invalid feedback type: ${feedbackItem.type}`
            )
          }

          if (!feedbackItem.name || feedbackItem.name.trim().length === 0) {
            result.passed = false
            result.score -= 5
            result.issues.push(`Category "${category}" has feedback item with missing name`)
          }

          if (!feedbackItem.message || feedbackItem.message.trim().length < 30) {
            result.passed = false
            result.score -= 5
            result.issues.push(
              `Category "${category}" has feedback message that is too short (minimum 30 characters)`
            )
          }

          // Check for actionable language
          const actionablePattern = /should|consider|recommend|suggest|add|remove|improve|change/i
          if (feedbackItem.type !== 'strength' && !actionablePattern.test(feedbackItem.message)) {
            result.score -= 3
            result.suggestions.push(
              `Category "${category}" feedback item "${feedbackItem.name}" could be more actionable`
            )
          }

          // Check pronoun usage
          if (!checkPronounUsage(feedbackItem.message, 'you')) {
            result.score -= 2
            result.suggestions.push(
              `Category "${category}" feedback should use "you" pronoun`
            )
          }
        }
      }
    }

    // Validate overall score consistency
    if (categoryScores.length > 0) {
      const avgScore = calculateScoreAverage(categoryScores)
      if (!isWithinTolerance(parsed.overallScore, avgScore, 2)) {
        result.score -= 10
        result.suggestions.push(
          `Overall score (${parsed.overallScore}) differs significantly from category average (${avgScore.toFixed(1)})`
        )
      }
    }

  } catch (error) {
    result.passed = false
    result.score = 0
    if (error instanceof Error) {
      const errorMessage = error.message
      // Check if error is about invalid enum (feedback type)
      if (errorMessage.includes('Invalid enum value') || errorMessage.includes('invalid_type')) {
        result.issues.push('Schema validation failed: Invalid feedback type detected')
      } else if (errorMessage.includes('Number must be') || errorMessage.includes('too_big') || errorMessage.includes('too_small')) {
        // Check if we already added a specific issue about score range
        const hasScoreIssue = result.issues.some(issue => issue.includes('outside valid range'))
        if (!hasScoreIssue) {
          result.issues.push(`Schema validation failed: ${errorMessage}`)
        }
      } else {
        result.issues.push(`Schema validation failed: ${errorMessage}`)
      }
    } else {
      result.issues.push('Schema validation failed: Invalid response structure')
    }
  }

  result.score = Math.max(0, result.score)

  // Calculate ML metrics if reference analysis is provided
  if (referenceAnalysis && typeof response === 'object' && response !== null) {
    try {
      const parsed = aiAnalyzeSchema.parse(response)
      const refParsed =
        typeof referenceAnalysis === 'object' &&
        referenceAnalysis !== null &&
        aiAnalyzeSchema.safeParse(referenceAnalysis).success
          ? (referenceAnalysis as typeof parsed)
          : null

      if (refParsed) {
        // Compare summaries and feedback messages
        const categories = [
          'ats',
          'jobMatch',
          'writingAndFormatting',
          'keywordCoverage',
          'other',
        ]

        const allCandidateTexts: string[] = []
        const allReferenceTexts: string[] = []

        for (const category of categories) {
          const candidateData = parsed[category as keyof typeof parsed] as {
            summary?: string
            feedback?: Array<{ message?: string }>
          }
          const referenceData = refParsed[category as keyof typeof refParsed] as {
            summary?: string
            feedback?: Array<{ message?: string }>
          }

          if (candidateData?.summary && referenceData?.summary) {
            allCandidateTexts.push(candidateData.summary)
            allReferenceTexts.push(referenceData.summary)
          }

          if (candidateData?.feedback && referenceData?.feedback) {
            const candidateMessages = candidateData.feedback
              .map(f => f.message)
              .filter((m): m is string => typeof m === 'string')
            const referenceMessages = referenceData.feedback
              .map(f => f.message)
              .filter((m): m is string => typeof m === 'string')

            allCandidateTexts.push(...candidateMessages)
            allReferenceTexts.push(...referenceMessages)
          }
        }

        if (allCandidateTexts.length > 0 && allReferenceTexts.length > 0) {
          const combinedCandidate = allCandidateTexts.join(' ')
          const combinedReference = allReferenceTexts.join(' ')
          const evaluation = evaluateText(combinedCandidate, combinedReference)
          result.rougeScores = evaluation.rougeScores
        }
      }

      // Calculate perplexity for the overall response
      const responseText = JSON.stringify(response)
      const evaluation = evaluateText(responseText)
      result.perplexity = evaluation.perplexity
    } catch {
      // If parsing fails, just calculate perplexity
      const responseText = JSON.stringify(response)
      const evaluation = evaluateText(responseText)
      result.perplexity = evaluation.perplexity
    }
  } else {
    // Still calculate perplexity even without reference
    const responseText = JSON.stringify(response)
    const evaluation = evaluateText(responseText)
    result.perplexity = evaluation.perplexity
  }

  return result
}

/**
 * Validate that a rating aligns with expected quality
 */
export function validateRatingAlignment(
  actualRating: number,
  expectedRange: [number, number]
): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    score: 100,
    issues: [],
    suggestions: [],
  }

  if (actualRating < expectedRange[0] || actualRating > expectedRange[1]) {
    result.passed = false
    result.score -= 30
    result.issues.push(
      `Rating ${actualRating} is outside expected range [${expectedRange[0]}, ${expectedRange[1]}]`
    )
  }

  return result
}

