-- =====================================================================
-- PU Lahore Mock Test Blueprint
-- Creates 100-question balanced mock test: 20Q per subject, 80 minutes
-- =====================================================================

-- 1. Insert Mock Test Blueprint
INSERT INTO mock_test_blueprints (
  external_id,
  entry_test_id,
  name,
  description,
  duration_seconds,
  total_questions,
  is_active,
  display_order
)
SELECT 
  'pu-full-mock',
  et.id,
  'PU Lahore Full Mock',
  'Balanced 100-question test: Verbal Reasoning (20), Quantitative Reasoning (20), Computer Science (20), Mathematics (20), Physics (20). 80 minutes total, no negative marking. Tests analytical, verbal, quantitative, technical, and scientific aptitude.',
  4800, -- 80 minutes
  100,
  true,
  0
FROM entry_tests et 
WHERE et.slug = 'pu'
ON CONFLICT (external_id) DO UPDATE
  SET duration_seconds = EXCLUDED.duration_seconds,
      total_questions = EXCLUDED.total_questions,
      description = EXCLUDED.description,
      name = EXCLUDED.name,
      is_active = EXCLUDED.is_active;

-- 2. Create Blueprint Slots (5 subjects, 20 questions each)
-- Slots define per-subject question distribution and difficulty mix

INSERT INTO mock_blueprint_slots (
  blueprint_id,
  test_subject_id,
  question_count,
  past_paper_min,
  difficulty_mix,
  display_order
)
SELECT
  bp.id,
  ts.id,
  v.qcount,
  0, -- past_paper_min (all from practice pool)
  v.mix,
  v.ord
FROM mock_test_blueprints bp
CROSS JOIN (VALUES
  -- Section 1: Verbal Reasoning (Questions 1-20)
  -- 5 Synonyms/Antonyms, 5 Analogies, 5 Sentence Completion, 5 Comprehension
  ('verbal-reasoning', 20, '{"easy":8,"medium":8,"hard":4}'::jsonb, 0),
  
  -- Section 2: Quantitative Reasoning (Questions 21-40)
  -- 6 Arithmetic, 5 Algebra, 5 Word Problems, 4 Geometry
  ('quantitative-reasoning', 20, '{"easy":8,"medium":8,"hard":4}'::jsonb, 1),
  
  -- Section 3: Computer Science (Questions 41-60)
  -- 4 IT/Networks, 4 OS, 6 Database, 6 Programming
  ('computer-science', 20, '{"easy":10,"medium":7,"hard":3}'::jsonb, 2),
  
  -- Section 4: Mathematics (Questions 61-80)
  -- 3 Number Systems/Sets, 3 Quadratics/Series, 4 Trig, 5 Limits/Diff, 5 Integration/Geometry
  ('mathematics', 20, '{"easy":6,"medium":9,"hard":5}'::jsonb, 3),
  
  -- Section 5: Physics (Questions 81-100)
  -- 3 Measurements/Vectors, 4 Motion/Force/Energy, 3 Waves/Optics, 5 Electrostatics/Current, 5 Electronics/Nuclear
  ('physics', 20, '{"easy":6,"medium":9,"hard":5}'::jsonb, 4)
) AS v(subject_slug, qcount, mix, ord)
JOIN entry_tests et ON et.slug = 'pu'
JOIN subjects s ON s.slug = v.subject_slug
JOIN test_subjects ts ON ts.entry_test_id = et.id AND ts.subject_id = s.id
WHERE bp.external_id = 'pu-full-mock'
ON CONFLICT (blueprint_id, test_subject_id) DO UPDATE
  SET question_count = EXCLUDED.question_count,
      difficulty_mix = EXCLUDED.difficulty_mix,
      display_order = EXCLUDED.display_order,
      past_paper_min = EXCLUDED.past_paper_min;

-- =====================================================================
-- Verification Queries
-- =====================================================================

-- Verify blueprint exists and totals are correct
SELECT 
  bp.name,
  bp.external_id,
  bp.total_questions,
  bp.duration_seconds / 60 as duration_minutes,
  SUM(mbs.question_count) as slot_total,
  COUNT(mbs.id) as slot_count,
  bp.is_active
FROM mock_test_blueprints bp
LEFT JOIN mock_blueprint_slots mbs ON mbs.blueprint_id = bp.id
WHERE bp.external_id = 'pu-full-mock'
GROUP BY bp.id, bp.name, bp.external_id, bp.total_questions, bp.duration_seconds, bp.is_active;
-- Expected: slot_total = 100, slot_count = 5, duration_minutes = 80

-- Verify slot details
SELECT 
  s.name as subject,
  mbs.question_count,
  mbs.difficulty_mix,
  mbs.display_order,
  mbs.past_paper_min
FROM mock_blueprint_slots mbs
JOIN test_subjects ts ON ts.id = mbs.test_subject_id
JOIN subjects s ON s.id = ts.subject_id
JOIN mock_test_blueprints bp ON bp.id = mbs.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
ORDER BY mbs.display_order;

-- Verify difficulty mix totals match question counts
SELECT 
  s.name as subject,
  mbs.question_count,
  (mbs.difficulty_mix->>'easy')::int as easy,
  (mbs.difficulty_mix->>'medium')::int as medium,
  (mbs.difficulty_mix->>'hard')::int as hard,
  (mbs.difficulty_mix->>'easy')::int + 
  (mbs.difficulty_mix->>'medium')::int + 
  (mbs.difficulty_mix->>'hard')::int as difficulty_total,
  CASE 
    WHEN mbs.question_count = (
      (mbs.difficulty_mix->>'easy')::int + 
      (mbs.difficulty_mix->>'medium')::int + 
      (mbs.difficulty_mix->>'hard')::int
    ) THEN '✓ Valid'
    ELSE '✗ Mismatch'
  END as validation
FROM mock_blueprint_slots mbs
JOIN test_subjects ts ON ts.id = mbs.test_subject_id
JOIN subjects s ON s.id = ts.subject_id
JOIN mock_test_blueprints bp ON bp.id = mbs.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
ORDER BY mbs.display_order;
