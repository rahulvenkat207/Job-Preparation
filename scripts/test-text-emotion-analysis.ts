#!/usr/bin/env tsx

/**
 * Test script for text-based emotional analysis
 * 
 * Usage:
 *   npm run test:text-emotion-analysis
 * 
 * This script analyzes emotions from text without requiring Hume API.
 * It uses keyword-based sentiment analysis and pattern matching.
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  analyzeTextEmotions,
  formatTextEmotionAnalysisReport,
  TranscriptMessage,
} from '../src/services/ai/text-emotion-analysis'

interface TestCase {
  name: string
  messages: TranscriptMessage[]
}

// Sample test data - text only, no emotion features needed
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
        text: 'Hi, thank you for having me. I have five years of experience as a full-stack developer, primarily working with React, Node.js, and TypeScript. I recently led a team that built a scalable e-commerce platform that increased sales by 30%.',
      },
      {
        speaker: 'interviewer',
        text: 'That sounds impressive. Can you walk me through how you would approach building a real-time chat feature?',
      },
      {
        speaker: 'interviewee',
        text: 'Sure. I would start by choosing the right technology stack. For real-time communication, I would use WebSockets, probably with Socket.io for Node.js. I would design the architecture to handle message persistence, user presence, and scaling considerations. I would also implement proper error handling and reconnection logic.',
      },
      {
        speaker: 'interviewer',
        text: 'Great. Do you have any questions for us?',
      },
      {
        speaker: 'interviewee',
        text: 'Yes, I am curious about the team structure and what technologies the team is currently using. Also, what are the biggest technical challenges the team is facing right now?',
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
        text: 'Um, well, I have some experience with, uh, programming and stuff. I am not sure if that is what you are looking for, but I think I might be able to help.',
      },
      {
        speaker: 'interviewer',
        text: 'Can you be more specific?',
      },
      {
        speaker: 'interviewee',
        text: 'I mean, I worked with JavaScript and React, but I am not sure if that is what you are looking for. Maybe I could learn more if needed?',
      },
      {
        speaker: 'interviewer',
        text: 'That is helpful. Can you describe a challenging project you worked on?',
      },
      {
        speaker: 'interviewee',
        text: 'Well, there was this one project, but I am not sure if it was that challenging. I guess it was okay. I think I did a decent job, but maybe it could have been better.',
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
        text: 'I am a developer with a few years of experience. I have worked on some projects, but I am still learning.',
      },
      {
        speaker: 'interviewer',
        text: 'What technologies do you work with?',
      },
      {
        speaker: 'interviewee',
        text: 'I work with React, TypeScript, and Node.js primarily. I have built several applications using these technologies.',
      },
      {
        speaker: 'interviewer',
        text: 'Can you describe a project you are proud of?',
      },
      {
        speaker: 'interviewee',
        text: 'I built a full-stack application that helped improve user engagement by 40%. It was a great learning experience and I successfully implemented real-time features, optimized performance, and delivered it on time. The project received positive feedback from users.',
      },
    ],
  },
  {
    name: 'Engaged and Enthusiastic Interview',
    messages: [
      {
        speaker: 'interviewer',
        text: 'What interests you about this role?',
      },
      {
        speaker: 'interviewee',
        text: 'I am very excited about this opportunity! I have been following your company for a while and I am fascinated by the work you do. I am eager to contribute to innovative projects and learn from the experienced team.',
      },
      {
        speaker: 'interviewer',
        text: 'What questions do you have for us?',
      },
      {
        speaker: 'interviewee',
        text: 'I am curious about the development workflow and how the team collaborates. I would also like to know more about the technologies you are currently using and what challenges you are solving.',
      },
    ],
  },
]

async function testWithSampleData() {
  console.log('Running text-based emotional analysis tests...\n\n')

  const results: Array<{ name: string; report: string }> = []

  for (const testCase of sampleTestCases) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Test Case: ${testCase.name}`)
    console.log('='.repeat(60) + '\n')

    const analysis = analyzeTextEmotions(testCase.messages)
    const report = formatTextEmotionAnalysisReport(analysis)

    console.log(report)
    results.push({ name: testCase.name, report })
  }

  // Save all results to a file
  const outputPath = path.join(
    process.cwd(),
    'text-emotion-analysis-test-results.md'
  )
  let combinedReport = '# Text-Based Emotional Analysis Test Results\n\n'
  combinedReport +=
    'This report was generated using text-based emotion analysis (no Hume API required).\n\n'
  combinedReport +=
    'The analysis uses keyword matching, sentiment analysis, and pattern recognition to detect emotions.\n\n'
  combinedReport += '---\n\n'

  results.forEach((result, index) => {
    combinedReport += `\n## Test Case ${index + 1}: ${result.name}\n\n`
    combinedReport += result.report
    combinedReport += '\n---\n'
  })

  fs.writeFileSync(outputPath, combinedReport)
  console.log(`\n\nAll test results saved to: ${outputPath}`)
}

async function main() {
  await testWithSampleData()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})

