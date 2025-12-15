/**
 * Text-based Emotional Analysis Service
 * 
 * This service analyzes emotions from text without requiring Hume API.
 * Uses sentiment analysis and keyword-based emotion detection.
 */

export interface EmotionFeatures {
  [key: string]: number // Emotion name -> intensity (0-1)
}

export interface TextEmotionAnalysisResult {
  overallConfidence: number
  averageCalmness: number
  emotionalStability: number
  dominantEmotions: Array<{
    emotion: string
    averageIntensity: number
    occurrenceCount: number
  }>
  emotionalTrends: {
    improving: boolean
    declining: boolean
    stable: boolean
  }
  insights: string[]
  recommendations: string[]
  detailedBreakdown: Array<{
    messageIndex: number
    text: string
    emotions: EmotionFeatures
    confidenceScore: number
    emotionalState: 'confident' | 'nervous' | 'calm' | 'engaged' | 'uncertain'
  }>
}

export interface TranscriptMessage {
  speaker: 'interviewee' | 'interviewer'
  text: string
}

/**
 * Emotion keywords and their weights
 */
const emotionKeywords: Record<string, { words: string[]; weight: number }> = {
  confidence: {
    words: [
      'confident', 'sure', 'certain', 'definitely', 'absolutely', 'expertise',
      'experience', 'successful', 'accomplished', 'achieved', 'led', 'built',
      'implemented', 'designed', 'developed', 'expert', 'proficient', 'skilled',
      'strong', 'solid', 'deep', 'comprehensive', 'thorough', 'extensive'
    ],
    weight: 1.0
  },
  nervousness: {
    words: [
      'um', 'uh', 'well', 'maybe', 'perhaps', 'not sure', 'uncertain',
      'think', 'guess', 'probably', 'might', 'could', 'hesitate', 'stumble',
      'unsure', 'doubt', 'worry', 'anxious', 'nervous', 'afraid', 'scared'
    ],
    weight: 1.0
  },
  calmness: {
    words: [
      'calm', 'relaxed', 'comfortable', 'at ease', 'peaceful', 'steady',
      'composed', 'collected', 'clear', 'focused', 'balanced', 'stable'
    ],
    weight: 0.8
  },
  engagement: {
    words: [
      'interested', 'excited', 'curious', 'eager', 'enthusiastic', 'passionate',
      'motivated', 'inspired', 'fascinated', 'engaged', 'involved', 'active',
      'questions', 'wonder', 'explore', 'learn', 'discover'
    ],
    weight: 0.9
  },
  interest: {
    words: [
      'interesting', 'curious', 'wonder', 'want to know', 'would like',
      'fascinated', 'intrigued', 'attracted', 'appealing', 'appeal', 'drawn'
    ],
    weight: 0.8
  },
  anxiety: {
    words: [
      'anxious', 'worried', 'concerned', 'stressed', 'pressure', 'pressure',
      'nervous', 'tense', 'uneasy', 'apprehensive', 'fearful', 'panicked'
    ],
    weight: 1.0
  },
  enthusiasm: {
    words: [
      'excited', 'enthusiastic', 'thrilled', 'eager', 'passionate', 'energetic',
      'vibrant', 'dynamic', 'lively', 'animated', 'zealous', 'ardent'
    ],
    weight: 0.9
  }
}

/**
 * Sentiment analysis based on text patterns
 */
