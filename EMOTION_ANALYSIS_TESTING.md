# Emotional Analysis Testing Tool

This tool provides comprehensive testing and analysis capabilities for emotional data from Hume AI interviews. It analyzes emotion features and provides detailed insights, metrics, and recommendations.

## Features

- **Emotional Metrics Analysis**: Calculates overall confidence, calmness, and emotional stability
- **Dominant Emotions Detection**: Identifies the most prominent emotions throughout the interview
- **Trend Analysis**: Detects whether confidence is improving, declining, or stable
- **Detailed Breakdown**: Provides per-message emotional analysis
- **Actionable Insights**: Generates insights and recommendations based on emotional patterns

## Components

### 1. Emotion Analysis Service (`src/services/ai/emotion-analysis.ts`)

Core service that performs emotional analysis on interview transcripts.

**Key Functions:**
- `analyzeEmotions(messages)`: Analyzes emotion features and returns comprehensive results
- `formatEmotionAnalysisReport(analysis)`: Formats analysis results as a markdown report

**Metrics Calculated:**
- Overall Confidence (0-1)
- Average Calmness (0-1)
- Emotional Stability (0-1)
- Dominant Emotions (top 5)
- Emotional Trends (improving/declining/stable)

### 2. Test Script (`scripts/test-emotion-analysis.ts`)

Standalone script for testing emotional analysis with sample data or real Hume chat data.

**Usage:**

```bash
# Test with sample data
npm run test:emotion-analysis

# Test with real Hume chat ID
npm run test:emotion-analysis <humeChatId>
```

**Output:**
- Console output with detailed analysis
- Markdown report file saved to project root

### 3. API Endpoint (`/api/ai/emotion-analysis/test`)

REST API endpoint for testing emotional analysis programmatically.

**Endpoint:** `POST /api/ai/emotion-analysis/test`

**Request Body:**
```json
{
  "humeChatId": "optional-hume-chat-id"
}
```

**Response:**
```json
{
  "success": true,
  "source": "hume" | "sample",
  "messageCount": 6,
  "analysis": {
    "overallConfidence": 0.85,
    "averageCalmness": 0.8,
    "emotionalStability": 0.9,
    "dominantEmotions": [...],
    "emotionalTrends": {...},
    "insights": [...],
    "recommendations": [...],
    "detailedBreakdown": [...]
  },
  "report": "# Emotional Analysis Report\n\n..."
}
```

## Example Usage

### Using the Test Script

```bash
# Run with sample test cases
npm run test:emotion-analysis

# Run with a real interview chat ID
npm run test:emotion-analysis abc123xyz
```

### Using the API Endpoint

```javascript
// Test with sample data
const response = await fetch('/api/ai/emotion-analysis/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})

const result = await response.json()
console.log(result.analysis)

// Test with real Hume chat ID
const response2 = await fetch('/api/ai/emotion-analysis/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ humeChatId: 'abc123xyz' })
})
```

### Using the Service Directly

```typescript
import { analyzeEmotions, formatEmotionAnalysisReport } from '@/services/ai/emotion-analysis'

const messages = [
  {
    speaker: 'interviewee',
    text: 'I have experience with React and TypeScript.',
    emotionFeatures: {
      confidence: 0.8,
      calmness: 0.7,
      engagement: 0.75
    }
  },
  // ... more messages
]

const analysis = analyzeEmotions(messages)
const report = formatEmotionAnalysisReport(analysis)
console.log(report)
```

## Output Format

The analysis provides:

1. **Overall Metrics**
   - Overall Confidence percentage
   - Average Calmness percentage
   - Emotional Stability score

2. **Dominant Emotions**
   - Top 5 emotions with average intensity
   - Occurrence count for each emotion

3. **Emotional Trends**
   - Whether confidence is improving, declining, or stable

4. **Insights**
   - Key observations about emotional patterns
   - Performance indicators

5. **Recommendations**
   - Actionable advice based on emotional analysis

6. **Detailed Breakdown**
   - Per-message analysis
   - Emotional state classification (confident/nervous/calm/engaged/uncertain)
   - Individual emotion scores

## Integration with Interview Feedback

The emotional analysis service is designed to work alongside the existing interview feedback system. While the main feedback system uses emotional data internally (without exposing specific values), this testing tool provides detailed emotional insights for:

- **Development & Testing**: Understanding how emotional data is being captured and processed
- **Quality Assurance**: Verifying that emotion features are being correctly extracted from Hume API
- **Research & Analysis**: Deep dive into emotional patterns for research purposes
- **Debugging**: Troubleshooting issues with emotional data collection

## Test Cases Included

The test script includes three sample test cases:

1. **High Confidence Interview**: Demonstrates strong emotional performance
2. **Nervous Interview**: Shows low confidence and high nervousness patterns
3. **Improving Confidence Interview**: Demonstrates confidence improvement over time

## Notes

- The service requires emotion features to be present in interviewee messages
- If no emotional data is available, the service returns appropriate defaults
- All emotion intensities are normalized to 0-1 range
- The analysis focuses on interviewee messages only (interviewer messages are filtered out)

## Dependencies

- `hume` package for fetching chat messages from Hume API
- TypeScript for type safety
- Next.js API routes for the REST endpoint

