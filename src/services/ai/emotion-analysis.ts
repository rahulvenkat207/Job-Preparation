/**
 * Emotional Analysis Service
 * 
 * This service analyzes emotion features from Hume AI and provides
 * detailed insights and metrics for testing and evaluation purposes.
 */

export interface EmotionFeatures {
  [key: string]: number // Emotion name -> intensity (0-1)
}

export interface EmotionAnalysisResult {
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
  emotionFeatures?: EmotionFeatures
}

/**
 * Analyzes emotional features from interview transcript
 */
export function analyzeEmotions(
  messages: TranscriptMessage[]
): EmotionAnalysisResult {
  const intervieweeMessages = messages.filter(
    m => m.speaker === 'interviewee' && m.emotionFeatures
  ) as Array<TranscriptMessage & { emotionFeatures: EmotionFeatures }>

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
      insights: ['No emotional data available for analysis'],
      recommendations: ['Ensure emotion features are captured for interviewee messages'],
      detailedBreakdown: [],
    }
  }

  // Calculate overall metrics
  const confidenceScores = intervieweeMessages.map(m =>
    m.emotionFeatures.confidence ?? 0
  )
  const calmnessScores = intervieweeMessages.map(m =>
    m.emotionFeatures.calmness ?? 0
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
  intervieweeMessages.forEach(m => {
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
  const firstHalf = confidenceScores.slice(0, Math.floor(confidenceScores.length / 2))
  const secondHalf = confidenceScores.slice(Math.floor(confidenceScores.length / 2))
  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
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
    recommendations.push('Prepare for longer interviews to maintain energy and confidence')
  }

  // Create detailed breakdown
  const detailedBreakdown = intervieweeMessages.map((m, index) => {
    const confidence = m.emotionFeatures.confidence ?? 0
    const calmness = m.emotionFeatures.calmness ?? 0
    const nervousness = m.emotionFeatures.nervousness ?? m.emotionFeatures.anxiety ?? 0

    let emotionalState: 'confident' | 'nervous' | 'calm' | 'engaged' | 'uncertain'
    if (confidence >= 0.7 && nervousness < 0.3) {
      emotionalState = 'confident'
    } else if (nervousness >= 0.5 || confidence < 0.4) {
      emotionalState = 'nervous'
    } else if (calmness >= 0.7) {
      emotionalState = 'calm'
    } else if (m.emotionFeatures.interest ?? m.emotionFeatures.engagement ?? 0 > 0.6) {
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
export function formatEmotionAnalysisReport(
  analysis: EmotionAnalysisResult
): string {
  let report = '# Emotional Analysis Report\n\n'
  
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

