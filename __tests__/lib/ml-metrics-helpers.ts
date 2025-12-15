/**
 * Helper functions for ML metrics evaluation
 */

import {
  calculateROUGE,
  calculatePerplexity,
  ROUGEScores,
  PerplexityResult,
} from './ml-metrics'
import { extractMarkdownSection } from './ai-validation-helpers'

export interface EvaluationResult {
  rougeScores?: ROUGEScores
  perplexity?: PerplexityResult
  section?: string
}

export interface BatchEvaluationResult {
  results: EvaluationResult[]
  averageRouge1: number
  averageRouge2: number
  averageRougeL: number
  averagePerplexity: number
  totalEvaluations: number
}

/**
 * Extract specific sections from AI-generated feedback for evaluation
 */
export function extractSectionForEvaluation(
  text: string,
  sectionName: string
): string | null {
  return extractMarkdownSection(text, sectionName)
}

/**
 * Extract feedback section from question feedback
 */
export function extractFeedbackSection(feedback: string): string | null {
  const section = extractMarkdownSection(feedback, 'Feedback')
  if (!section) return null

  // Remove rating from feedback section
  return section.replace(/Rating:\s*\d+\/10/gi, '').trim()
}

/**
 * Extract correct answer section from question feedback
 */
export function extractCorrectAnswerSection(feedback: string): string | null {
  return extractMarkdownSection(feedback, 'Correct Answer')
}

/**
 * Extract all category sections from interview feedback
 */
export function extractInterviewCategories(feedback: string): Map<string, string> {
  const categories = [
    'Communication Clarity',
    'Confidence and Emotional State',
    'Response Quality',
    'Pacing and Timing',
    'Engagement and Interaction',
    'Role Fit & Alignment',
    'Overall Strengths & Areas for Improvement',
  ]

  const categoryMap = new Map<string, string>()

  for (const category of categories) {
    const section = extractMarkdownSection(feedback, category)
    if (section) {
      categoryMap.set(category, section)
    }
  }

  return categoryMap
}

/**
 * Extract summary from resume analysis category
 */
export function extractResumeCategorySummary(
  analysis: unknown,
  category: string
): string | null {
  if (typeof analysis !== 'object' || analysis === null) {
    return null
  }

  const analysisObj = analysis as Record<string, unknown>
  const categoryData = analysisObj[category] as
    | { summary?: string }
    | undefined

  return categoryData?.summary || null
}

/**
 * Extract all feedback messages from resume analysis category
 */
export function extractResumeCategoryFeedback(
  analysis: unknown,
  category: string
): string[] {
  if (typeof analysis !== 'object' || analysis === null) {
    return []
  }

  const analysisObj = analysis as Record<string, unknown>
  const categoryData = analysisObj[category] as
    | { feedback?: Array<{ message?: string }> }
    | undefined

  if (!categoryData?.feedback || !Array.isArray(categoryData.feedback)) {
    return []
  }

  return categoryData.feedback
    .map(item => item.message)
    .filter((msg): msg is string => typeof msg === 'string' && msg.length > 0)
}

/**
 * Evaluate a single text against reference text(s) using ROUGE and Perplexity
 */
export function evaluateText(
  candidate: string,
  references?: string | string[]
): EvaluationResult {
  const result: EvaluationResult = {}

  // Calculate ROUGE if reference is provided
  if (references) {
    result.rougeScores = calculateROUGE(candidate, references)
  }

  // Always calculate perplexity
  result.perplexity = calculatePerplexity(candidate)

  return result
}

/**
 * Evaluate a specific section of AI output against reference
 */
export function evaluateSection(
  text: string,
  sectionName: string,
  reference?: string | string[]
): EvaluationResult | null {
  const section = extractMarkdownSection(text, sectionName)
  if (!section) {
    return null
  }

  return evaluateText(section, reference)
}

/**
 * Batch evaluate multiple candidate texts against their references
 */
