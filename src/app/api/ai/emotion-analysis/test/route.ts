import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser'
import { fetchChatMessages } from '@/services/hume/lib/api'
import {
  analyzeEmotions,
  formatEmotionAnalysisReport,
  TranscriptMessage,
} from '@/services/ai/emotion-analysis'

/**
 * POST /api/ai/emotion-analysis/test
 * 
 * Tests emotional analysis with either:
 * 1. A humeChatId (fetches real data from Hume)
 * 2. Sample test data (if no humeChatId provided)
 * 
 * Request body:
 * {
 *   humeChatId?: string  // Optional: if provided, fetches from Hume API
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getCurrentUser()
    if (userId == null) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { humeChatId } = body

    let messages: TranscriptMessage[] = []
    let source = 'sample'

    if (humeChatId) {
      // Fetch real data from Hume
      try {
        const humeMessages = await fetchChatMessages(humeChatId)
        messages = humeMessages
          .map(message => {
            if (
              message.type !== 'USER_MESSAGE' &&
              message.type !== 'AGENT_MESSAGE'
            ) {
              return null
            }
            if (message.messageText == null) return null

            return {
              speaker:
                message.type === 'USER_MESSAGE' ? 'interviewee' : 'interviewer',
              text: message.messageText,
              emotionFeatures:
                message.role === 'USER' ? message.emotionFeatures : undefined,
            }
          })
          .filter(f => f != null) as TranscriptMessage[]
        source = 'hume'
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to fetch data from Hume API', details: String(error) },
          { status: 500 }
        )
      }
    } else {
      // Use sample test data
      messages = [
        {
          speaker: 'interviewer',
          text: 'Hello, thank you for coming in today. Can you tell me a bit about yourself?',
        },
        {
          speaker: 'interviewee',
          text: 'Hi, thank you for having me. I have five years of experience as a full-stack developer, primarily working with React, Node.js, and TypeScript.',
          emotionFeatures: {
            confidence: 0.85,
            calmness: 0.8,
            engagement: 0.75,
            interest: 0.7,
          },
        },
        {
          speaker: 'interviewer',
          text: 'That sounds impressive. Can you walk me through how you would approach building a real-time chat feature?',
        },
        {
          speaker: 'interviewee',
          text: 'Sure. I would start by choosing the right technology stack. For real-time communication, I would use WebSockets, probably with Socket.io for Node.js.',
          emotionFeatures: {
            confidence: 0.9,
            calmness: 0.85,
            engagement: 0.8,
            interest: 0.75,
          },
        },
        {
          speaker: 'interviewer',
          text: 'Great. Do you have any questions for us?',
        },
        {
          speaker: 'interviewee',
          text: 'Yes, I am curious about the team structure and what technologies the team is currently using.',
          emotionFeatures: {
            confidence: 0.8,
            calmness: 0.75,
            engagement: 0.85,
            interest: 0.9,
          },
        },
      ]
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found for analysis' },
        { status: 400 }
      )
    }

    // Perform emotional analysis
    const analysis = analyzeEmotions(messages)
    const report = formatEmotionAnalysisReport(analysis)

    return NextResponse.json({
      success: true,
      source,
      messageCount: messages.length,
      analysis,
      report,
    })
  } catch (error) {
    console.error('Error in emotion analysis test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

