# AI Services Documentation

## Overview

This application provides three main AI-powered services for job preparation:
1. **Question Generation & Feedback** - Generates technical interview questions and provides feedback on answers
2. **Interview Feedback** - Analyzes mock interview transcripts and provides comprehensive feedback
3. **Resume Analysis** - Evaluates resumes against job descriptions with structured feedback

All services use Google's Gemini 2.5 Flash model via the AI SDK.

---

## 1. Question Generation & Feedback Service

### Service Files
- **Service**: `src/services/ai/questions.ts`
- **API Routes**: 
  - `src/app/api/ai/questions/generate-question/route.ts` (Generate questions)
  - `src/app/api/ai/questions/generate-feedback/route.ts` (Generate feedback)

### Features

#### 1.1 Generate AI Question (`generateAiQuestion`)

**Purpose**: Generates technical interview questions tailored to a specific job role.

**Input Parameters**:
```typescript
{
  jobInfo: {
    title?: string
    description: string
    experienceLevel: string
  }
  previousQuestions: Array<{
    text: string
    difficulty: "easy" | "medium" | "hard"
  }>
  difficulty: "easy" | "medium" | "hard"
  onFinish: (question: string) => void
}
```

**How It Works**:
1. Takes job information (title, description, experience level)
2. Considers previous questions to avoid repetition
3. Generates a question matching the specified difficulty level
4. Uses streaming response for real-time output
5. Automatically saves the question to database when generation completes

**AI Model**: Google Gemini 2.5 Flash

**System Prompt Guidelines**:
- Questions must reflect skills/technologies from job description
- Questions scoped appropriately for experience level
- Prefers practical, real-world challenges over trivia
- Returns only the question (no answer)
- Formatted as markdown
- Can focus on a single technology/skill from the job description

**Output**: Streaming text response (markdown formatted question)

**API Endpoint**: `POST /api/ai/questions/generate-question`

**Request Body**:
```json
{
  "prompt": "easy" | "medium" | "hard",
  "jobInfoId": "string"
}
```

**Response**: Data stream with question text and `questionId` when complete

---

#### 1.2 Generate Question Feedback (`generateAiQuestionFeedback`)

**Purpose**: Evaluates a candidate's answer to a technical interview question and provides feedback.

**Input Parameters**:
```typescript
{
  question: string  // The original interview question
  answer: string    // The candidate's answer
}
```

**How It Works**:
1. Takes the original question and candidate's answer
2. AI evaluates the answer quality
3. Assigns a rating from 1-10
4. Provides constructive feedback
5. Includes a complete correct answer

**Rating Scale**:
- **10**: Perfect, complete, and well-articulated
- **7-9**: Mostly correct, with minor issues or room for optimization
- **4-6**: Partially correct or incomplete
- **1-3**: Largely incorrect or missing the point

**Output Format** (Markdown):
```markdown
## Feedback (Rating: X/10)

[Constructive feedback on strengths and areas for improvement]

---

## Correct Answer

[Complete correct answer with explanations]
```

**Key Features**:
- Uses "you" pronoun to address candidate directly
- Provides both positive feedback and improvement suggestions
- Includes comprehensive correct answer for learning
- Concise but thorough

**API Endpoint**: `POST /api/ai/questions/generate-feedback`

**Request Body**:
```json
{
  "prompt": "string",      // The candidate's answer
  "questionId": "string"    // ID of the question being answered
}
```

**Response**: Data stream with feedback text

**Validation Requirements**:
- Must contain "## Feedback (Rating: X/10)" header
- Must contain "## Correct Answer" section
- Rating must be 1-10
- Feedback text minimum 50 characters
- Correct answer minimum 100 characters
- Should use "you" pronoun

---

## 2. Interview Feedback Service

### Service Files
- **Service**: `src/services/ai/interviews.ts`
- **API Route**: Called via `src/features/interviews/actions.ts`

### Feature: Generate Interview Feedback (`generateAiInterviewFeedback`)

**Purpose**: Analyzes a complete mock interview transcript and provides structured, comprehensive feedback on the interviewee's performance.

