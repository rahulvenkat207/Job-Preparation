# How to Test Emotional Analysis

Quick guide to test the emotional analysis tool using different methods.

## Method 1: Test Script (Easiest - Recommended)

### Step 1: Test with Sample Data (No setup needed)

```bash
npm run test:emotion-analysis
```

This will:
- Run 3 sample test cases (High Confidence, Nervous, Improving Confidence)
- Display analysis results in the console
- Save a report file: `emotion-analysis-test-results.md`

**Expected Output:**
```
Running emotional analysis tests with sample data...

============================================================
Test Case: High Confidence Interview
============================================================

# Emotional Analysis Report

## Overall Metrics
- Overall Confidence: 85.0%
- Average Calmness: 80.0%
...
```

### Step 2: Test with Real Hume Chat ID

If you have a completed interview with a `humeChatId`:

```bash
npm run test:emotion-analysis <your-hume-chat-id>
```

Example:
```bash
npm run test:emotion-analysis abc123xyz789
```

This will:
- Fetch real data from Hume API
- Analyze the actual interview emotions
- Save report: `emotion-analysis-<chat-id>.md`

**Note:** Make sure your `.env` file has `HUME_API_KEY` configured.

---

## Method 2: API Endpoint (For Integration Testing)

### Step 1: Start your development server

```bash
npm run dev
```

### Step 2: Test with Sample Data

Using **curl**:
```bash
curl -X POST http://localhost:3000/api/ai/emotion-analysis/test \
  -H "Content-Type: application/json" \
  -d '{}'
```

Using **JavaScript/TypeScript**:
```javascript
const response = await fetch('/api/ai/emotion-analysis/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})

const result = await response.json()
console.log(result.analysis)
console.log(result.report)
```

### Step 3: Test with Real Hume Chat ID

```bash
curl -X POST http://localhost:3000/api/ai/emotion-analysis/test \
  -H "Content-Type: application/json" \
  -d '{"humeChatId": "your-chat-id-here"}'
```

**Note:** You need to be authenticated (logged in) to use the API endpoint.

---

## Method 3: Direct Service Usage (For Development)

### In a TypeScript file:

```typescript
import { analyzeEmotions, formatEmotionAnalysisReport } from '@/services/ai/emotion-analysis'

// Sample messages
const messages = [
  {
    speaker: 'interviewee' as const,
    text: 'I have five years of experience as a full-stack developer.',
    emotionFeatures: {
      confidence: 0.85,
      calmness: 0.8,
      engagement: 0.75
    }
  },
  {
    speaker: 'interviewer' as const,
    text: 'That sounds great. Can you tell me more?'
  },
  {
    speaker: 'interviewee' as const,
    text: 'Sure! I work primarily with React, Node.js, and TypeScript.',
    emotionFeatures: {
      confidence: 0.9,
      calmness: 0.85,
      interest: 0.8
    }
  }
]

// Analyze
const analysis = analyzeEmotions(messages)

// Get formatted report
const report = formatEmotionAnalysisReport(analysis)

console.log(report)
```

---

## Quick Test Checklist

- [ ] **Test Script with Sample Data**: `npm run test:emotion-analysis`
- [ ] **Check Output**: Look for confidence scores, calmness, and emotional trends
- [ ] **Check Report File**: Open `emotion-analysis-test-results.md`
- [ ] **Test API Endpoint**: Use curl or fetch to test the API
- [ ] **Test with Real Data**: Use a real `humeChatId` if available

---

## What to Look For in Results

### ✅ Successful Test Should Show:

1. **Overall Metrics**:
   - Overall Confidence: 0-1 (0-100%)
   - Average Calmness: 0-1 (0-100%)
   - Emotional Stability: 0-1 (0-100%)

2. **Dominant Emotions**:
   - Top 5 emotions with intensity scores
   - Occurrence counts

3. **Emotional Trends**:
   - Improving ✅ / Declining ⚠️ / Stable ➡️

4. **Insights**:
   - Key observations about emotional patterns

5. **Recommendations**:
   - Actionable advice

6. **Detailed Breakdown**:
   - Per-message analysis with emotional states

---

## Troubleshooting

### Issue: "tsx not found"
**Solution:** Install tsx globally or use npx:
```bash
npm install -g tsx
# OR
npx tsx scripts/test-emotion-analysis.ts
```

### Issue: "HUME_API_KEY not found"
**Solution:** Make sure your `.env` file has:
```
HUME_API_KEY=your-key-here
HUME_SECRET_KEY=your-secret-here
```

### Issue: "No messages found"
**Solution:** 
- For sample data: This shouldn't happen - check the script
- For real data: Make sure the `humeChatId` is valid and the interview has completed

### Issue: "Unauthorized" (API endpoint)
**Solution:** Make sure you're logged in to the application

---

## Example Output

```
# Emotional Analysis Report

## Overall Metrics

- **Overall Confidence**: 85.0%
- **Average Calmness**: 80.0%
- **Emotional Stability**: 90.0%

## Dominant Emotions

- **confidence**: 85.0% (appeared 3 times)
- **calmness**: 80.0% (appeared 3 times)
- **engagement**: 80.0% (appeared 2 times)

## Emotional Trends

✅ **Improving**: Confidence increased during the interview

## Insights

- High confidence level detected throughout the interview
- Candidate maintained good composure during the interview
- Emotional state remained stable throughout
- Confidence improved as the interview progressed

## Recommendations

- No specific recommendations at this time.

## Detailed Breakdown

### Message 1

**Text**: "Hi, thank you for having me. I have five years of experience as a full-stack developer..."

**Emotional State**: confident
**Confidence Score**: 85.0%

**Emotions**:
- confidence: 85.0%
- calmness: 80.0%
- engagement: 75.0%
```

---

## Next Steps

After testing:
1. Review the generated reports
2. Compare different test cases
3. Integrate with your interview feedback system
4. Use insights to improve interview preparation features

