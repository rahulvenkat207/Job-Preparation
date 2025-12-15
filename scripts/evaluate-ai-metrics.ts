#!/usr/bin/env ts-node

/**
 * Standalone script to evaluate AI outputs using ROUGE and Perplexity metrics
 * 
 * Usage:
 *   ts-node scripts/evaluate-ai-metrics.ts <input-file.json>
 * 
 * Input file format:
 * {
 *   "evaluations": [
 *     {
 *       "name": "test-case-1",
 *       "candidate": "Generated text here",
 *       "reference": "Reference text here" (optional)
 *     }
 *   ]
 * }
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  calculateROUGE,
  calculatePerplexity,
  ROUGEScores,
  PerplexityResult,
} from '../__tests__/lib/ml-metrics'
import {
  batchEvaluate,
  compareMetrics,
  formatEvaluationResults,
  BatchEvaluationResult,
} from '../__tests__/lib/ml-metrics-helpers'

interface EvaluationInput {
  name: string
  candidate: string
  reference?: string | string[]
  section?: string
}

interface EvaluationData {
  evaluations: EvaluationInput[]
}

interface EvaluationOutput {
  name: string
  rougeScores?: ROUGEScores
  perplexity?: PerplexityResult
  section?: string
}

interface Report {
  individualResults: EvaluationOutput[]
  summary: {
    totalEvaluations: number
    evaluationsWithRouge: number
    averageRouge1: number
    averageRouge2: number
    averageRougeL: number
    averagePerplexity: number
  }
}

/**
 * Load evaluation data from JSON file
 */
function loadEvaluationData(filePath: string): EvaluationData {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as EvaluationData
  } catch (error) {
    console.error(`Error loading evaluation data from ${filePath}:`, error)
    process.exit(1)
  }
}

/**
 * Evaluate all inputs and generate report
 */
function evaluateAll(data: EvaluationData): Report {
  const candidates = data.evaluations.map(eval => ({
    text: eval.candidate,
    reference: eval.reference,
    section: eval.section,
  }))

  const batchResult = batchEvaluate(candidates)

  const individualResults: EvaluationOutput[] = batchResult.results.map(
    (result, index) => ({
      name: data.evaluations[index]?.name || `evaluation-${index + 1}`,
      rougeScores: result.rougeScores,
      perplexity: result.perplexity,
      section: result.section,
    })
  )

  return {
    individualResults,
    summary: {
      totalEvaluations: batchResult.totalEvaluations,
      evaluationsWithRouge: batchResult.results.filter(
        r => r.rougeScores !== undefined
      ).length,
      averageRouge1: batchResult.averageRouge1,
      averageRouge2: batchResult.averageRouge2,
      averageRougeL: batchResult.averageRougeL,
      averagePerplexity: batchResult.averagePerplexity,
    },
  }
}

/**
 * Format report as human-readable text
 */
function formatReport(report: Report): string {
  const lines: string[] = []
  lines.push('='.repeat(80))
  lines.push('AI Metrics Evaluation Report')
  lines.push('='.repeat(80))
  lines.push('')

  // Summary
  lines.push('Summary:')
  lines.push(`  Total Evaluations: ${report.summary.totalEvaluations}`)
  lines.push(
    `  Evaluations with ROUGE: ${report.summary.evaluationsWithRouge}`
  )
  lines.push('')
  lines.push('Average Scores:')
  if (report.summary.evaluationsWithRouge > 0) {
    lines.push(
      `  ROUGE-1 F1: ${report.summary.averageRouge1.toFixed(4)}`
    )
    lines.push(
      `  ROUGE-2 F1: ${report.summary.averageRouge2.toFixed(4)}`
    )
    lines.push(
      `  ROUGE-L F1: ${report.summary.averageRougeL.toFixed(4)}`
    )
  }
  lines.push(
    `  Perplexity: ${isFinite(report.summary.averagePerplexity) ? report.summary.averagePerplexity.toFixed(2) : 'Infinity'}`
  )
  lines.push('')

  // Individual results
  lines.push('Individual Results:')
  lines.push('-'.repeat(80))
  for (const result of report.individualResults) {
    lines.push(`\n${result.name}:`)
    if (result.section) {
      lines.push(`  Section: ${result.section}`)
    }
    if (result.rougeScores) {
      lines.push('  ROUGE Scores:')
      lines.push(
        `    ROUGE-1: P=${result.rougeScores.rouge1.precision.toFixed(4)}, R=${result.rougeScores.rouge1.recall.toFixed(4)}, F1=${result.rougeScores.rouge1.f1.toFixed(4)}`
      )
      lines.push(
        `    ROUGE-2: P=${result.rougeScores.rouge2.precision.toFixed(4)}, R=${result.rougeScores.rouge2.recall.toFixed(4)}, F1=${result.rougeScores.rouge2.f1.toFixed(4)}`
      )
      lines.push(
        `    ROUGE-L: P=${result.rougeScores.rougeL.precision.toFixed(4)}, R=${result.rougeScores.rougeL.recall.toFixed(4)}, F1=${result.rougeScores.rougeL.f1.toFixed(4)}`
      )
    } else {
      lines.push('  ROUGE Scores: Not calculated (no reference provided)')
    }
    if (result.perplexity) {
      lines.push(
        `  Perplexity: ${isFinite(result.perplexity.perplexity) ? result.perplexity.perplexity.toFixed(2) : 'Infinity'}`
      )
      lines.push(`  Token Count: ${result.perplexity.tokenCount}`)
    }
  }

  return lines.join('\n')
}

/**
 * Save report to file
 */
function saveReport(report: Report, outputPath: string, format: 'json' | 'text' = 'json'): void {
  if (format === 'json') {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`Report saved to ${outputPath} (JSON)`)
  } else {
    const textReport = formatReport(report)
    fs.writeFileSync(outputPath, textReport, 'utf-8')
    console.log(`Report saved to ${outputPath} (Text)`)
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: ts-node scripts/evaluate-ai-metrics.ts <input-file.json> [output-file] [--format=json|text]')
    console.error('')
    console.error('Example:')
    console.error('  ts-node scripts/evaluate-ai-metrics.ts evaluations.json report.json')
    console.error('  ts-node scripts/evaluate-ai-metrics.ts evaluations.json report.txt --format=text')
    process.exit(1)
  }

  const inputFile = args[0]
  const outputFile = args[1] || inputFile.replace('.json', '-report.json')
  const formatArg = args.find(arg => arg.startsWith('--format='))
  const format = formatArg?.split('=')[1] === 'text' ? 'text' : 'json'

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file ${inputFile} does not exist`)
    process.exit(1)
  }

  console.log(`Loading evaluation data from ${inputFile}...`)
  const data = loadEvaluationData(inputFile)

  console.log(`Evaluating ${data.evaluations.length} cases...`)
  const report = evaluateAll(data)

  // Print summary to console
  console.log('\n' + formatReport(report))

  // Save report
  saveReport(report, outputFile, format)
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { evaluateAll, formatReport, loadEvaluationData }

