-- Fix get_recent_test_submissions function to use correct column names
-- 
-- Key fixes:
-- 1. Topics table uses 'title' not 'name'
-- 2. Handle both practice mode (topic_id) and mock mode (test_subject_id)
-- 3. Get score from mock_results table instead of calculating from attempts
--
CREATE OR REPLACE FUNCTION public.get_recent_test_submissions(
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  attempt_id uuid,
  user_id uuid,
  user_email text,
  usage text,
  entry_test_name text,
  subject_name text,
  score_percent numeric,
  submitted_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can access this data
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    a.id as attempt_id,
    a.user_id,
    u.email as user_email,
    a.mode::text as usage,
    et.name as entry_test_name,
    COALESCE(
      -- For practice mode: get subject from topic
      s_topic.name,
      -- For mock mode: get subject from test_subject
      s_test.name
    ) as subject_name,
    CASE 
      WHEN mr.total_questions > 0 
      THEN mr.score_percent
      ELSE 0
    END as score_percent,
    a.submitted_at
  FROM public.attempts a
  LEFT JOIN auth.users u ON a.user_id = u.id
  LEFT JOIN public.entry_tests et ON a.entry_test_id = et.id
  -- For practice mode attempts (topic_id)
  LEFT JOIN public.topics t ON a.topic_id = t.id
  LEFT JOIN public.subjects s_topic ON t.subject_id = s_topic.id
  -- For mock mode attempts (test_subject_id)
  LEFT JOIN public.test_subjects ts ON a.test_subject_id = ts.id
  LEFT JOIN public.subjects s_test ON ts.subject_id = s_test.id
  -- Get score from mock_results
  LEFT JOIN public.mock_results mr ON a.id = mr.attempt_id
  WHERE a.submitted_at IS NOT NULL
  ORDER BY a.submitted_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_recent_test_submissions IS 'Returns recent test submissions with user and performance details for admin dashboard';
