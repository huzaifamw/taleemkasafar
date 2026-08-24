# AI-Powered Performance Insights Feature

## Overview
The AI-Powered Performance Insights feature uses Gemini AI to analyze student mock test performance and provide personalized study recommendations.

## Features Implemented

### 1. Database Schema
- **ai_performance_analysis table**: Stores AI-generated insights
  - Performance tier (excellent/good/average/needs_improvement)
  - Weak subjects and topics with severity levels
  - Strengths and weaknesses lists
  - Personalized study and practice recommendations
  - Motivational messages
  
- **study_progress table**: Tracks user progress on recommendations
  - Status tracking (pending/in_progress/completed/skipped)
  - Progress metrics (questions attempted, correct, time spent)

- **RLS Policies**: Users can only access their own analyses

### 2. Backend Services

#### AI Service (`lib/ai/`)
- **gemini-client.ts**: Configures Gemini 1.5 Flash model
- **analysis-prompt.ts**: Builds comprehensive prompt with:
  - Subject-wise breakdown
  - Topic-wise performance
  - Difficulty-wise scores
  - Historical attempt comparison
  - Structured JSON output format

- **quota-manager.ts**: Enforces usage limits:
  - 3 analyses per user per day
  - 30-minute cooldown between analyses
  - 1000 analyses platform-wide per day

- **analyze-performance.ts**: Main analysis engine
  - Fetches comprehensive performance data
  - Calls Gemini API
  - Parses and validates AI response
  - Saves results to database

#### Server Actions & Queries
- **actions.ts**: 
  - `triggerAIAnalysis()`: Initiates AI analysis with quota checks
  - `updateStudyProgress()`: Tracks recommendation completion
  - `checkAnalysisQuota()`: Validates user quota

- **queries/insights.ts**:
  - `getLatestAIAnalysis()`: Latest analysis for user
  - `getAIAnalysisByAttempt()`: Analysis for specific attempt
  - `getAIAnalysisHistory()`: Last 10 analyses
  - `getAnalysisStats()`: Progress trends

### 3. Frontend Components

#### Shared UI Components (`components/insights/`)
- **performance-badge.tsx**: Tier badges (excellent/good/average/needs_improvement)
- **severity-badge.tsx**: Severity indicators (critical/high/medium/low)
- **priority-badge.tsx**: Priority levels for recommendations
- **ai-thinking-loader.tsx**: Animated loading state
- **ai-error-state.tsx**: Error handling with retry

#### Main Display Components
- **ai-analysis-card.tsx**: Performance overview with score and stats
- **strengths-section.tsx**: List of student strengths
- **weak-areas-section.tsx**: Areas needing improvement with severity
- **recommendations-list.tsx**: Numbered study plan with priorities
- **practice-suggestions.tsx**: Practice question recommendations
- **motivational-message.tsx**: AI-generated encouragement
- **analysis-timeline.tsx**: Historical progress tracking
- **ai-analysis-trigger.tsx**: Button to generate analysis

### 4. Pages & Integration

#### Main Insights Page (`/insights`)
- Displays comprehensive AI analysis
- Shows strengths and weaknesses
- Lists personalized recommendations
- Practice suggestions with difficulty levels
- Historical analysis timeline
- Empty state for first-time users

#### Mock Results Integration
- AI analysis trigger button on results page
- Shows if analysis already exists
- One-click analysis generation
- Navigates to insights page when complete

#### Navigation Updates
- **Sidebar**: Added "AI Insights" with psychology icon
- **Bottom Nav**: Added AI shortcut for mobile

## Usage Flow

1. **Complete a Mock Test**
   - Student finishes a mock test
   - Views results page

2. **Generate AI Analysis**
   - Click "Generate AI Insights" button
   - AI analyzes performance (3-5 seconds)
   - Checks quota limits automatically

3. **View Insights**
   - Performance tier badge
   - Overall score with breakdown
   - Strengths (what you're doing well)
   - Weaknesses (what needs work)
   - Personalized study recommendations
   - Practice suggestions with specific question counts
   - Motivational message

4. **Track Progress**
   - View analysis history
   - See progress trends over time
   - Compare scores from first to latest

## Quota Limits

- **Per User**: 3 analyses per day
- **Cooldown**: 30 minutes between analyses
- **Platform**: 1000 analyses per day total

## AI Analysis Output

The AI provides:
- **Performance Tier**: Overall classification
- **Strengths**: 3-5 specific achievements with numbers
- **Weaknesses**: 3-5 areas needing improvement
- **Weak Subjects**: Subjects scoring <70% with severity
- **Weak Topics**: Topics scoring <70% with severity
- **Study Recommendations**: 
  - Prioritized (high/medium/low)
  - Time estimates (hours)
  - Clear explanations
- **Practice Recommendations**:
  - Specific question counts (10-30)
  - Difficulty levels
  - Focus areas
- **Motivational Message**: Personalized encouragement

## Technical Stack

- **AI Model**: Google Gemini 1.5 Flash
- **Database**: Supabase PostgreSQL
- **Framework**: Next.js 15 with Server Actions
- **UI**: Neobrutalist design with Material Icons
- **Type Safety**: Full TypeScript support

## Environment Variables

```env
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Future Enhancements

1. **Study Progress Tracking**: Mark recommendations as completed
2. **Practice Session Integration**: Start practice directly from recommendations
3. **Comparison Mode**: Compare multiple attempts side-by-side
4. **Export Reports**: Download PDF analysis reports
5. **Study Streaks**: Gamification for consistent study
6. **AI Chat**: Ask follow-up questions about recommendations
7. **Parent Dashboard**: Share insights with parents/teachers
8. **Email Summaries**: Weekly progress emails

## Performance Considerations

- AI analysis cached per attempt (no regeneration)
- Queries use React cache() for deduplication
- Proper loading states prevent UI blocking
- Error boundaries handle API failures gracefully
- Quota system prevents API abuse

## Security

- Row-level security ensures data privacy
- Server-side quota validation
- API key stored securely in environment
- No client-side AI calls
- User can only access own analyses

## Testing Checklist

- [x] Database migration applied successfully
- [x] TypeScript types generated
- [x] Components match neobrutalist design
- [x] Mobile responsive layout
- [x] Navigation updated (sidebar + bottom nav)
- [x] Loading states implemented
- [x] Error handling with retry
- [x] Quota limits enforced
- [ ] Build passes (admin panel type issues unrelated to feature)
- [ ] Manual testing: Complete mock test and generate analysis
- [ ] Verify AI response parsing
- [ ] Test quota limits
- [ ] Test mobile UI
