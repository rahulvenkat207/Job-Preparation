# Text-Based Emotional Analysis

This is a **standalone emotion analysis system** that does **NOT require Hume API**. It analyzes emotions directly from interview text using keyword matching, sentiment analysis, and pattern recognition.

## Features

✅ **No External Dependencies** - Works without Hume API or any external emotion services  
✅ **Text-Based Analysis** - Analyzes emotions from interview transcripts  
✅ **Keyword Detection** - Identifies confidence, nervousness, calmness, engagement, and more  
✅ **Sentiment Analysis** - Detects positive/negative/uncertain patterns  
✅ **Pattern Recognition** - Recognizes confident statements, filler words, and engagement indicators  

## How It Works

The system uses multiple techniques to detect emotions:

1. **Keyword Matching**: Matches text against emotion-specific keyword lists
2. **Sentiment Analysis**: Analyzes positive/negative/uncertain word patterns
3. **Pattern Recognition**: Detects confident statements, filler words, questions
4. **Intensity Calculation**: Combines multiple signals to calculate emotion intensity (0-1)

## Usage

### Test Script (Recommended)

```bash
npm run test:text-emotion-analysis
```

This will:
- Run 4 sample test cases
- Analyze emotions from text only (no emotion features needed)
- Generate a detailed report: `text-emotion-analysis-test-results.md`

### Direct Service Usage

```typescript
import {
  analyzeTextEmotions,
  formatTextEmotionAnalysisReport,
} from '@/services/ai/text-emotion-analysis'

const messages = [
  {
    speaker: 'interviewee',
    text: 'I have five years of experience as a full-stack developer. I built several successful applications.',
  },
  {
    speaker: 'interviewer',
    text: 'That sounds great. Can you tell me more?',
  },
  {
    speaker: 'interviewee',
    text: 'Sure! I am very excited about this opportunity and curious to learn more.',
  },
]

const analysis = analyzeTextEmotions(messages)
const report = formatTextEmotionAnalysisReport(analysis)
console.log(report)
```

## Detected Emotions

The system can detect:

- **Confidence**: From experience statements, achievements, expertise keywords
- **Nervousness**: From filler words (um, uh), uncertainty phrases
- **Calmness**: From composed language, clear statements
- **Engagement**: From questions, curiosity indicators, active participation
- **Interest**: From curiosity words, questions asked
- **Anxiety**: From worry/stress indicators
- **Enthusiasm**: From excited/enthusiastic language

## Example Output

```
# Text-Based Emotional Analysis Report

## Overall Metrics
- Overall Confidence: 76.7%
- Average Calmness: 23.3%
- Emotional Stability: 96.4%

## Dominant Emotions
- confidence: 76.7% (appeared 3 times)
- calmness: 70.0% (appeared 1 times)
- engagement: 5.3% (appeared 2 times)

## Emotional Trends
➡️ Stable: Confidence remained relatively constant

## Insights
- High confidence level detected throughout the interview
- Emotional state remained stable throughout

## Recommendations
- Work on stress management and relaxation techniques
```

## Comparison: Text-Based vs Hume API

| Feature | Text-Based | Hume API |
|---------|-----------|----------|
| **Requires API Key** | ❌ No | ✅ Yes |
| **Requires Internet** | ❌ No | ✅ Yes |
| **Works Offline** | ✅ Yes | ❌ No |
| **Cost** | ✅ Free | ⚠️ Paid |
| **Setup Complexity** | ✅ Simple | ⚠️ Requires API setup |
| **Accuracy** | ⚠️ Good (keyword-based) | ✅ Excellent (ML-based) |
| **Real-time Voice** | ❌ No | ✅ Yes |

## When to Use

**Use Text-Based Analysis when:**
- ✅ You want to test without external dependencies
- ✅ You have interview transcripts (text only)
- ✅ You need offline analysis
- ✅ You want to avoid API costs
- ✅ You're doing development/testing

**Use Hume API when:**
- ✅ You need real-time voice emotion detection
- ✅ You require high-accuracy emotion analysis
- ✅ You have access to voice recordings
- ✅ You need production-grade emotion detection

## Test Cases Included

1. **High Confidence Interview** - Strong, confident responses
2. **Nervous Interview** - Filler words, uncertainty, low confidence
3. **Improving Confidence Interview** - Confidence increases over time
4. **Engaged and Enthusiastic Interview** - High engagement and interest

## Files

- **Service**: `src/services/ai/text-emotion-analysis.ts`
- **Test Script**: `scripts/test-text-emotion-analysis.ts`
- **Test Results**: `text-emotion-analysis-test-results.md`

## Customization

You can customize the emotion detection by modifying:

1. **Keyword Lists** (`emotionKeywords` object)
   - Add/remove keywords for each emotion
   - Adjust weights for different emotions

2. **Sentiment Analysis** (`analyzeSentiment` function)
   - Modify positive/negative word lists
   - Adjust scoring algorithms

3. **Pattern Recognition** (`extractEmotions` function)
   - Add new pattern matching rules
   - Adjust confidence calculation logic

## Notes

- The analysis is based on text patterns and keywords
- Accuracy depends on the quality and clarity of the interview text
- Works best with clear, well-structured interview transcripts
- Can be combined with Hume API for hybrid analysis (text + voice)

