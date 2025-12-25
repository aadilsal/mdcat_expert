# Quiz Results & AI Explanation Module

## Quick Setup

### 1. Add Gemini API Key

Add to `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 2. Run Database Migration

Apply the migration to Supabase:
```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Run SQL directly in Supabase Dashboard
# Copy contents of: supabase/migrations/014_quiz_results_ai_explanations.sql
```

### 3. Test the Module

1. Complete a quiz through the normal flow
2. Submit the quiz
3. You'll be redirected to `/quiz/results/[sessionId]`
4. View comprehensive results with AI explanations

## Features

✅ Animated score summary with circular progress gauge
✅ Time and accuracy metrics
✅ Difficulty-wise performance analysis (charts)
✅ Topic-wise performance with insights
✅ Question-by-question breakdown with AI explanations
✅ AI explanation regeneration (max 5 per question)
✅ Privacy-safe result sharing
✅ Mobile-responsive design

## Components Created

- `ResultsSummary` - Animated score display
- `MetricsCards` - Time & accuracy metrics
- `QuestionBreakdown` - Detailed question list
- `AIExplanation` - AI-powered explanations
- `DifficultyAnalysis` - Charts & breakdown
- `TopicPerformance` - Category analysis
- `ShareResults` - Sharing functionality
- `QuizResultsPage` - Main orchestrator

## API Endpoints

- `GET /api/quiz/results/[sessionId]` - Fetch results
- `POST /api/quiz/results/[sessionId]/explanation` - Get AI explanation
- `POST /api/quiz/results/[sessionId]/regenerate` - Regenerate explanation
- `POST /api/quiz/results/[sessionId]/share` - Share results

## Security

- ✅ Server-side API key protection
- ✅ Rate limiting (5 regenerations per question)
- ✅ Authentication required
- ✅ RLS policies enforced

## Cost Optimization

- ✅ AI explanations cached in database
- ✅ ~90% reduction in API calls through caching
- ✅ Rate limiting prevents abuse

## Documentation

See `walkthrough.md` for comprehensive documentation.