**Input Parameters**:
```typescript
{
  humeChatId: string  // ID of the interview chat session
  jobInfo: {
    title: string
    description: string
    experienceLevel: string
  }
  userName: string    // Name of the interviewee
}
```

**How It Works**:
1. Fetches interview transcript from Hume API using `humeChatId`
2. Formats messages with speaker labels (interviewee/interviewer)
3. Includes emotional features for interviewee messages (from Hume)
4. Sends formatted transcript to AI for analysis
5. AI analyzes performance across 7 categories
6. Returns structured markdown feedback

**Data Flow**:
```
Hume Chat → Fetch Messages → Format Transcript → AI Analysis → Structured Feedback
```

**Feedback Categories** (All rated 1-10):

1. **Communication Clarity**
   - Articulation and clarity
   - Appropriate language for job/experience level

2. **Confidence and Emotional State**
   - Confidence level based on emotional cues and speech
   - Nervous or hesitant moments

3. **Response Quality**
   - Relevance and alignment with job requirements
   - Appropriate depth for experience level

4. **Pacing and Timing**
   - Response delays
   - Unnatural pauses indicating uncertainty

5. **Engagement and Interaction**
   - Curiosity and thoughtful questions
   - Interest in role and company

6. **Role Fit & Alignment**
   - Match with job description expectations
   - Technical and soft skill gaps

7. **Overall Strengths & Areas for Improvement**
   - Summary of top strengths
   - Key areas for improvement
   - Overall performance assessment

**Output Format** (Markdown):
```markdown
Overall Rating: X/10

## Communication Clarity: X/10
[Detailed feedback with specific examples from transcript]

## Confidence and Emotional State: X/10
[Analysis based on emotional cues and speech patterns]

## Response Quality: X/10
[Evaluation of answer relevance and depth]

## Pacing and Timing: X/10
[Analysis of response timing and pauses]

## Engagement and Interaction: X/10
[Assessment of questions asked and engagement level]

## Role Fit & Alignment: X/10
[Evaluation of match with job requirements]

## Overall Strengths & Areas for Improvement
**Strengths:**
- [List of strengths]

**Areas for Improvement:**
- [List of improvement areas]
```

**Key Features**:
- References specific moments/quotes from transcript
- Tailored to job description and experience level
- Uses "you" pronoun throughout
- Does NOT expose specific emotional feature values (e.g., "confidence: 0.8")
- Includes overall rating at start
- All categories rated individually

**Validation Requirements**:
- Overall rating at start (1-10)
- All 7 categories present with ratings
- Each category feedback minimum 100 characters
- Overall rating should align with category average (±2 points)
- Should reference specific transcript moments
- Should use "you" pronoun
- Should NOT include emotional feature numeric values

**Transcript Format** (JSON sent to AI):
```json
[
  {
    "speaker": "interviewee" | "interviewer",
    "text": "Message text",
    "emotionFeatures": {
      "confidence": 0.8,
      "calmness": 0.7,
      ...
    }  // Only for interviewee messages
  }
]
```

---

## 3. Resume Analysis Service

### Service Files
- **Service**: `src/services/ai/resumes/ai.ts`
- **Schema**: `src/services/ai/resumes/schemas.ts`
- **API Route**: `src/app/api/ai/resumes/analyze/route.ts`

### Feature: Analyze Resume for Job (`analyzeResumeForJob`)

**Purpose**: Evaluates a resume against a specific job description and provides structured, actionable feedback.

**Input Parameters**:
```typescript
{
  resumeFile: File  // PDF, Word, or text file
  jobInfo: {
    title?: string
    description: string
    experienceLevel: string
  }
}
```

**How It Works**:
1. Receives resume file (PDF, DOCX, or TXT)
2. Validates file type and size (max 10MB)
3. Sends file + job description to AI
4. AI analyzes resume across 5 categories
5. Returns structured JSON response

**File Requirements**:
- **Max Size**: 10MB
- **Allowed Types**:
  - `application/pdf` (PDF)
  - `application/msword` (DOC)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
  - `text/plain` (TXT)

**Analysis Categories**:

