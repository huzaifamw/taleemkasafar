# PU Lahore Entry Test - Admin Guide

## Overview
Guide for administrators managing PU Lahore Entry Test content, users, and analytics.

---

## Admin Panel Access

### URL
```
https://yourdomain.com/admin
```

### Login
Use admin credentials configured in:
- `app/admin-auth/login/page.tsx` - Admin login page
- Environment variable: `ADMIN_EMAIL` and hashed `ADMIN_PASSWORD`

### Admin Routes
```
/admin                          - Admin dashboard
/admin/entry-tests              - Entry test management
/admin/questions                - Question bank management
/admin/questions/new            - Add new question
/admin/users                    - User management
```

---

## Managing PU Questions

### Viewing PU Questions

1. Navigate to **Admin → Questions** (`/admin/questions`)
2. Use filter dropdown → Select "PU Lahore"
3. Questions list shows all 1,444 PU questions

**Available Filters**:
- Entry Test: NET Engineering / PU Lahore
- Subject: Verbal / Quant / CS / Maths / Physics
- Difficulty: Easy / Medium / Hard
- Status: Approved / Pending / Rejected

### Question List Columns
- **ID**: Database question ID
- **Question Text**: First 100 characters
- **Subject**: Which subject it belongs to
- **Topic**: Specific topic within subject
- **Difficulty**: Easy / Medium / Hard
- **Status**: Moderation status
- **Actions**: Edit / Delete buttons

### Adding New PU Question

1. Click **"Add New Question"** button
2. Fill form:
   - **Entry Test**: Select "PU Lahore"
   - **Subject**: Choose from 5 subjects
   - **Chapter**: Auto-loads based on subject
   - **Topic**: Auto-loads based on chapter
   - **Question Text**: Write question (supports Markdown)
   - **Question Type**: MCQ (default)
   - **Difficulty**: Easy / Medium / Hard
   - **Options**: 4 options (A/B/C/D)
   - **Correct Answer**: Select correct option
   - **Explanation**: Write answer explanation
   - **External ID**: Optional (for CSV tracking)
   - **Usage**: Practice / Past Paper / Both

3. Click **"Save Question"**

**Note**: New questions default to `moderation_status = 'pending'`. Change to 'approved' to make visible to students.

### Editing Existing Question

1. Find question in list (use filters to narrow down)
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Update Question"**

**Common Edits**:
- Fix typos in question text
- Update correct answer if wrong
- Improve explanation clarity
- Adjust difficulty based on student performance
- Change moderation status

### Bulk Operations

**To approve multiple questions**:
```sql
-- Run in Supabase SQL Editor
UPDATE questions 
SET moderation_status = 'approved'
WHERE id IN (
  SELECT q.id FROM questions q
  JOIN question_tests qt ON qt.question_id = q.id
  JOIN entry_tests et ON et.id = qt.entry_test_id
  WHERE et.slug = 'pu'
    AND q.moderation_status = 'pending'
  LIMIT 50
);
```

**To delete questions from a specific topic**:
```sql
-- CAUTION: Permanent deletion
DELETE FROM questions 
WHERE topic_id = (SELECT id FROM topics WHERE external_id = 'pu-cs-dbms')
  AND external_id LIKE 'PU-CS-DBMS-%';
```

---

## Managing PU Test Configuration

### Viewing Entry Test Details

1. Navigate to **Admin → Entry Tests** (`/admin/entry-tests`)
2. Find "PU Lahore Entry Test" in list
3. Click to view details

**Displayed Info**:
- Test Name: PU Lahore Entry Test
- Slug: `pu`
- Status: Active / Inactive
- Associated Subjects: 5 (Verbal, Quant, CS, Maths, Physics)
- Total Questions: ~1,444
- Mock Blueprints: 1 (pu-full-mock)

### Editing Entry Test Settings

```sql
-- Make test inactive (hide from students)
UPDATE entry_tests 
SET is_active = false 
WHERE slug = 'pu';

-- Reactivate test
UPDATE entry_tests 
SET is_active = true 
WHERE slug = 'pu';

-- Update test name
UPDATE entry_tests 
SET name = 'PU Lahore Entry Test 2026'
WHERE slug = 'pu';
```

