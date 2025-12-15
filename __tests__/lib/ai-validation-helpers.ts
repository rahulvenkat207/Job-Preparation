/**
 * Helper functions for validating AI-generated responses
 */

/**
 * Extract a rating from text using a regex pattern
 * @param text - The text to search
 * @param pattern - Regex pattern to match ratings (e.g., /Rating:\s*(\d+)\/10/)
 * @returns The extracted rating number or null if not found
 */
export function extractRating(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern)
  if (match && match[1]) {
    const rating = parseInt(match[1], 10)
    if (!isNaN(rating) && rating >= 1 && rating <= 10) {
      return rating
    }
  }
  return null
}

/**
 * Validate that markdown text contains all required sections
 * @param text - The markdown text to validate
 * @param requiredSections - Array of section headers to check for (e.g., ["## Feedback", "## Correct Answer"])
 * @returns true if all sections are present
 */
export function validateMarkdownStructure(
  text: string,
  requiredSections: string[]
): boolean {
  return requiredSections.every(section => {
    // Check for markdown headers (## or ###)
    const headerPattern = new RegExp(`^#{2,3}\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm')
    return headerPattern.test(text)
  })
}

/**
 * Check if text uses the expected pronoun
 * @param text - The text to check
 * @param expectedPronoun - The pronoun to check for (e.g., "you", "your")
 * @returns true if the pronoun is used appropriately
 */
export function checkPronounUsage(text: string, expectedPronoun: string): boolean {
  const pronounPattern = new RegExp(`\\b${expectedPronoun}\\b`, 'i')
  return pronounPattern.test(text)
}

/**
 * Calculate the average of an array of scores
 * @param scores - Array of numeric scores
 * @returns The average score
 */
export function calculateScoreAverage(scores: number[]): number {
  if (scores.length === 0) return 0
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return sum / scores.length
}

/**
 * Validate that feedback text meets minimum length requirement
 * @param feedback - The feedback text to validate
 * @param minLength - Minimum required length in characters
 * @returns true if feedback meets minimum length
 */
export function validateFeedbackCompleteness(
  feedback: string,
  minLength: number
): boolean {
  return feedback.trim().length >= minLength
}

/**
 * Extract all ratings from a text that match a pattern
 * @param text - The text to search
 * @param pattern - Regex pattern to match ratings
 * @returns Array of extracted ratings
 */
export function extractAllRatings(text: string, pattern: RegExp): number[] {
  const ratings: number[] = []
  const matches = text.matchAll(new RegExp(pattern.source, 'g'))
  
  for (const match of matches) {
    if (match[1]) {
      const rating = parseInt(match[1], 10)
      if (!isNaN(rating) && rating >= 1 && rating <= 10) {
        ratings.push(rating)
      }
    }
  }
  
  return ratings
}

/**
 * Check if a number is within a tolerance range of another number
 * @param value - The value to check
 * @param target - The target value
 * @param tolerance - The allowed tolerance
 * @returns true if value is within tolerance of target
 */
export function isWithinTolerance(
  value: number,
  target: number,
  tolerance: number
): boolean {
  return Math.abs(value - target) <= tolerance
}

/**
 * Extract section content from markdown text
 * @param text - The markdown text
 * @param sectionHeader - The section header to extract (e.g., "Feedback" or "Correct Answer")
 * @returns The content of the section or null if not found
 */
export function extractMarkdownSection(
  text: string,
  sectionHeader: string
): string | null {
  const escapedHeader = sectionHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match the header with optional parentheses content (like "Feedback (Rating: 8/10)")
  const headerPattern = new RegExp(
    `^#{2,3}\\s+${escapedHeader}(?:[^\\n]*)?`,
    'im'
  )
  
  // Find the start of the section
  const headerMatch = text.match(headerPattern)
  if (!headerMatch) return null
  
  const headerIndex = text.indexOf(headerMatch[0])
  if (headerIndex === -1) return null
  
  // Find the start of content (after the header line)
  const contentStart = text.indexOf('\n', headerIndex) + 1
  if (contentStart === 0) return null
  
  // Find the next section or end of text
  const nextSectionPattern = new RegExp(`^#{2,3}\\s+`, 'm')
  const remainingText = text.substring(contentStart)
  const nextSectionMatch = remainingText.match(nextSectionPattern)
  
  if (nextSectionMatch) {
    const nextSectionIndex = remainingText.indexOf(nextSectionMatch[0])
    return remainingText.substring(0, nextSectionIndex).trim()
  }
  
  // No next section, return rest of text
  return remainingText.trim()
}

/**
 * Count occurrences of a word or phrase in text
 * @param text - The text to search
 * @param searchTerm - The word or phrase to count
 * @returns The number of occurrences
 */
export function countOccurrences(text: string, searchTerm: string): number {
  const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

