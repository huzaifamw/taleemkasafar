-- Insert Mock Test Blueprint
INSERT INTO mock_test_blueprints (external_id, entry_test_id, name, description, duration_seconds, total_questions, is_active, display_order)
SELECT 'pu-full-mock', et.id, 'PU Lahore Full Mock', 'Balanced 100-question test: Verbal Reasoning (20), Quantitative Reasoning (20), Computer Science (20), Mathematics (20), Physics (20). 80 minutes total, no negative marking. Tests analytical, verbal, quantitative, technical, and scientific aptitude.', 4800, 100, true, 0
FROM entry_tests et WHERE et.slug = 'pu'
ON CONFLICT (external_id) DO UPDATE SET duration_seconds = EXCLUDED.duration_seconds, total_questions = EXCLUDED.total_questions, description = EXCLUDED.description, name = EXCLUDED.name, is_active = EXCLUDED.is_active;

-- Create Blueprint Slots
INSERT INTO mock_blueprint_slots (blueprint_id, test_subject_id, question_count, past_paper_min, difficulty_mix, display_order)
SELECT bp.id, ts.id, v.qcount, 0, v.mix, v.ord
FROM mock_test_blueprints bp
CROSS JOIN (VALUES
  ('verbal-reasoning', 20, '{"easy":8,"medium":8,"hard":4}'::jsonb, 0),
  ('quantitative-reasoning', 20, '{"easy":8,"medium":8,"hard":4}'::jsonb, 1),
  ('computer-science', 20, '{"easy":10,"medium":7,"hard":3}'::jsonb, 2),
  ('mathematics', 20, '{"easy":6,"medium":9,"hard":5}'::jsonb, 3),
  ('physics', 20, '{"easy":6,"medium":9,"hard":5}'::jsonb, 4)
) AS v(subject_slug, qcount, mix, ord)
JOIN entry_tests et ON et.slug = 'pu'
JOIN subjects s ON s.slug = v.subject_slug
JOIN test_subjects ts ON ts.entry_test_id = et.id AND ts.subject_id = s.id
WHERE bp.external_id = 'pu-full-mock'
ON CONFLICT (blueprint_id, test_subject_id) DO UPDATE SET question_count = EXCLUDED.question_count, difficulty_mix = EXCLUDED.difficulty_mix, display_order = EXCLUDED.display_order, past_paper_min = EXCLUDED.past_paper_min;;
