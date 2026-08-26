# PU Lahore Entry Test - Setup Guide

## Overview
This guide provides step-by-step instructions for setting up the PU Lahore Entry Test in your Supabase database.

## What Gets Created
- **1 Entry Test**: PU Lahore (slug: `pu`)
- **5 Test Subjects**: Verbal Reasoning, Quantitative Reasoning, Computer Science, Mathematics, Physics
- **48 Topics**: Distributed across subjects (10/10/10/8/10)
- **1,444 Questions**: Imported from CSV with 5,888 options
- **1 Mock Blueprint**: 100-question balanced test (20 per subject)

---

## Prerequisites

### 1. Database Access
- Supabase project URL
- Database password (direct database connection)
- Or SQL Editor access in Supabase dashboard

### 2. Required Files
Ensure these files exist in your repository:
```
supabase/migrations/
  ├── 20260820000000_add_pu_test.sql          (Test + Subjects)
  ├── 20260820100000_add_pu_topics.sql        (48 Topics)
  └── 20260820200000_add_pu_blueprint.sql     (Mock Blueprint)

mcqs/
  ├── import_pu.sql                           (1,444 Questions)
  ├── validate_pu_import.sql                  (Validation)
  └── test_pu_mock_generation.sql             (Mock Test)
```

### 3. CSV Source File (Reference Only)
- `mcqs/pu_csp_css_mcqs.csv` - Original question bank
- **Not needed for setup** (SQL already generated from it)

---

## Setup Methods

Choose one of these methods based on your access level:

### Method A: Supabase Dashboard SQL Editor (Recommended)
**Best for**: Quick setup, no CLI tools needed

### Method B: psql Command Line
**Best for**: Automation, scripted deployments

### Method C: Supabase CLI Migrations
**Best for**: Version-controlled deployments

---

## Method A: Supabase Dashboard SQL Editor

### Step 1: Run Migrations

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy contents of `supabase/migrations/20260820000000_add_pu_test.sql`
4. Paste into editor
5. Click "Run"
6. Wait for success message: "Success. No rows returned"

7. Repeat for remaining migrations in order:
   - `20260820100000_add_pu_topics.sql`
   - `20260820200000_add_pu_blueprint.sql`

**Expected**: Each migration runs without errors

### Step 2: Import Questions

1. Open new SQL Editor tab
2. Open `mcqs/import_pu.sql` in text editor
3. **Copy in chunks** (file is 4.3MB):
   - Lines 1-500 → Run
   - Lines 501-1000 → Run
   - Continue until end
   
   **OR** use "Upload SQL" if available in your Supabase version

4. Wait for completion (may take 30-60 seconds)

**Expected**: No errors, all INSERT statements succeed

### Step 3: Validate Import

1. Open new SQL Editor tab
2. Copy contents of `mcqs/validate_pu_import.sql`
3. Run query
4. Check output:
   - Total PU Questions: ~1,444 ✓
   - Total Options: ~5,888 ✓
   - Questions with Correct Options: ~1,444 ✓
   - Topics Created: 48 ✓
   - Mock Blueprints: 1 ✓

**Expected**: All checks show expected values

### Step 4: Test Mock Generation Readiness

1. Open new SQL Editor tab
2. Copy contents of `mcqs/test_pu_mock_generation.sql`
3. Run query
4. Check readiness summary at end:
   - Blueprint Exists: PASS ✓
   - Has 5 Slots: PASS ✓
   - Slot Totals = 100: PASS ✓
   - Sufficient Questions: PASS ✓

**Expected**: All checks PASS

### Step 5: Verify in Application

1. Restart your Next.js application (if cached)
2. Log in as regular user
3. Check dashboard → PU Lahore should appear in test dropdown
4. Navigate to Subjects → Should show 5 subjects

**Setup Complete!** ✓

---

## Method B: psql Command Line

### Step 1: Get Database Connection String

From Supabase Dashboard → Settings → Database:
```
postgres://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

### Step 2: Run All SQL Files

```powershell
# Set connection string
$DB_URL = "postgres://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"

# Run migrations (Windows PowerShell)
Get-Content supabase/migrations/20260820000000_add_pu_test.sql | psql $DB_URL
Get-Content supabase/migrations/20260820100000_add_pu_topics.sql | psql $DB_URL
Get-Content supabase/migrations/20260820200000_add_pu_blueprint.sql | psql $DB_URL

# Import questions
Get-Content mcqs/import_pu.sql | psql $DB_URL

# Validate
Get-Content mcqs/validate_pu_import.sql | psql $DB_URL

