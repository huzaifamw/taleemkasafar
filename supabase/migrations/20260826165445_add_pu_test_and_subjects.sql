-- =====================================================================
-- PU Lahore Entry Test Setup
-- Creates the PU test, ensures required subjects exist, and links them
-- =====================================================================

-- 1. Insert PU Lahore Entry Test
INSERT INTO entry_tests (external_id, slug, name, description, source, is_active, display_order)
VALUES (
  'pu-lahore-2025',
  'pu',
  'PU Lahore Entry Test',
  'Punjab University Lahore Entry Test - Balanced 100-question assessment covering Verbal Reasoning, Quantitative Reasoning, Computer Science, Mathematics, and Physics. 80 minutes total, no negative marking.',
  'PU Lahore',
  true,
  20
)
ON CONFLICT (external_id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      source = EXCLUDED.source,
      is_active = EXCLUDED.is_active,
      display_order = EXCLUDED.display_order;

-- 2. Ensure all required subjects exist
INSERT INTO subjects (external_id, slug, name) VALUES
  ('verbal-reasoning', 'verbal-reasoning', 'Verbal Reasoning'),
  ('quantitative-reasoning', 'quantitative-reasoning', 'Quantitative Reasoning'),
  ('computer-science', 'computer-science', 'Computer Science'),
  ('mathematics', 'mathematics', 'Mathematics'),
  ('physics', 'physics', 'Physics')
ON CONFLICT (external_id) DO NOTHING;

-- 3. Link subjects to PU test with metadata
-- Section 1: Verbal Reasoning (20 questions)
INSERT INTO test_subjects (entry_test_id, subject_id, nature_of_questions, difficulty_profile, display_order, is_active)
SELECT 
  (SELECT id FROM entry_tests WHERE slug = 'pu'),
  (SELECT id FROM subjects WHERE slug = 'verbal-reasoning'),
  'Synonyms & Antonyms, Analogies, Sentence Completion, Critical Reading comprehension',
  '{}'::jsonb,
  0,
  true
ON CONFLICT (entry_test_id, subject_id) DO UPDATE
  SET nature_of_questions = EXCLUDED.nature_of_questions,
      display_order = EXCLUDED.display_order,
      is_active = EXCLUDED.is_active;

-- Section 2: Quantitative Reasoning (20 questions)
INSERT INTO test_subjects (entry_test_id, subject_id, nature_of_questions, difficulty_profile, display_order, is_active)
SELECT 
  (SELECT id FROM entry_tests WHERE slug = 'pu'),
  (SELECT id FROM subjects WHERE slug = 'quantitative-reasoning'),
  'Arithmetic (percentages, ratios, averages), Algebra (linear/quadratic), Analytical word problems, Basic geometry',
  '{}'::jsonb,
  1,
  true
ON CONFLICT (entry_test_id, subject_id) DO UPDATE
  SET nature_of_questions = EXCLUDED.nature_of_questions,
      display_order = EXCLUDED.display_order,
      is_active = EXCLUDED.is_active;

-- Section 3: Computer Science (20 questions)
INSERT INTO test_subjects (entry_test_id, subject_id, nature_of_questions, difficulty_profile, display_order, is_active)
SELECT 
  (SELECT id FROM entry_tests WHERE slug = 'pu'),
  (SELECT id FROM subjects WHERE slug = 'computer-science'),
  'IT & Networks (topologies, OSI), Operating Systems, Database Management (MS Access, normalization), C Language Programming',
  '{}'::jsonb,
  2,
  true
ON CONFLICT (entry_test_id, subject_id) DO UPDATE
  SET nature_of_questions = EXCLUDED.nature_of_questions,
      display_order = EXCLUDED.display_order,
      is_active = EXCLUDED.is_active;

-- Section 4: Mathematics (20 questions)
INSERT INTO test_subjects (entry_test_id, subject_id, nature_of_questions, difficulty_profile, display_order, is_active)
SELECT 
  (SELECT id FROM entry_tests WHERE slug = 'pu'),
  (SELECT id FROM subjects WHERE slug = 'mathematics'),
  'FSc Part 1 (Number Systems, Sets, Functions, Matrices, Quadratics, Sequences, Trigonometry), FSc Part 2 (Limits, Differentiation, Integration, Analytic Geometry)',
  '{}'::jsonb,
  3,
  true
ON CONFLICT (entry_test_id, subject_id) DO UPDATE
  SET nature_of_questions = EXCLUDED.nature_of_questions,
      display_order = EXCLUDED.display_order,
      is_active = EXCLUDED.is_active;

-- Section 5: Physics (20 questions)
INSERT INTO test_subjects (entry_test_id, subject_id, nature_of_questions, difficulty_profile, display_order, is_active)
SELECT 
  (SELECT id FROM entry_tests WHERE slug = 'pu'),
  (SELECT id FROM subjects WHERE slug = 'physics'),
  'FSc Part 1 (Measurements, Vectors, Motion, Work/Energy, Waves, Optics), FSc Part 2 (Electrostatics, Current, Electromagnetism, Electronics, Nuclear Physics)',
  '{}'::jsonb,
  4,
  true
ON CONFLICT (entry_test_id, subject_id) DO UPDATE
  SET nature_of_questions = EXCLUDED.nature_of_questions,
      display_order = EXCLUDED.display_order,
      is_active = EXCLUDED.is_active;;