function analyzeSentiment(text: string): { score: number; magnitude: number } {
  const lowerText = text.toLowerCase()
  
  // Positive indicators
  const positiveWords = [
    'excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic',
    'successful', 'achieved', 'accomplished', 'improved', 'increased',
    'solved', 'optimized', 'enhanced', 'delivered', 'exceeded'
  ]
  
  // Negative indicators
  const negativeWords = [
    'difficult', 'challenging', 'problem', 'issue', 'failed', 'struggled',
    'hard', 'tough', 'complex', 'complicated', 'error', 'bug', 'broken'
  ]
  
  // Uncertainty indicators
  const uncertaintyWords = [
    'maybe', 'perhaps', 'might', 'could', 'possibly', 'probably',
    'think', 'guess', 'not sure', 'uncertain', 'unsure'
  ]
  
  let positiveScore = 0
  let negativeScore = 0
  let uncertaintyScore = 0
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore += 1
  })
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore += 1
  })
  
  uncertaintyWords.forEach(word => {
    if (lowerText.includes(word)) uncertaintyScore += 1
  })
  
  // Calculate sentiment score (-1 to 1)
  const totalWords = positiveScore + negativeScore + uncertaintyScore
  if (totalWords === 0) return { score: 0, magnitude: 0 }
  
  const score = (positiveScore - negativeScore - uncertaintyScore * 0.5) / Math.max(totalWords, 1)
  const magnitude = Math.min(totalWords / 10, 1) // Normalize magnitude
  
  return { score, magnitude }
}

/**
 * Extract emotion features from text
 */
function extractEmotions(text: string): EmotionFeatures {
  const lowerText = text.toLowerCase()
  const emotions: EmotionFeatures = {}
  
  // Analyze each emotion category
  Object.entries(emotionKeywords).forEach(([emotion, { words, weight }]) => {
    let count = 0
    words.forEach(word => {
      if (lowerText.includes(word)) {
        count += 1
      }
    })
    
    if (count > 0) {
      // Calculate intensity based on keyword matches
      const intensity = Math.min((count / words.length) * weight, 1.0)
      emotions[emotion] = intensity
    }
  })
  
  // Analyze sentiment
  const sentiment = analyzeSentiment(text)
  
  // Map sentiment to confidence and calmness
  if (sentiment.score > 0.3) {
    emotions.confidence = Math.max(emotions.confidence || 0, 0.6 + sentiment.score * 0.3)
    emotions.calmness = Math.max(emotions.calmness || 0, 0.5 + sentiment.score * 0.2)
  } else if (sentiment.score < -0.3) {
    emotions.nervousness = Math.max(emotions.nervousness || 0, 0.5 + Math.abs(sentiment.score) * 0.3)
    emotions.anxiety = Math.max(emotions.anxiety || 0, 0.4 + Math.abs(sentiment.score) * 0.2)
    emotions.confidence = Math.min(emotions.confidence || 0.5, 0.4 - Math.abs(sentiment.score) * 0.2)
  }
  
  // Detect engagement from question words
  if (/\b(what|how|why|when|where|can|could|would|should)\b/i.test(text)) {
    emotions.engagement = Math.max(emotions.engagement || 0, 0.6)
    emotions.interest = Math.max(emotions.interest || 0, 0.5)
  }
  
  // Detect confidence from statement patterns
  const confidentPatterns = [
    /\b(I (have|built|created|designed|implemented|led|achieved|accomplished))\b/i,
    /\b(I (am|was) (an|a) (expert|senior|lead|experienced))\b/i,
    /\b(years? of experience)\b/i,
    /\b(successfully|effectively|efficiently)\b/i
  ]
  
  confidentPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      emotions.confidence = Math.max(emotions.confidence || 0, 0.7)
    }
  })
  
  // Detect nervousness from filler words and uncertainty
  const fillerWordCount = (text.match(/\b(um|uh|well|like|you know)\b/gi) || []).length
  if (fillerWordCount > 0) {
    emotions.nervousness = Math.max(emotions.nervousness || 0, Math.min(fillerWordCount * 0.2, 0.8))
    emotions.confidence = Math.max(0, (emotions.confidence || 0.5) - fillerWordCount * 0.1)
  }
  
  // Normalize all emotions to 0-1 range
  Object.keys(emotions).forEach(key => {
    emotions[key] = Math.min(Math.max(emotions[key], 0), 1)
  })
  
  // Ensure at least some baseline emotions
  if (Object.keys(emotions).length === 0) {
    emotions.confidence = 0.5
    emotions.calmness = 0.5
  }
  
  return emotions
}

/**
 * Analyzes emotional features from interview transcript (text-based)
 */
