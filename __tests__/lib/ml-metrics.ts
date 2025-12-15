/**
 * ML Metrics for evaluating AI-generated content
 * Implements ROUGE and Perplexity metrics
 */

export interface ROUGEScores {
  rouge1: {
    precision: number
    recall: number
    f1: number
  }
  rouge2: {
    precision: number
    recall: number
    f1: number
  }
  rougeL: {
    precision: number
    recall: number
    f1: number
  }
}

export interface PerplexityResult {
  perplexity: number
  averageLogProbability: number
  tokenCount: number
}

/**
 * Tokenize text into words (simple whitespace-based tokenization)
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
}

/**
 * Generate n-grams from a token array
 */
function generateNGrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = []
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '))
  }
  return ngrams
}

/**
 * Calculate precision, recall, and F1 score
 */
function calculatePrecisionRecallF1(
  candidateNGrams: string[],
  referenceNGrams: string[]
): { precision: number; recall: number; f1: number } {
  if (referenceNGrams.length === 0) {
    return { precision: 0, recall: 0, f1: 0 }
  }

  const candidateSet = new Set(candidateNGrams)
  const referenceSet = new Set(referenceNGrams)

  let matches = 0
  for (const ngram of candidateSet) {
    if (referenceSet.has(ngram)) {
      matches++
    }
  }

  const precision = candidateSet.size > 0 ? matches / candidateSet.size : 0
  const recall = matches / referenceSet.size
  const f1 =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0

  return { precision, recall, f1 }
}

/**
 * Calculate longest common subsequence (LCS) length
 */