export function batchEvaluate(
  candidates: Array<{
    text: string
    reference?: string | string[]
    section?: string
  }>
): BatchEvaluationResult {
  const results: EvaluationResult[] = []
  const rouge1Scores: number[] = []
  const rouge2Scores: number[] = []
  const rougeLScores: number[] = []
  const perplexities: number[] = []

  for (const candidate of candidates) {
    let text = candidate.text
    if (candidate.section) {
      const section = extractMarkdownSection(text, candidate.section)
      if (!section) continue
      text = section
    }

    const evaluation = evaluateText(text, candidate.reference)
    evaluation.section = candidate.section
    results.push(evaluation)

    if (evaluation.rougeScores) {
      rouge1Scores.push(evaluation.rougeScores.rouge1.f1)
      rouge2Scores.push(evaluation.rougeScores.rouge2.f1)
      rougeLScores.push(evaluation.rougeScores.rougeL.f1)
    }

    if (evaluation.perplexity && isFinite(evaluation.perplexity.perplexity)) {
      perplexities.push(evaluation.perplexity.perplexity)
    }
  }

  return {
    results,
    averageRouge1:
      rouge1Scores.length > 0
        ? rouge1Scores.reduce((a, b) => a + b, 0) / rouge1Scores.length
        : 0,
    averageRouge2:
      rouge2Scores.length > 0
        ? rouge2Scores.reduce((a, b) => a + b, 0) / rouge2Scores.length
        : 0,
    averageRougeL:
      rougeLScores.length > 0
        ? rougeLScores.reduce((a, b) => a + b, 0) / rougeLScores.length
        : 0,
    averagePerplexity:
      perplexities.length > 0
        ? perplexities.reduce((a, b) => a + b, 0) / perplexities.length
        : Infinity,
    totalEvaluations: results.length,
  }
}

/**
 * Compare metrics across different prompts or model configurations
 */
export function compareMetrics(
  evaluations: Array<{
    name: string
    metrics: BatchEvaluationResult
  }>
): {
  bestRouge1: { name: string; score: number }
  bestRouge2: { name: string; score: number }
  bestRougeL: { name: string; score: number }
  bestPerplexity: { name: string; score: number }
  comparison: Array<{
    name: string
    rouge1: number
    rouge2: number
    rougeL: number
    perplexity: number
  }>
} {
  let bestRouge1 = { name: '', score: 0 }
  let bestRouge2 = { name: '', score: 0 }
  let bestRougeL = { name: '', score: 0 }
  let bestPerplexity = { name: '', score: Infinity }

  const comparison = evaluations.map(evaluation => {
    const metrics = evaluation.metrics

    if (metrics.averageRouge1 > bestRouge1.score) {
      bestRouge1 = { name: evaluation.name, score: metrics.averageRouge1 }
    }
    if (metrics.averageRouge2 > bestRouge2.score) {
      bestRouge2 = { name: evaluation.name, score: metrics.averageRouge2 }
    }
    if (metrics.averageRougeL > bestRougeL.score) {
      bestRougeL = { name: evaluation.name, score: metrics.averageRougeL }
    }
    if (
      isFinite(metrics.averagePerplexity) &&
      metrics.averagePerplexity < bestPerplexity.score
    ) {
      bestPerplexity = {
        name: evaluation.name,
        score: metrics.averagePerplexity,
      }
    }

    return {
      name: evaluation.name,
      rouge1: metrics.averageRouge1,
      rouge2: metrics.averageRouge2,
      rougeL: metrics.averageRougeL,
      perplexity: metrics.averagePerplexity,
    }
  })

  return {
    bestRouge1,
    bestRouge2,
    bestRougeL,
    bestPerplexity,
    comparison,
  }
}

/**
 * Format evaluation results for display
 */
export function formatEvaluationResults(
  result: EvaluationResult
): string {
  const parts: string[] = []

  if (result.rougeScores) {
    parts.push('ROUGE Scores:')
    parts.push(
      `  ROUGE-1: P=${result.rougeScores.rouge1.precision.toFixed(3)}, R=${result.rougeScores.rouge1.recall.toFixed(3)}, F1=${result.rougeScores.rouge1.f1.toFixed(3)}`
    )
    parts.push(
      `  ROUGE-2: P=${result.rougeScores.rouge2.precision.toFixed(3)}, R=${result.rougeScores.rouge2.recall.toFixed(3)}, F1=${result.rougeScores.rouge2.f1.toFixed(3)}`
    )
    parts.push(
      `  ROUGE-L: P=${result.rougeScores.rougeL.precision.toFixed(3)}, R=${result.rougeScores.rougeL.recall.toFixed(3)}, F1=${result.rougeScores.rougeL.f1.toFixed(3)}`
    )
  }

  if (result.perplexity) {
    parts.push(
      `Perplexity: ${isFinite(result.perplexity.perplexity) ? result.perplexity.perplexity.toFixed(2) : 'Infinity'}`
    )
    parts.push(`Token Count: ${result.perplexity.tokenCount}`)
  }

  return parts.join('\n')
}

