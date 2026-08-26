-- Verbal Reasoning Topics
INSERT INTO topics (external_id, subject_id, parent_topic_id, kind, title, slug, display_order)
SELECT v.ext_id, (SELECT id FROM subjects WHERE slug = 'verbal-reasoning'), NULL, 'chapter'::topic_kind, v.title, v.slug, v.ord
FROM (VALUES
  ('pu-verbal-reasoning-analogy', 'Analogy', 'analogy', 0),
  ('pu-verbal-reasoning-synonyms', 'Synonyms', 'synonyms', 1),
  ('pu-verbal-reasoning-antonyms', 'Antonyms', 'antonyms', 2),
  ('pu-verbal-reasoning-synonyms-antonyms', 'Synonyms / Antonyms', 'synonyms-antonyms', 3),
  ('pu-verbal-reasoning-sentence-completion', 'Sentence Completion', 'sentence-completion', 4),
  ('pu-verbal-reasoning-sentence-completion-grammatical', 'Sentence Completion with Grammatical Words', 'sentence-completion-with-grammatical-words', 5),
  ('pu-verbal-reasoning-comprehension', 'Comprehension', 'comprehension', 6)
) v(ext_id, title, slug, ord)
ON CONFLICT (external_id) DO UPDATE
  SET title = EXCLUDED.title, slug = EXCLUDED.slug, kind = EXCLUDED.kind, display_order = EXCLUDED.display_order;

-- Quantitative Reasoning Topics
INSERT INTO topics (external_id, subject_id, parent_topic_id, kind, title, slug, display_order)
SELECT v.ext_id, (SELECT id FROM subjects WHERE slug = 'quantitative-reasoning'), NULL, 'chapter'::topic_kind, v.title, v.slug, v.ord
FROM (VALUES
  ('pu-quantitative-reasoning-arithmetic', 'Arithmetic', 'arithmetic', 0),
  ('pu-quantitative-reasoning-statistics', 'Statistics', 'statistics', 1),
  ('pu-quantitative-reasoning-mental-mathematics', 'Scenario Based / Mental Mathematics', 'mental-mathematics', 2),
  ('pu-quantitative-reasoning-mental-mathematics-b6', 'B6: Scenario Based/Mental Mathematics', 'b6-scenario-based-mental-mathematics', 3),
  ('pu-quantitative-reasoning-geometry', 'Geometry', 'geometry', 4),
  ('pu-quantitative-reasoning-algebra-functions', 'Algebra and Functions', 'algebra-and-functions', 5),
  ('pu-quantitative-reasoning-equations', 'Equations', 'equations', 6),
  ('pu-quantitative-reasoning-ratio-proportion', 'Ratio & Proportion', 'ratio-proportion', 7),
  ('pu-quantitative-reasoning-average', 'Average', 'average', 8),
  ('pu-quantitative-reasoning-multiplication-division', 'Multiplication and Division', 'multiplication-and-division', 9),
  ('pu-quantitative-reasoning-square-root', 'Square Root', 'square-root', 10),
  ('pu-quantitative-reasoning-unitary-method', 'UNITARY METHOD AND CHAIN RULE', 'unitary-method-and-chain-rule', 11),
  ('pu-quantitative-reasoning-general', 'General', 'general', 12)
) v(ext_id, title, slug, ord)
ON CONFLICT (external_id) DO UPDATE
  SET title = EXCLUDED.title, slug = EXCLUDED.slug, kind = EXCLUDED.kind, display_order = EXCLUDED.display_order;