1. **ATS (Applicant Tracking System)**
   - Layout simplicity
   - Standard section headings
   - Avoidance of graphics/columns
   - Consistent formatting
   - ATS-friendly structure

2. **Job Match**
   - Skills alignment
   - Technology match
   - Achievements relevance
   - Experience level alignment

3. **Writing and Formatting**
   - Writing quality and tone
   - Grammar and clarity
   - Structure and organization
   - Consistency
   - Alignment with job description style

4. **Keyword Coverage**
   - Keywords from job description
   - Terminology match
   - ATS matching potential
   - Recruiter readability

5. **Other**
   - Missing contact info
   - Outdated technologies
   - Major red flags
   - Career gaps
   - Additional relevant feedback

**Output Format** (Structured JSON):
```json
{
  "overallScore": 8,  // 1-10
  "ats": {
    "score": 8,  // 1-10
    "summary": "Short summary of ATS evaluation",
    "feedback": [
      {
        "type": "strength" | "minor-improvement" | "major-improvement",
        "name": "Feedback item label",
        "message": "Detailed feedback message"
      }
    ]
  },
  "jobMatch": { /* same structure */ },
  "writingAndFormatting": { /* same structure */ },
  "keywordCoverage": { /* same structure */ },
  "other": { /* same structure */ }
}
```

**Feedback Types**:
- **strength**: Positive aspect of the resume
- **minor-improvement**: Small area that could be improved
- **major-improvement**: Significant issue that needs attention

**Key Features**:
- Structured JSON output (validated with Zod schema)
- Scores for overall and each category (1-10)
- Actionable feedback items
- Tailored to specific job description
- Uses "you" pronoun in feedback
- Can be critical to help candidate improve

**API Endpoint**: `POST /api/ai/resumes/analyze`

**Request**: FormData
```
resumeFile: File
jobInfoId: string
```

**Response**: Text stream with JSON data

**Validation Requirements**:
- Valid JSON matching `aiAnalyzeSchema`
- Overall score 1-10
- All 5 categories present
- Each category has: score (1-10), summary (20-500 chars), feedback array
- Each feedback item has: type (enum), name (string), message (30+ chars)
- Overall score should align with category average (±2 points)
- At least 1 feedback item per category
- Feedback messages should be actionable
- Should use "you" pronoun

**Schema Definition** (Zod):
```typescript
{
  overallScore: number (0-10)
  ats: {
    score: number (0-10)
    summary: string
    feedback: Array<{
      type: "strength" | "minor-improvement" | "major-improvement"
      name: string
      message: string
    }>
  }
  // ... same for jobMatch, writingAndFormatting, keywordCoverage, other
}
```

---

## Common Features Across All Services

### AI Model
- **Model**: Google Gemini 2.5 Flash
- **Provider**: `@ai-sdk/google`
- **Streaming**: All services use streaming responses for real-time output

### Authentication & Authorization
- All API endpoints require user authentication (Clerk)
- Users can only access their own data
- Permission checks before AI processing

