-- ============================================
-- AI-Powered Insights System
-- ============================================

-- Table 1: AI Performance Analysis
-- Stores AI-generated performance analysis and personalized recommendations
CREATE TABLE ai_performance_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL UNIQUE REFERENCES attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Overall Performance
  overall_score numeric(5,2) NOT NULL,
  performance_tier text NOT NULL CHECK (performance_tier IN ('excellent', 'good', 'average', 'needs_improvement')),
  
  -- Weak Areas (AI-identified)
  weak_subjects jsonb NOT NULL DEFAULT '[]'::jsonb,
  weak_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  weak_difficulty_levels jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- AI Insights
  strengths text[] NOT NULL DEFAULT ARRAY[]::text[],
  weaknesses text[] NOT NULL DEFAULT ARRAY[]::text[],
  
  -- Recommendations
  study_recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  practice_recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  motivational_message text,
  
  -- Metadata
  ai_model_used text NOT NULL,
  tokens_used integer,
  analysis_generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_analysis_user_date ON ai_performance_analysis(user_id, created_at DESC);
CREATE INDEX idx_ai_analysis_attempt ON ai_performance_analysis(attempt_id);

COMMENT ON TABLE ai_performance_analysis IS 'AI-generated performance analysis and personalized recommendations';

-- Table 2: Study Progress Tracking
-- Tracks user progress on AI recommendations
CREATE TABLE study_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES ai_performance_analysis(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('topic', 'subject', 'difficulty')),
  recommendation_data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  
  -- Progress Metrics
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_progress_user ON study_progress(user_id, status);
CREATE INDEX idx_study_progress_analysis ON study_progress(analysis_id);

CREATE TRIGGER trg_study_progress_updated
  BEFORE UPDATE ON study_progress
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE study_progress IS 'Tracks user progress on AI recommendations';

-- RLS Policies
ALTER TABLE ai_performance_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

-- ai_performance_analysis policies
CREATE POLICY "Users can view own analyses"
  ON ai_performance_analysis FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analyses"
  ON ai_performance_analysis FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- study_progress policies
CREATE POLICY "Users can view own progress"
  ON study_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress"
  ON study_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON study_progress FOR UPDATE
  USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT ON ai_performance_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE ON study_progress TO authenticated;