### Managing Subjects

**Add new subject to PU test**:
```sql
-- First create subject if not exists
INSERT INTO subjects (name, slug, icon)
VALUES ('Biology', 'biology', 'microscope')
RETURNING id;

-- Then associate with PU test
INSERT INTO test_subjects (entry_test_id, subject_id)
VALUES (
  (SELECT id FROM entry_tests WHERE slug = 'pu'),
  (SELECT id FROM subjects WHERE slug = 'biology')
);
```

**Remove subject from PU test**:
```sql
-- CAUTION: Also removes all questions for that subject!
DELETE FROM test_subjects 
WHERE entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu')
  AND subject_id = (SELECT id FROM subjects WHERE slug = 'biology');
```

---

## Managing Mock Test Blueprint

### Viewing Blueprint Configuration

```sql
SELECT 
  bp.name,
  bp.total_questions,
  bp.duration_seconds,
  bp.is_active,
  COUNT(mbs.id) as slots
FROM mock_test_blueprints bp
LEFT JOIN mock_blueprint_slots mbs ON mbs.blueprint_id = bp.id
WHERE bp.external_id = 'pu-full-mock'
GROUP BY bp.id;
```

**Current Config**:
- Total Questions: 100
- Duration: 4800 seconds (80 minutes)
- Slots: 5 (one per subject)
- Each slot: 20 questions

### Editing Blueprint (e.g., Change Duration)

```sql
-- Change from 80 minutes to 90 minutes
UPDATE mock_test_blueprints 
SET duration_seconds = 5400  -- 90 * 60
WHERE external_id = 'pu-full-mock';
```

### Editing Slot Configuration

**Change questions per subject**:
```sql
-- Example: Increase Computer Science to 25 questions, decrease Physics to 15
UPDATE mock_blueprint_slots 
SET question_count = 25,
    difficulty_mix = '{"easy": 10, "medium": 10, "hard": 5}'::jsonb
WHERE blueprint_id = (SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock')
  AND test_subject_id = (
    SELECT ts.id FROM test_subjects ts
    JOIN subjects s ON s.id = ts.subject_id
    WHERE ts.entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu')
      AND s.slug = 'computer-science'
  );

UPDATE mock_blueprint_slots 
SET question_count = 15,
    difficulty_mix = '{"easy": 6, "medium": 6, "hard": 3}'::jsonb
WHERE blueprint_id = (SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock')
  AND test_subject_id = (
    SELECT ts.id FROM test_subjects ts
    JOIN subjects s ON s.id = ts.subject_id
    WHERE ts.entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu')
      AND s.slug = 'physics'
  );

-- Also update total in blueprint
UPDATE mock_test_blueprints 
SET total_questions = 100  -- Verify sum matches
WHERE external_id = 'pu-full-mock';
```

**Important**: Ensure `SUM(slot.question_count) = blueprint.total_questions`

### Deactivate Mock Blueprint

```sql
-- Prevents new mock attempts from being generated
UPDATE mock_test_blueprints 
SET is_active = false 
WHERE external_id = 'pu-full-mock';
```

Students can still complete in-progress mocks, but cannot start new ones.

---

## User Management

### Viewing PU Test Takers

```sql
-- Users who attempted PU mock tests
SELECT DISTINCT
  u.id,
  u.email,
  u.full_name,
  COUNT(ma.id) as mock_attempts,
  MAX(ma.created_at) as last_attempt
FROM users u
JOIN mock_attempts ma ON ma.user_id = u.id
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
GROUP BY u.id, u.email, u.full_name
ORDER BY last_attempt DESC;
```

### User Practice Statistics

```sql
-- Practice questions answered by user for PU test
SELECT 
  u.email,
  s.name as subject,
  COUNT(ur.id) as questions_attempted,
  SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) as correct_answers,
  ROUND(100.0 * SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) / COUNT(ur.id), 2) as accuracy_pct
FROM user_responses ur
JOIN users u ON u.id = ur.user_id
JOIN questions q ON q.id = ur.question_id
JOIN subjects s ON s.id = q.subject_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
WHERE et.slug = 'pu'
  AND u.id = '[USER_ID_HERE]'
GROUP BY u.email, s.name;
```