# Test mock generation
Get-Content mcqs/test_pu_mock_generation.sql | psql $DB_URL
```

**Expected**: All commands complete without errors

---

## Method C: Supabase CLI Migrations

### Step 1: Link Project

```bash
npx supabase link --project-ref [YOUR-PROJECT-REF]
```

### Step 2: Apply Migrations

```bash
npx supabase db push
```

This automatically runs all migrations in `supabase/migrations/` folder in order.

### Step 3: Import Questions Manually

Migrations only cover test structure. Still need to run `import_pu.sql`:

```bash
psql $DB_URL < mcqs/import_pu.sql
```

### Step 4: Validate

```bash
psql $DB_URL < mcqs/validate_pu_import.sql
psql $DB_URL < mcqs/test_pu_mock_generation.sql
```

---

## Post-Setup Verification Queries

Run these in SQL Editor to confirm setup:

### Check Entry Test
```sql
SELECT id, slug, name, is_active 
FROM entry_tests 
WHERE slug = 'pu';
```
**Expected**: 1 row, `is_active = true`

### Check Subjects
```sql
SELECT s.name, COUNT(q.id) as question_count
FROM subjects s
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
LEFT JOIN questions q ON q.subject_id = s.id
WHERE et.slug = 'pu'
GROUP BY s.name
ORDER BY s.name;
```
**Expected**: 5 rows (Verbal=405, Quant=220, CS=499, Maths=161, Physics=159)

### Check Mock Blueprint
```sql
SELECT 
  bp.name,
  bp.total_questions,
  bp.duration_seconds,
  COUNT(mbs.id) as slot_count
FROM mock_test_blueprints bp
LEFT JOIN mock_blueprint_slots mbs ON mbs.blueprint_id = bp.id
WHERE bp.external_id = 'pu-full-mock'
GROUP BY bp.id, bp.name, bp.total_questions, bp.duration_seconds;
```
**Expected**: 1 row, `total_questions=100, duration_seconds=4800, slot_count=5`

### Test Mock Generation (Dry Run)
```sql
SELECT generate_mock_attempt(
  (SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock')
);
```
**Expected**: Returns UUID of generated mock attempt (no errors)

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"
**Cause**: Test or subjects already exist from previous setup attempt

**Solution**: 
```sql
-- Check existing data
SELECT * FROM entry_tests WHERE slug = 'pu';

-- If needed, clean up (CAUTION: Deletes all PU data)
DELETE FROM entry_tests WHERE slug = 'pu';
```

Then re-run migrations.

### Issue: import_pu.sql fails with "duplicate key value"
**Cause**: Questions already imported

**Solution**: 
```sql
-- Check import status
SELECT COUNT(*) FROM questions WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);
```

If count > 0, questions already imported. Skip import step.

### Issue: Validation shows 0 questions
**Cause**: import_pu.sql not executed yet

**Solution**: Re-run import_pu.sql

### Issue: Mock generation test shows "INSUFFICIENT" questions
**Cause**: Questions imported but wrong difficulty distribution

**Solution**: 
Check difficulty distribution:
```sql
SELECT 
  s.name,
  COALESCE(qt.difficulty, q.difficulty) as difficulty,
  COUNT(*) as count
FROM questions q
JOIN subjects s ON s.id = q.subject_id
JOIN question_tests qt ON qt.question_id = q.id
JOIN entry_tests et ON et.id = qt.entry_test_id
WHERE et.slug = 'pu'
GROUP BY s.name, COALESCE(qt.difficulty, q.difficulty)
ORDER BY s.name, difficulty;
```

If distribution looks wrong, may need to re-import with corrected difficulty mappings.

### Issue: PU test not appearing in frontend dropdown
**Cause**: Frontend cache or query filter issue

**Solutions**:
1. Restart Next.js dev server
2. Clear browser cache
3. Check frontend query includes `is_active = true` filter
4. Verify `entry_tests.is_active = true` in database

---

## Rollback Instructions

If you need to completely remove PU test:

```sql
-- WARNING: This deletes ALL PU data permanently!

-- Delete mock attempts (if any users tested)
DELETE FROM mock_attempts 
WHERE blueprint_id IN (
  SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock'
);

-- Delete questions
DELETE FROM questions 
WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);

-- Delete blueprint
DELETE FROM mock_test_blueprints WHERE external_id = 'pu-full-mock';

-- Delete topics
DELETE FROM topics 
WHERE chapter_id IN (
  SELECT c.id FROM chapters c
  JOIN test_subjects ts ON ts.subject_id = c.subject_id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);

-- Delete chapters
DELETE FROM chapters 
WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);

-- Delete test_subjects associations
DELETE FROM test_subjects 
WHERE entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu');

-- Delete subjects (if not shared with other tests)
DELETE FROM subjects 
WHERE id IN (
  SELECT s.id FROM subjects s
  WHERE NOT EXISTS (
    SELECT 1 FROM test_subjects ts WHERE ts.subject_id = s.id
  )
  AND s.slug IN ('verbal-reasoning', 'quantitative-reasoning', 'computer-science', 'mathematics', 'physics')
);

-- Finally, delete entry test
DELETE FROM entry_tests WHERE slug = 'pu';
```

Then re-run setup from Step 1.

---

## Next Steps

After successful setup:

1. **Run Integration Tests**: See `PU_INTEGRATION_TEST_PLAN.md`
2. **Admin Panel Config**: See `PU_ADMIN_GUIDE.md`
3. **Deploy to Production**: See deployment checklist in this repo

---

## Support

If you encounter issues not covered here:

1. Check `validate_pu_import.sql` output for data integrity
2. Check `test_pu_mock_generation.sql` for blueprint readiness
3. Review Supabase logs for database errors
4. Check application logs for frontend issues

For questions about CSV import process, see `PU_IMPORT_PROCESS.md`.