-- Computer Science Topics
INSERT INTO topics (external_id, subject_id, parent_topic_id, kind, title, slug, display_order)
SELECT v.ext_id, (SELECT id FROM subjects WHERE slug = 'computer-science'), NULL, 'chapter'::topic_kind, v.title, v.slug, v.ord
FROM (VALUES
  ('pu-computer-science-it-basics', 'Basic Concepts of Information Technology', 'basic-concepts-of-information-technology', 0),
  ('pu-computer-science-networks', 'Computer Networks', 'computer-networks', 1),
  ('pu-computer-science-data-communication', 'Data Communication', 'data-communication', 2),
  ('pu-computer-science-windows-os', '7. WINDOWS OPERATING SYSTEM', '7-windows-operating-system', 3),
  ('pu-computer-science-applications', 'APPLICATIONS AND USE OF COMPUTERS', 'applications-and-use-of-computers', 4),
  ('pu-computer-science-architecture', 'COMPUTER ARCHITECTURE', 'computer-architecture', 5),
  ('pu-computer-science-data-protection', 'DATA PROTECTION AND COPYRIGHT', 'data-protection-and-copyright', 6),
  ('pu-computer-science-word-processing', 'Word Processing', 'word-processing', 7),
  ('pu-computer-science-spreadsheet', 'Spreadsheet Processing', 'spreadsheet-processing', 8),
  ('pu-computer-science-expected-questions', 'Expected Questions for Coming Exams.', 'expected-questions-for-coming-exams', 9),
  ('pu-computer-science-general', 'General (Model Paper)', 'general', 10)
) v(ext_id, title, slug, ord)
ON CONFLICT (external_id) DO UPDATE
  SET title = EXCLUDED.title, slug = EXCLUDED.slug, kind = EXCLUDED.kind, display_order = EXCLUDED.display_order;

-- Mathematics Topics
INSERT INTO topics (external_id, subject_id, parent_topic_id, kind, title, slug, display_order)
SELECT v.ext_id, (SELECT id FROM subjects WHERE slug = 'mathematics'), NULL, 'chapter'::topic_kind, v.title, v.slug, v.ord
FROM (VALUES
  ('pu-mathematics-general', 'General (Model Paper)', 'general', 0),
  ('pu-mathematics-basic-concepts', 'BASIC CONCEPTS & DEFINITIONS', 'basic-concepts-definitions', 1),
  ('pu-mathematics-functions-limits', 'FUNCTIONS & LIMITS', 'functions-limits', 2),
  ('pu-mathematics-analytic-geometry', 'ANALYTIC GEOMETRY', 'analytic-geometry', 3),
  ('pu-mathematics-integration', 'Integration', 'integration', 4),
  ('pu-mathematics-linear-inequalities', 'Linear Inequalities & Linear Programming', 'linear-inequalities-linear-programming', 5)
) v(ext_id, title, slug, ord)
ON CONFLICT (external_id) DO UPDATE
  SET title = EXCLUDED.title, slug = EXCLUDED.slug, kind = EXCLUDED.kind, display_order = EXCLUDED.display_order;

-- Physics Topics
INSERT INTO topics (external_id, subject_id, parent_topic_id, kind, title, slug, display_order)
SELECT v.ext_id, (SELECT id FROM subjects WHERE slug = 'physics'), NULL, 'chapter'::topic_kind, v.title, v.slug, v.ord
FROM (VALUES
  ('pu-physics-general', 'General (Model Paper)', 'general', 0),
  ('pu-physics-alternating-current', 'Alternating Current', 'alternating-current', 1),
  ('pu-physics-current-electricity', 'CURRENT ELECTRICITY', 'current-electricity', 2),
  ('pu-physics-relativity', 'Relativity', 'relativity', 3),
  ('pu-physics-work-energy', 'Work & Energy', 'work-energy', 4),
  ('pu-physics-nuclear', 'Nuclear Physics', 'nuclear-physics', 5),
  ('pu-physics-electromagnetic-induction', 'Electromagnetic Induction', 'electromagnetic-induction', 6),
  ('pu-physics-electronics-dawn', 'Electronics / Dawn of Modern Physics', 'electronics-dawn-of-modern-physics', 7),
  ('pu-physics-dawn-modern', 'Dawn of Modern Physics', 'dawn-of-modern-physics', 8),
  ('pu-physics-physical-optics', 'PHYSICAL OPTICS', 'physical-optics', 9),
  ('pu-physics-physics', 'Physics', 'physics', 10)
) v(ext_id, title, slug, ord)
ON CONFLICT (external_id) DO UPDATE
  SET title = EXCLUDED.title, slug = EXCLUDED.slug, kind = EXCLUDED.kind, display_order = EXCLUDED.display_order;;
