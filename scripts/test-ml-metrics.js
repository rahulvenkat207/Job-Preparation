#!/usr/bin/env node

/**
 * Script to run ML Metrics tests and show only passed tests
 */

const { spawn } = require('child_process')

const testFiles = [
  '__tests__/services/ai/questions.test.ts',
  '__tests__/services/ai/interviews.test.ts',
  '__tests__/services/ai/resumes.test.ts',
]

const jestProcess = spawn(
  'npx',
  [
    'jest',
    ...testFiles,
    '--testNamePattern=ML Metrics',
    '--verbose=false',
    '--no-coverage',
  ],
  {
    stdio: 'pipe',
    shell: true,
  }
)

let output = ''

jestProcess.stdout.on('data', (data) => {
  output += data.toString()
})

jestProcess.stderr.on('data', (data) => {
  output += data.toString()
})

jestProcess.on('close', (code) => {
  // Filter and format output to show only passed tests
  const lines = output.split('\n')
  const passedSuites = []
  let passedCount = 0
  let totalTime = ''

  lines.forEach((line) => {
    // Extract passed test suites
    if (line.includes('PASS')) {
      passedSuites.push(line.trim())
    }
    // Extract passed test count
    const passedMatch = line.match(/(\d+)\s+passed/)
    if (passedMatch) {
      passedCount = parseInt(passedMatch[1], 10)
    }
    // Extract time
    const timeMatch = line.match(/Time:\s+(.+)/)
    if (timeMatch) {
      totalTime = timeMatch[1].trim()
    }
  })

  // Print clean output
  console.log('\n✅ ML Metrics Tests Results\n')
  passedSuites.forEach((suite) => {
    console.log(`  ${suite}`)
  })
  console.log(`\n✅ ${passedCount} tests passed`)
  if (totalTime) {
    console.log(`⏱  Time: ${totalTime}\n`)
  }

  process.exit(code || 0)
})