### Error Handling
- 400: Invalid request (missing/invalid parameters)
- 401: Not authenticated
- 403: No permission (user doesn't own the resource)
- 500: Server/AI errors

### Caching
- Uses Next.js cache tags for data invalidation
- Database queries are cached where appropriate

### Rate Limiting
- Plan limit checks were removed (as noted in code comments)
- File size limits enforced (10MB for resumes)

---

## ML Metrics Evaluation

The application includes ROUGE and Perplexity metrics to evaluate the quality of AI-generated content. These metrics help assess how well the AI services are performing and can be used to compare different prompts or model configurations.

### Available Metrics

#### ROUGE (Recall-Oriented Understudy for Gisting Evaluation)

ROUGE measures the overlap between generated text and reference text (ground truth). It's particularly useful for evaluating text generation quality when you have reference examples.

**Variants:**
- **ROUGE-1**: Measures unigram (single word) overlap
- **ROUGE-2**: Measures bigram (two consecutive words) overlap
- **ROUGE-L**: Measures longest common subsequence (captures sentence-level structure)

**Score Range**: 0.0 to 1.0 (higher is better)
- **Precision**: Proportion of generated n-grams that appear in reference
- **Recall**: Proportion of reference n-grams that appear in generated text
- **F1**: Harmonic mean of precision and recall

**When to Use:**
- When you have reference text (ground truth) to compare against
- Evaluating question generation quality
- Comparing feedback quality across different prompts
- A/B testing different model configurations

#### Perplexity

Perplexity measures how well a language model predicts a sequence of text. Lower perplexity indicates the model is more confident in its predictions (better fluency).

**Score Range**: 0 to Infinity (lower is better)
- Lower values = more fluent, predictable text
- Higher values = less fluent, more surprising text

**When to Use:**
- Evaluating text fluency without needing reference text
- Comparing different prompts or models
- Detecting low-quality or incoherent outputs
- Monitoring model performance over time

### Usage

#### In Validation Functions

The validation functions now support optional ML metrics calculation:

```typescript
import { validateQuestionFeedback } from '@/__tests__/lib/ai-validation-metrics'

// Without reference (only perplexity calculated)
const result1 = validateQuestionFeedback(feedback)

// With reference text (ROUGE + perplexity calculated)
const result2 = validateQuestionFeedback(feedback, referenceText)

// With multiple reference texts
const result3 = validateQuestionFeedback(feedback, [ref1, ref2])
```

**Available Functions:**
- `validateQuestionFeedback(feedback, referenceText?, referenceSection?)`
- `validateInterviewFeedback(feedback, expectedCategories?, referenceText?)`
- `validateResumeAnalysis(response, referenceAnalysis?)`

**Result Structure:**
```typescript
interface ValidationResult {
  passed: boolean
  score: number // 0-100
  issues: string[]
  suggestions: string[]
  rougeScores?: {
    rouge1: { precision: number, recall: number, f1: number }
    rouge2: { precision: number, recall: number, f1: number }
    rougeL: { precision: number, recall: number, f1: number }
  }
  perplexity?: {
    perplexity: number
    averageLogProbability: number
    tokenCount: number
  }
}
```

#### Direct Metric Calculation

You can also calculate metrics directly:

```typescript
import { calculateROUGE, calculatePerplexity } from '@/__tests__/lib/ml-metrics'

// Calculate ROUGE
const rougeScores = calculateROUGE(candidateText, referenceText)
console.log(`ROUGE-1 F1: ${rougeScores.rouge1.f1}`)

// Calculate Perplexity
const perplexity = calculatePerplexity(text)
console.log(`Perplexity: ${perplexity.perplexity}`)
```

#### Batch Evaluation

Evaluate multiple texts at once:

```typescript
import { batchEvaluate } from '@/__tests__/lib/ml-metrics-helpers'

const results = batchEvaluate([
  { text: candidate1, reference: reference1 },
  { text: candidate2, reference: reference2 },
])

console.log(`Average ROUGE-1: ${results.averageRouge1}`)
console.log(`Average Perplexity: ${results.averagePerplexity}`)
```

#### Standalone Evaluation Script

Use the evaluation script for batch processing:

```bash
# Evaluate from JSON file
ts-node scripts/evaluate-ai-metrics.ts evaluations.json report.json

# Output as text format
ts-node scripts/evaluate-ai-metrics.ts evaluations.json report.txt --format=text
```

**Input File Format** (`evaluations.json`):
```json
{
  "evaluations": [
    {
      "name": "test-case-1",
      "candidate": "Generated text here",
      "reference": "Reference text here"
    },
    {
      "name": "test-case-2",
      "candidate": "Another generated text",
      "reference": ["Reference 1", "Reference 2"]
    }
  ]
}
```

### Interpreting Scores

#### ROUGE Scores

- **0.0 - 0.3**: Low overlap, significant differences from reference
- **0.3 - 0.5**: Moderate overlap, some similarity
- **0.5 - 0.7**: Good overlap, strong similarity
- **0.7 - 1.0**: Very high overlap, nearly identical content

**Note**: ROUGE scores depend on having good reference text. If references are poor quality, scores may be misleading.

#### Perplexity

- **< 10**: Very fluent, highly predictable text
- **10 - 50**: Good fluency, natural language
- **50 - 100**: Moderate fluency, some unusual patterns
- **> 100**: Low fluency, incoherent or very surprising text

**Note**: Perplexity values depend on the text length and vocabulary. Compare perplexity scores for similar-length texts.

### Best Practices

1. **Use ROUGE when you have reference data**: ROUGE requires ground truth to be meaningful
2. **Use Perplexity for standalone evaluation**: Perplexity doesn't need reference text
3. **Compare similar texts**: When comparing metrics, ensure texts are similar in length and type
4. **Use multiple metrics**: Combine ROUGE and Perplexity for comprehensive evaluation
5. **Establish baselines**: Run metrics on known good/bad examples to establish baseline scores
6. **Monitor trends**: Track metrics over time to detect model degradation

### Files

- **Core Metrics**: `__tests__/lib/ml-metrics.ts`
- **Helper Functions**: `__tests__/lib/ml-metrics-helpers.ts`
- **Integration**: `__tests__/lib/ai-validation-metrics.ts`
- **Evaluation Script**: `scripts/evaluate-ai-metrics.ts`
- **Tests**: `__tests__/services/ai/*.test.ts` (includes ML metrics tests)

---

## Testing & Validation

### Test Files
- `__tests__/services/ai/questions.test.ts`
- `__tests__/services/ai/interviews.test.ts`
- `__tests__/services/ai/resumes.test.ts`

### Validation Metrics
- Format validation (required sections, structure)
- Content quality (length, completeness)
- Rating consistency (overall vs category scores)
- Edge case handling (invalid inputs, missing data)

### Test Data
- Sample questions and answers (various quality levels)
- Sample interview transcripts (different performance levels)
- Sample resumes (excellent, good, average, poor quality)

### Running Tests
```bash
# All AI service tests
npm test -- __tests__/services/ai/

# Specific service
npm test -- __tests__/services/ai/questions.test.ts

# With coverage
npm run test:coverage
```

---

## Integration Points

### Database
- **Questions**: Stored in `QuestionTable`
- **Interviews**: Stored in `InterviewTable`
- **Job Info**: Stored in `JobInfoTable`
- Uses Drizzle ORM

### External Services
- **Hume AI**: For interview transcript and emotional analysis
- **Google Gemini**: For all AI text generation
- **Clerk**: For authentication

### Frontend Integration
- Uses AI SDK React hooks for streaming
- Real-time updates as AI generates responses
- Error handling and loading states

---

## Best Practices

1. **Always validate input** before sending to AI
2. **Use streaming** for better UX (real-time feedback)
3. **Cache appropriately** to reduce AI API calls
4. **Handle errors gracefully** with user-friendly messages
5. **Validate AI output** using the validation metrics
6. **Use structured schemas** (Zod) for type-safe responses
7. **Tailor feedback** to specific job descriptions
8. **Be constructive** in feedback, not just critical

---

## Future Enhancements

Potential improvements:
- Support for multiple AI models (configurable)
- Customizable feedback templates
- Export feedback as PDF
- Historical performance tracking
- A/B testing different prompts
- Multi-language support
- Voice interview analysis (enhanced)

---

## API Summary

| Service | Endpoint | Method | Input | Output |
|---------|----------|--------|-------|--------|
| Generate Question | `/api/ai/questions/generate-question` | POST | `{prompt, jobInfoId}` | Stream (question) |
| Question Feedback | `/api/ai/questions/generate-feedback` | POST | `{prompt, questionId}` | Stream (feedback) |
| Resume Analysis | `/api/ai/resumes/analyze` | POST | FormData (file, jobInfoId) | Stream (JSON) |
| Interview Feedback | Via `generateInterviewFeedback` action | - | `interviewId` | Markdown text |

---

## Notes

- All services use **streaming responses** for better user experience
- **Emotional features** from Hume are used in interview analysis but not exposed in output
- **File uploads** are validated for type and size before processing
- **Database operations** are cached using Next.js cache tags
- **Permissions** are checked at multiple levels (API route and service level)


