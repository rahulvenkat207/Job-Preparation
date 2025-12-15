# AI Services - Quick Reference

## Slide 1: Service Overview

### 1. Question Generation & Feedback
**Purpose**: Generate technical interview questions and evaluate answers

**Features**:
- Generates questions based on job description, experience level, and difficulty (easy/medium/hard)
- Provides feedback with rating (1-10) and correct answer
- Avoids repeating previous questions

**API**: 
- `POST /api/ai/questions/generate-question` - Generate question
- `POST /api/ai/questions/generate-feedback` - Get feedback on answer

**Output Format**:
```markdown
## Feedback (Rating: X/10)
[Constructive feedback]

## Correct Answer
[Complete answer]
```

---

### 2. Interview Feedback
**Purpose**: Analyze mock interview transcripts and provide comprehensive performance feedback

**Features**:
- Analyzes full interview transcript from Hume AI
- Evaluates 7 categories: Communication, Confidence, Response Quality, Pacing, Engagement, Role Fit, Overall Strengths
- Uses emotional analysis data (not exposed in output)
- Each category rated 1-10 with detailed feedback

**Output**: Markdown with overall rating + 7 category ratings and feedback

---

### 3. Resume Analysis
**Purpose**: Evaluate resume against job description with structured feedback

**Features**:
- Analyzes 5 categories: ATS compatibility, Job Match, Writing/Formatting, Keyword Coverage, Other
- Accepts PDF, Word, or text files (max 10MB)
- Returns structured JSON with scores and actionable feedback

**API**: `POST /api/ai/resumes/analyze` (FormData: file + jobInfoId)

**Output Format**:
```json
{
  "overallScore": 8,
  "ats": {"score": 8, "summary": "...", "feedback": [...]},
  "jobMatch": {...},
  "writingAndFormatting": {...},
  "keywordCoverage": {...},
  "other": {...}
}
```

---

## Slide 2: Technical Details & Validation

### Common Technical Stack
- **AI Model**: Google Gemini 2.5 Flash
- **Streaming**: All responses use streaming for real-time output
- **Auth**: Clerk authentication required for all endpoints
- **Database**: Drizzle ORM with Next.js cache tags

### Validation Requirements

**Question Feedback**:
- ✅ Feedback header with rating (1-10)
- ✅ Correct answer section
- ✅ Feedback text ≥50 chars, answer ≥100 chars
- ✅ Uses "you" pronoun

**Interview Feedback**:
- ✅ Overall rating at start
- ✅ All 7 categories with ratings (1-10)
- ✅ Each category feedback ≥100 chars
- ✅ References specific transcript moments
- ✅ No emotional feature values exposed

**Resume Analysis**:
- ✅ Valid JSON schema (Zod validated)
- ✅ Overall score + 5 category scores (1-10)
- ✅ Each category: summary (20-500 chars) + feedback array
- ✅ Feedback items: type (strength/minor/major), name, message (≥30 chars)
- ✅ Scores align with averages (±2 tolerance)

### Testing
```bash
npm test -- __tests__/services/ai/  # All AI tests
npm run test:coverage                # With coverage
```

**Test Coverage**: 55 tests passing, validates format, content quality, and edge cases