function lcsLength(seq1: string[], seq2: string[]): number {
  const m = seq1.length
  const n = seq2.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (seq1[i - 1] === seq2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculate ROUGE scores between candidate and reference text(s)
 * Supports ROUGE-1 (unigrams), ROUGE-2 (bigrams), and ROUGE-L (LCS)
 *
 * @param candidate - The generated text to evaluate
 * @param references - One or more reference texts (ground truth)
 * @returns ROUGE scores for ROUGE-1, ROUGE-2, and ROUGE-L
 */
export function calculateROUGE(
  candidate: string,
  references: string | string[]
): ROUGEScores {
  const refs = Array.isArray(references) ? references : [references]

  if (refs.length === 0 || candidate.trim().length === 0) {
    return {
      rouge1: { precision: 0, recall: 0, f1: 0 },
      rouge2: { precision: 0, recall: 0, f1: 0 },
      rougeL: { precision: 0, recall: 0, f1: 0 },
    }
  }

  const candidateTokens = tokenize(candidate)
  const candidateUnigrams = generateNGrams(candidateTokens, 1)
  const candidateBigrams = generateNGrams(candidateTokens, 2)

  // Calculate ROUGE-1 and ROUGE-2 (best match across all references)
  let bestRouge1 = { precision: 0, recall: 0, f1: 0 }
  let bestRouge2 = { precision: 0, recall: 0, f1: 0 }
  let bestRougeL = { precision: 0, recall: 0, f1: 0 }

  for (const reference of refs) {
    const refTokens = tokenize(reference)
    const refUnigrams = generateNGrams(refTokens, 1)
    const refBigrams = generateNGrams(refTokens, 2)

    // ROUGE-1
    const rouge1 = calculatePrecisionRecallF1(candidateUnigrams, refUnigrams)
    if (rouge1.f1 > bestRouge1.f1) {
      bestRouge1 = rouge1
    }

    // ROUGE-2
    const rouge2 = calculatePrecisionRecallF1(candidateBigrams, refBigrams)
    if (rouge2.f1 > bestRouge2.f1) {
      bestRouge2 = rouge2
    }

    // ROUGE-L (Longest Common Subsequence)
    const lcsLen = lcsLength(candidateTokens, refTokens)
    const rougeLPrecision =
      candidateTokens.length > 0 ? lcsLen / candidateTokens.length : 0
    const rougeLRecall =
      refTokens.length > 0 ? lcsLen / refTokens.length : 0
    const rougeLF1 =
      rougeLPrecision + rougeLRecall > 0
        ? (2 * rougeLPrecision * rougeLRecall) /
          (rougeLPrecision + rougeLRecall)
        : 0

    if (rougeLF1 > bestRougeL.f1) {
      bestRougeL = {
        precision: rougeLPrecision,
        recall: rougeLRecall,
        f1: rougeLF1,
      }
    }
  }

  return {
    rouge1: bestRouge1,
    rouge2: bestRouge2,
    rougeL: bestRougeL,
  }
}

/**
 * Calculate perplexity using a simple n-gram language model
 * This is a simplified version - for production, use model log probabilities
 *
 * @param text - The text to evaluate
 * @param ngramOrder - The order of n-grams to use (default: 3 for trigrams)
 * @returns Perplexity score (lower is better)
 */
export function calculatePerplexity(
  text: string,
  ngramOrder: number = 3
): PerplexityResult {
  if (text.trim().length === 0) {
    return {
      perplexity: Infinity,
      averageLogProbability: -Infinity,
      tokenCount: 0,
    }
  }

  const tokens = tokenize(text)

  if (tokens.length < ngramOrder) {
    // For very short texts, use unigrams
    return calculateUnigramPerplexity(tokens)
  }

  // Build n-gram model
  const ngramCounts = new Map<string, number>()
  const contextCounts = new Map<string, number>()

  for (let i = 0; i <= tokens.length - ngramOrder; i++) {
    const ngram = tokens.slice(i, i + ngramOrder).join(' ')
    const context = tokens.slice(i, i + ngramOrder - 1).join(' ')

    ngramCounts.set(ngram, (ngramCounts.get(ngram) || 0) + 1)
    contextCounts.set(context, (contextCounts.get(context) || 0) + 1)
  }

  // Calculate log probabilities
  let totalLogProb = 0
  let validNGrams = 0

  for (let i = 0; i <= tokens.length - ngramOrder; i++) {
    const ngram = tokens.slice(i, i + ngramOrder).join(' ')
    const context = tokens.slice(i, i + ngramOrder - 1).join(' ')

    const ngramCount = ngramCounts.get(ngram) || 0
    const contextCount = contextCounts.get(context) || 0

    // Add-one smoothing
    const vocabularySize = ngramCounts.size
    const prob =
      (ngramCount + 1) / (contextCount + vocabularySize + 1)
    const logProb = Math.log(prob)

    totalLogProb += logProb
    validNGrams++
  }

  const averageLogProbability =
    validNGrams > 0 ? totalLogProb / validNGrams : -Infinity
  const perplexity = Math.exp(-averageLogProbability)

  return {
    perplexity: isFinite(perplexity) ? perplexity : Infinity,
    averageLogProbability: isFinite(averageLogProbability)
      ? averageLogProbability
      : -Infinity,
    tokenCount: tokens.length,
  }
}

/**
 * Calculate unigram perplexity for very short texts
 */
function calculateUnigramPerplexity(tokens: string[]): PerplexityResult {
  if (tokens.length === 0) {
    return {
      perplexity: Infinity,
      averageLogProbability: -Infinity,
      tokenCount: 0,
    }
  }

  const wordCounts = new Map<string, number>()
  for (const token of tokens) {
    wordCounts.set(token, (wordCounts.get(token) || 0) + 1)
  }

  const vocabularySize = wordCounts.size
  let totalLogProb = 0

  for (const token of tokens) {
    const count = wordCounts.get(token) || 0
    // Add-one smoothing
    const prob = (count + 1) / (tokens.length + vocabularySize + 1)
    const logProb = Math.log(prob)
    totalLogProb += logProb
  }

  const averageLogProbability = totalLogProb / tokens.length
  const perplexity = Math.exp(-averageLogProbability)

  return {
    perplexity: isFinite(perplexity) ? perplexity : Infinity,
    averageLogProbability: isFinite(averageLogProbability)
      ? averageLogProbability
      : -Infinity,
    tokenCount: tokens.length,
  }
}

/**
 * Calculate perplexity from model log probabilities
 * Use this when you have access to the model's token probabilities
 *
 * @param logProbabilities - Array of log probabilities for each token
 * @returns Perplexity score
 */
export function calculatePerplexityFromLogProbs(
  logProbabilities: number[]
): PerplexityResult {
  if (logProbabilities.length === 0) {
    return {
      perplexity: Infinity,
      averageLogProbability: -Infinity,
      tokenCount: 0,
    }
  }

  const validProbs = logProbabilities.filter(p => isFinite(p))
  if (validProbs.length === 0) {
    return {
      perplexity: Infinity,
      averageLogProbability: -Infinity,
      tokenCount: logProbabilities.length,
    }
  }

  const averageLogProbability =
    validProbs.reduce((sum, p) => sum + p, 0) / validProbs.length
  const perplexity = Math.exp(-averageLogProbability)

  return {
    perplexity: isFinite(perplexity) ? perplexity : Infinity,
    averageLogProbability: isFinite(averageLogProbability)
      ? averageLogProbability
      : -Infinity,
    tokenCount: logProbabilities.length,
  }
}