---

## Analytics & Reporting

### Overall PU Test Statistics

```sql
-- Total usage metrics
SELECT 
  COUNT(DISTINCT ma.user_id) as unique_users,
  COUNT(ma.id) as total_mock_attempts,
  AVG(ma.score) as avg_score,
  AVG(ma.time_taken_seconds / 60.0) as avg_time_minutes,
  SUM(CASE WHEN ma.status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN ma.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress
FROM mock_attempts ma
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock';
```

### Subject-Wise Performance

```sql
-- Average accuracy per subject across all users
SELECT 
  s.name as subject,
  COUNT(DISTINCT ur.user_id) as users,
  COUNT(ur.id) as questions_attempted,
  ROUND(100.0 * SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) / COUNT(ur.id), 2) as avg_accuracy
FROM user_responses ur
JOIN questions q ON q.id = ur.question_id
JOIN subjects s ON s.id = q.subject_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
WHERE et.slug = 'pu'
GROUP BY s.name
ORDER BY avg_accuracy DESC;
```

### Topic Difficulty Analysis

```sql
-- Topics with lowest student accuracy (need review)
SELECT 
  s.name as subject,
  t.name as topic,
  COUNT(ur.id) as attempts,
  ROUND(100.0 * SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) / COUNT(ur.id), 2) as accuracy,
  COUNT(DISTINCT q.id) as question_pool_size
FROM user_responses ur
JOIN questions q ON q.id = ur.question_id
JOIN topics t ON t.id = q.topic_id
JOIN subjects s ON s.id = q.subject_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
WHERE et.slug = 'pu'
GROUP BY s.name, t.name
HAVING COUNT(ur.id) >= 10  -- Min 10 attempts for statistical significance
ORDER BY accuracy ASC
LIMIT 20;
```

Low accuracy topics may indicate:
- Questions are too difficult
- Explanations are unclear
- Topic needs more content coverage

### Question Quality Review

```sql
-- Questions with very low accuracy (may be faulty)
SELECT 
  q.id,
  q.external_id,
  LEFT(q.question_text, 80) as question_preview,
  s.name as subject,
  q.difficulty,
  COUNT(ur.id) as attempts,
  ROUND(100.0 * SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) / COUNT(ur.id), 2) as accuracy
FROM questions q
JOIN user_responses ur ON ur.question_id = q.id
JOIN subjects s ON s.id = q.subject_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
WHERE et.slug = 'pu'
GROUP BY q.id, q.external_id, q.question_text, s.name, q.difficulty
HAVING COUNT(ur.id) >= 20  -- Min 20 attempts
  AND (100.0 * SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) / COUNT(ur.id)) < 20  -- <20% accuracy
ORDER BY accuracy ASC;
```

Review these questions for:
- Incorrect answer key
- Ambiguous wording
- Outdated information

---

## Common Admin Tasks

### Task 1: Add New Questions from CSV

See `PU_IMPORT_PROCESS.md` for detailed steps. Summary:

1. Add questions to `mcqs/pu_csp_css_mcqs.csv`
2. Run `python mcqs/build_pu_import.py`
3. Execute generated `mcqs/import_pu.sql`
4. Validate with `mcqs/validate_pu_import.sql`

### Task 2: Update Question Difficulty

If students find questions too easy/hard:

```sql
-- Update specific question
UPDATE questions 
SET difficulty = 'hard'  -- was 'medium'
WHERE external_id = 'PU-CS-DBMS-045';

-- Also update in question_tests junction
UPDATE question_tests qt
SET difficulty = 'hard'
WHERE question_id = (SELECT id FROM questions WHERE external_id = 'PU-CS-DBMS-045')
  AND entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu');
```

### Task 3: Remove Problematic Question

```sql
-- Soft delete (preserves data, hides from students)
UPDATE questions 
SET deleted_at = NOW(),
    moderation_status = 'rejected'
WHERE external_id = 'PU-VERBAL-SYN-012';

-- Hard delete (permanent removal)
DELETE FROM questions 
WHERE external_id = 'PU-VERBAL-SYN-012';
```