export function analyzeTextEmotions(
  messages: TranscriptMessage[]
): TextEmotionAnalysisResult {
  const intervieweeMessages = messages.filter(
    m => m.speaker === 'interviewee'
  )

  if (intervieweeMessages.length === 0) {
    return {
      overallConfidence: 0,
      averageCalmness: 0,
      emotionalStability: 0,
      dominantEmotions: [],
      emotionalTrends: {
        improving: false,
        declining: false,
        stable: true,
      },
      insights: ['No interviewee messages available for analysis'],
      recommendations: ['Ensure interview transcript contains interviewee responses'],
      detailedBreakdown: [],
    }
  }

  // Extract emotions from each message
  const messagesWithEmotions = intervieweeMessages.map(msg => ({
    ...msg,
    emotionFeatures: extractEmotions(msg.text),
  }))

  // Calculate overall metrics
  const confidenceScores = messagesWithEmotions.map(
    m => m.emotionFeatures.confidence ?? 0
  )
  const calmnessScores = messagesWithEmotions.map(
    m => m.emotionFeatures.calmness ?? 0
  )

  const overallConfidence =
    confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
  const averageCalmness =
    calmnessScores.reduce((a, b) => a + b, 0) / calmnessScores.length

  // Calculate emotional stability (variance in confidence)
  const meanConfidence = overallConfidence
  const variance =
    confidenceScores.reduce(
      (sum, score) => sum + Math.pow(score - meanConfidence, 2),
      0
    ) / confidenceScores.length
  const emotionalStability = 1 - Math.min(variance * 4, 1) // Normalize to 0-1

  // Find dominant emotions
  const emotionMap = new Map<string, { total: number; count: number }>()
  messagesWithEmotions.forEach(m => {
    Object.entries(m.emotionFeatures).forEach(([emotion, intensity]) => {
      if (!emotionMap.has(emotion)) {
        emotionMap.set(emotion, { total: 0, count: 0 })
      }
      const entry = emotionMap.get(emotion)!
      entry.total += intensity
      entry.count += 1
    })
  })

  const dominantEmotions = Array.from(emotionMap.entries())
    .map(([emotion, data]) => ({
      emotion,
      averageIntensity: data.total / data.count,
      occurrenceCount: data.count,
    }))
    .sort((a, b) => b.averageIntensity - a.averageIntensity)
    .slice(0, 5)

  // Analyze trends
  const firstHalf = confidenceScores.slice(
    0,
    Math.floor(confidenceScores.length / 2)
  )
  const secondHalf = confidenceScores.slice(
    Math.floor(confidenceScores.length / 2)
  )
  const firstHalfAvg =
    firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondHalfAvg =
    secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  const trendDiff = secondHalfAvg - firstHalfAvg

  const emotionalTrends = {
    improving: trendDiff > 0.1,
    declining: trendDiff < -0.1,
    stable: Math.abs(trendDiff) <= 0.1,
  }

  // Generate insights
  const insights: string[] = []
  if (overallConfidence >= 0.7) {
    insights.push('High confidence level detected throughout the interview')
  } else if (overallConfidence >= 0.5) {
    insights.push('Moderate confidence level with room for improvement')
  } else {
    insights.push('Low confidence detected - candidate may need more preparation')
  }

  if (averageCalmness >= 0.7) {
    insights.push('Candidate maintained good composure during the interview')
  } else if (averageCalmness < 0.5) {
    insights.push('Signs of nervousness or stress detected')
  }

  if (emotionalStability >= 0.7) {
    insights.push('Emotional state remained stable throughout')
  } else {
    insights.push('Significant emotional fluctuations observed')
  }

  if (emotionalTrends.improving) {
    insights.push('Confidence improved as the interview progressed')
  } else if (emotionalTrends.declining) {
    insights.push('Confidence decreased during the interview')
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (overallConfidence < 0.6) {
    recommendations.push('Practice more to build confidence in answering questions')
  }
  if (averageCalmness < 0.6) {
    recommendations.push('Work on stress management and relaxation techniques')
  }
  if (emotionalStability < 0.6) {
    recommendations.push('Focus on maintaining consistent emotional state')
  }
  if (emotionalTrends.declining) {
    recommendations.push(
      'Prepare for longer interviews to maintain energy and confidence'
    )
  }

  // Create detailed breakdown
  const detailedBreakdown = messagesWithEmotions.map((m, index) => {
    const confidence = m.emotionFeatures.confidence ?? 0
    const calmness = m.emotionFeatures.calmness ?? 0
    const nervousness =
      m.emotionFeatures.nervousness ?? m.emotionFeatures.anxiety ?? 0

    let emotionalState:
      | 'confident'
      | 'nervous'
      | 'calm'
      | 'engaged'
      | 'uncertain'
    if (confidence >= 0.7 && nervousness < 0.3) {
      emotionalState = 'confident'
    } else if (nervousness >= 0.5 || confidence < 0.4) {
      emotionalState = 'nervous'
    } else if (calmness >= 0.7) {
      emotionalState = 'calm'
    } else if (
      (m.emotionFeatures.interest ?? m.emotionFeatures.engagement ?? 0) > 0.6
    ) {
      emotionalState = 'engaged'
    } else {
      emotionalState = 'uncertain'
    }

    return {
      messageIndex: index + 1,
      text: m.text.substring(0, 100) + (m.text.length > 100 ? '...' : ''),
      emotions: m.emotionFeatures,
      confidenceScore: confidence,
      emotionalState,
    }
  })

  return {
    overallConfidence,
    averageCalmness,
    emotionalStability,
    dominantEmotions,
    emotionalTrends,
    insights,
    recommendations,
    detailedBreakdown,
  }
}

/**
 * Formats the analysis result as a readable report
 */
export function formatTextEmotionAnalysisReport(
  analysis: TextEmotionAnalysisResult
): string {
  let report = '# Text-Based Emotional Analysis Report\n\n'
  
  report += '## Overall Metrics\n\n'
  report += `- **Overall Confidence**: ${(analysis.overallConfidence * 100).toFixed(1)}%\n`
  report += `- **Average Calmness**: ${(analysis.averageCalmness * 100).toFixed(1)}%\n`
  report += `- **Emotional Stability**: ${(analysis.emotionalStability * 100).toFixed(1)}%\n\n`

  report += '## Dominant Emotions\n\n'
  if (analysis.dominantEmotions.length > 0) {
    analysis.dominantEmotions.forEach(emotion => {
      report += `- **${emotion.emotion}**: ${(emotion.averageIntensity * 100).toFixed(1)}% (appeared ${emotion.occurrenceCount} times)\n`
    })
  } else {
    report += 'No dominant emotions detected.\n'
  }
  report += '\n'

  report += '## Emotional Trends\n\n'
  if (analysis.emotionalTrends.improving) {
    report += '✅ **Improving**: Confidence increased during the interview\n'
  } else if (analysis.emotionalTrends.declining) {
    report += '⚠️ **Declining**: Confidence decreased during the interview\n'
  } else {
    report += '➡️ **Stable**: Confidence remained relatively constant\n'
  }
  report += '\n'

  report += '## Insights\n\n'
  analysis.insights.forEach(insight => {
    report += `- ${insight}\n`
  })
  report += '\n'

  report += '## Recommendations\n\n'
  if (analysis.recommendations.length > 0) {
    analysis.recommendations.forEach(rec => {
      report += `- ${rec}\n`
    })
  } else {
    report += '- No specific recommendations at this time.\n'
  }
  report += '\n'

  report += '## Detailed Breakdown\n\n'
  analysis.detailedBreakdown.forEach(entry => {
    report += `### Message ${entry.messageIndex}\n\n`
    report += `**Text**: "${entry.text}"\n\n`
    report += `**Emotional State**: ${entry.emotionalState}\n`
    report += `**Confidence Score**: ${(entry.confidenceScore * 100).toFixed(1)}%\n\n`
    report += `**Emotions**:\n`
    Object.entries(entry.emotions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([emotion, intensity]) => {
        report += `- ${emotion}: ${(intensity * 100).toFixed(1)}%\n`
      })
    report += '\n'
  })

  return report
}

