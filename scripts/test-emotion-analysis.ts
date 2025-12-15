#!/usr/bin/env tsx

/**
 * Test script for emotional analysis
 * 
 * Usage:
 *   ts-node scripts/test-emotion-analysis.ts [humeChatId]
 * 
 * If humeChatId is provided, it will fetch real data from Hume API.
 * Otherwise, it will use sample test data.
 */

import * as fs from 'fs'
import * as path from 'path'
import { analyzeEmotions, formatEmotionAnalysisReport, TranscriptMessage } from '../src/services/ai/emotion-analysis'

interface TestCase {
  name: string
  messages: TranscriptMessage[]
}

// Sample test data
const sampleTestCases: TestCase[] = [
  {
    name: 'High Confidence Interview',
    messages: [
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
    ],
  },
  {
    name: 'Nervous Interview',
    messages: [
      {
        speaker: 'interviewer',
        text: 'Hello, can you tell me about your experience?',
      },
      {
        speaker: 'interviewee',
        text: 'Um, well, I have some experience with, uh, programming and stuff.',
        emotionFeatures: {
          confidence: 0.3,
          calmness: 0.4,
          nervousness: 0.7,
          anxiety: 0.6,
        },
      },
      {
        speaker: 'interviewer',
        text: 'Can you be more specific?',
      },
      {
        speaker: 'interviewee',
        text: 'I mean, I worked with JavaScript and React, but I am not sure if that is what you are looking for.',
        emotionFeatures: {
          confidence: 0.35,
          calmness: 0.35,
          nervousness: 0.75,
          anxiety: 0.65,
        },
      },
      {
        speaker: 'interviewer',
        text: 'That is helpful. Can you describe a challenging project you worked on?',
      },
      {
        speaker: 'interviewee',
        text: 'Well, there was this one project, but I am not sure if it was that challenging. I guess it was okay.',
        emotionFeatures: {
          confidence: 0.4,
          calmness: 0.45,
          nervousness: 0.65,
          anxiety: 0.6,
        },
      },
    ],
  },
  {
    name: 'Improving Confidence Interview',
    messages: [
      {
        speaker: 'interviewer',
        text: 'Tell me about yourself.',
      },
      {
        speaker: 'interviewee',
        text: 'I am a developer with a few years of experience.',
        emotionFeatures: {
          confidence: 0.5,
          calmness: 0.6,
          nervousness: 0.4,
        },
      },
      {
        speaker: 'interviewer',
        text: 'What technologies do you work with?',
      },
      {
        speaker: 'interviewee',
        text: 'I work with React, TypeScript, and Node.js primarily.',
        emotionFeatures: {
          confidence: 0.6,
          calmness: 0.65,
          nervousness: 0.3,
        },
      },
      {
        speaker: 'interviewer',
        text: 'Can you describe a project you are proud of?',
      },
      {
        speaker: 'interviewee',
        text: 'I built a full-stack application that helped improve user engagement by 40%. It was a great learning experience.',
        emotionFeatures: {
          confidence: 0.75,
          calmness: 0.75,
          engagement: 0.7,
          interest: 0.65,
        },
      },
    ],
  },
]

async function testWithHumeChatId(humeChatId: string) {
  console.log(`Fetching data from Hume API for chat ID: ${humeChatId}...\n`)
  
  try {
    // Dynamically import to avoid requiring env vars when not needed
    const { fetchChatMessages } = await import('../src/services/hume/lib/api')
    const messages = await fetchChatMessages(humeChatId)
    
    const formattedMessages: TranscriptMessage[] = messages
      .map(message => {
        if (message.type !== 'USER_MESSAGE' && message.type !== 'AGENT_MESSAGE') {
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

    if (formattedMessages.length === 0) {
      console.error('No messages found in the chat.')
      return
    }

    console.log(`Found ${formattedMessages.length} messages\n`)
    console.log('Running emotional analysis...\n')

    const analysis = analyzeEmotions(formattedMessages)
    const report = formatEmotionAnalysisReport(analysis)

    console.log(report)

    // Save to file
    const outputPath = path.join(process.cwd(), `emotion-analysis-${humeChatId}.md`)
    fs.writeFileSync(outputPath, report)
    console.log(`\nReport saved to: ${outputPath}`)
  } catch (error) {
    console.error('Error fetching from Hume API:', error)
    process.exit(1)
  }
}

async function testWithSampleData() {
  console.log('Running emotional analysis tests with sample data...\n\n')

  const results: Array<{ name: string; report: string }> = []

  for (const testCase of sampleTestCases) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Test Case: ${testCase.name}`)
    console.log('='.repeat(60) + '\n')

    const analysis = analyzeEmotions(testCase.messages)
    const report = formatEmotionAnalysisReport(analysis)

    console.log(report)
    results.push({ name: testCase.name, report })
  }

  // Save all results to a file
  const outputPath = path.join(process.cwd(), 'emotion-analysis-test-results.md')
  let combinedReport = '# Emotional Analysis Test Results\n\n'
  results.forEach((result, index) => {
    combinedReport += `\n## Test Case ${index + 1}: ${result.name}\n\n`
    combinedReport += result.report
    combinedReport += '\n---\n'
  })

  fs.writeFileSync(outputPath, combinedReport)
  console.log(`\n\nAll test results saved to: ${outputPath}`)
}

async function main() {
  const args = process.argv.slice(2)
  const humeChatId = args[0]

  if (humeChatId) {
    await testWithHumeChatId(humeChatId)
  } else {
    await testWithSampleData()
  }
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})