### Task 4: Reset User's Mock Attempt

If user reports technical issue:

```sql
-- Find attempt
SELECT id, status, created_at 
FROM mock_attempts 
WHERE user_id = '[USER_ID]'
  AND blueprint_id = (SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock')
ORDER BY created_at DESC 
LIMIT 1;

-- Delete attempt and responses (allows retry)
DELETE FROM user_responses 
WHERE attempt_id = '[ATTEMPT_ID]';

DELETE FROM mock_attempts 
WHERE id = '[ATTEMPT_ID]';
```

User can now generate new mock attempt.

### Task 5: Generate Reports for Management

**Monthly active users**:
```sql
SELECT 
  DATE_TRUNC('month', ma.created_at) as month,
  COUNT(DISTINCT ma.user_id) as unique_users
FROM mock_attempts ma
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
  AND ma.created_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', ma.created_at)
ORDER BY month DESC;
```

**Top performing students**:
```sql
SELECT 
  u.full_name,
  u.email,
  AVG(ma.score) as avg_score,
  COUNT(ma.id) as attempts
FROM mock_attempts ma
JOIN users u ON u.id = ma.user_id
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
  AND ma.status = 'completed'
GROUP BY u.id, u.full_name, u.email
HAVING COUNT(ma.id) >= 3  -- At least 3 attempts
ORDER BY avg_score DESC
LIMIT 50;
```

---

## Backup & Maintenance

### Backup PU Questions

```sql
-- Export to CSV (run in psql)
\copy (SELECT q.id, q.external_id, q.question_text, q.question_type, q.difficulty, s.slug as subject, t.external_id as topic, q.moderation_status FROM questions q JOIN subjects s ON s.id = q.subject_id JOIN topics t ON t.id = q.topic_id JOIN test_subjects ts ON ts.subject_id = s.id JOIN entry_tests et ON et.id = ts.entry_test_id WHERE et.slug = 'pu') TO 'pu_questions_backup.csv' WITH CSV HEADER;
```

### Reindex for Performance

If queries become slow:

```sql
REINDEX TABLE questions;
REINDEX TABLE question_options;
REINDEX TABLE user_responses;
REINDEX TABLE mock_attempts;
```

### Vacuum Database

```sql
VACUUM ANALYZE questions;
VACUUM ANALYZE user_responses;
VACUUM ANALYZE mock_attempts;
```

---

## Security Considerations

1. **Admin Authentication**: Ensure admin panel is protected (not publicly accessible)
2. **SQL Injection**: Use parameterized queries in admin tools
3. **Question Leaks**: Monitor for unauthorized scraping of question bank
4. **User Privacy**: Hash/anonymize user data in reports
5. **Audit Logs**: Track admin actions (question edits, deletions)

---

## Support Escalation

For issues not covered in this guide:

1. **Database Issues**: Check Supabase logs, contact database admin
2. **Application Bugs**: Check application error logs, file bug report
3. **Content Quality**: Consult subject matter experts for question review
4. **Performance Problems**: Review database query plans, consider indexing

---

## Quick Reference

| Task | SQL Query |
|------|-----------|
| Total PU questions | `SELECT COUNT(*) FROM questions q JOIN question_tests qt ON qt.question_id = q.id JOIN entry_tests et ON et.id = qt.entry_test_id WHERE et.slug = 'pu';` |
| Approve all pending | `UPDATE questions SET moderation_status = 'approved' WHERE moderation_status = 'pending' AND subject_id IN (SELECT s.id FROM subjects s JOIN test_subjects ts ON ts.subject_id = s.id JOIN entry_tests et ON et.id = ts.entry_test_id WHERE et.slug = 'pu');` |
| Deactivate PU test | `UPDATE entry_tests SET is_active = false WHERE slug = 'pu';` |
| Reset mock blueprint | `UPDATE mock_test_blueprints SET is_active = true WHERE external_id = 'pu-full-mock';` |

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: Development Team
