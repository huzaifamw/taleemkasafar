# Task 4: CSV Import Script - COMPLETED ✅

## Summary

Successfully generated SQL import file for 1,444 PU Lahore questions from CSV.

## Files Created

### 1. `mcqs/build_pu_import.py` ✅
**Status**: Complete and working

**Key Features**:
- Parses `pu_csp_css_mcqs.csv` (handles UTF-8 BOM correctly)
- Generates idempotent SQL (ON CONFLICT DO UPDATE)
- Maps CSV columns to database schema
- Links questions to topics via external_id lookups
- Associates all questions with PU test as 'practice' usage
- Includes progress indicators and error handling
- Generates verification queries at end of SQL

**Encoding Fix**: Changed from `utf-8` to `utf-8-sig` to handle BOM

### 2. `mcqs/import_pu.sql` ✅
**Status**: Generated successfully

**Contents**:
- 1,444 question INSERT statements
- 5,888 question_options INSERT statements (4 options × 1,444 questions + some 5-option questions)
- 1,444 question_tests associations
- Embedded verification queries
- Summary statistics

**File Size**: 4.3 MB

## Import Statistics

| Metric | Count |
|--------|-------|
| **Total CSV Rows** | 1,445 |
| **Successfully Processed** | 1,444 |
| **Skipped** | 1 (missing essential fields) |
| **Generated Questions** | 1,444 |
| **Generated Options** | 5,888 |
| **Test Associations** | 1,444 |

### Questions by Subject
- Computer Science: 499 questions
- Verbal Reasoning: 405 questions
- Quantitative Reasoning: 220 questions
- Mathematics: 161 questions
- Physics: 159 questions

**Total**: 1,444 questions

### Questions by Difficulty
- Easy: 842 questions (58%)
- Medium: 444 questions (31%)
- Hard: 158 questions (11%)

## SQL File Structure

```sql
-- =====================================================================
-- 1. Insert Questions (1,444 statements)
-- =====================================================================
-- Each question INSERT:
--   - Maps subject_slug to subject_id via SELECT
--   - Maps chapter_slug to topic_id via external_id pattern
--   - Sets difficulty, statement, explanation, source
--   - Uses ON CONFLICT for idempotency

-- =====================================================================
-- 2. Insert Question Options (5,888 statements)
-- =====================================================================
-- 4 options per question (a, b, c, d)
-- Some questions have 5 options (includes 'e')
-- One option marked is_correct per question

-- =====================================================================
-- 3. Link Questions to PU Test (1,444 statements)
-- =====================================================================
-- All questions linked as 'practice' usage type
-- Links to entry_test where slug='pu'

-- =====================================================================
-- 4. Verification Queries
-- =====================================================================
-- Count questions by subject
-- Verify option counts (4 or 5 per question)
-- Verify exactly 1 correct answer per question
-- Total question count
```

## How to Execute

### Prerequisites
1. Migrations 1-3 must be run first:
   ```bash
   psql -d your_db -f supabase/migrations/20260820000000_add_pu_test.sql
   psql -d your_db -f supabase/migrations/20260820100000_add_pu_topics.sql
   psql -d your_db -f supabase/migrations/20260820200000_add_pu_blueprint.sql
   ```

2. Verify prerequisites exist:
   ```sql
   -- Check PU test exists
   SELECT id FROM entry_tests WHERE slug = 'pu';
   
   -- Check subjects exist
   SELECT COUNT(*) FROM subjects 
   WHERE slug IN ('verbal-reasoning', 'quantitative-reasoning', 
                  'computer-science', 'mathematics', 'physics');
   -- Should return 5
   
   -- Check topics exist
   SELECT COUNT(*) FROM topics WHERE external_id LIKE 'pu-%';
   -- Should return 48
   ```

### Import Questions

**Option A: Using psql**
```bash
cd Taleemkasafar/mcqs
psql -d your_database_name -f import_pu.sql
```

**Option B: Using Supabase CLI**
```bash
cd Taleemkasafar
supabase db execute --file mcqs/import_pu.sql
```

**Option C: Copy-paste in SQL editor**
- Open your database SQL editor (Supabase Studio, pgAdmin, etc.)
- Copy contents of `import_pu.sql`
- Execute
- Check verification query results at end

### Expected Duration
- **Small database**: 30-60 seconds
- **Large database**: 2-5 minutes
- Progress: PostgreSQL will show progress after each batch

## Verification After Import

The SQL file includes verification queries at the end. Expected results:

### 1. Questions by Subject
```
Computer Science: 499
Mathematics: 161  
Physics: 159
Quantitative Reasoning: 220
Verbal Reasoning: 405
```

### 2. Wrong Option Count
```
check_name                        | count
----------------------------------|------
Questions with wrong option count | 0
```
*All questions should have 4 or 5 options*

### 3. Wrong Correct Answer Count
```
check_name                              | count
----------------------------------------|------
Questions with wrong correct answer count| 0
```
*All questions should have exactly 1 correct answer*

### 4. Total Questions
```
metric              | value
--------------------|------
Total PU Questions  | 1444
```

## Troubleshooting

### Foreign Key Violation
**Error**: `foreign key constraint "questions_subject_id_fkey"`

**Solution**: Run migrations 1-3 first to create subjects and topics

### Duplicate Key Error
**Error**: `duplicate key value violates unique constraint "questions_external_id_key"`

**Solution**: Questions already imported. The script is idempotent - it will UPDATE existing questions instead of failing.

### Topic Not Found
**Error**: Some questions have NULL topic_id

**Cause**: Chapter slug in CSV doesn't match any topic external_id

**Solution**: Check topics migration includes all chapter slugs from CSV, or manually map missing topics

### Performance Issues
**Symptom**: Import takes >10 minutes

**Solutions**:
- Temporarily disable triggers/indexes
- Increase work_mem setting
- Use COPY instead of INSERT (requires CSV preprocessing)

## Script Customization

If you need to modify the import behavior, edit `build_pu_import.py`:

### Change Usage Type
```python
# Line ~171: Change 'practice' to 'past_paper'
usage_type: 'past_paper'::question_usage
```

### Change Difficulty Mapping
```python
def map_difficulty(csv_difficulty):
    # Customize mapping logic here
    difficulty = str(csv_difficulty).strip().lower()
    if difficulty in ['easy', 'medium', 'hard']:
        return difficulty
    return 'medium'  # default
```

### Add Additional Fields
```python
# In question INSERT section, add:
some_field = (row.get('some_csv_column') or '').strip()
# Then include in INSERT statement
```

### Change Moderation Status
```python
# Line ~155: Change 'approved' to 'pending'
moderation_status: 'pending'::moderation_status
```

## Re-running the Script

To regenerate `import_pu.sql`:

```bash
cd Taleemkasafar/mcqs
python build_pu_import.py
```

The script will:
1. Read `pu_csp_css_mcqs.csv`
2. Process all rows
3. Overwrite `import_pu.sql` with fresh output
4. Show summary statistics

**Note**: This only regenerates the SQL file. You still need to execute it against the database.

## What's Included

✅ All CSV fields mapped correctly
✅ Subject and topic lookups via slugs (no hardcoded UUIDs)
✅ Difficulty enum validation
✅ SQL injection prevention (proper escaping)
✅ 4-option and 5-option question support
✅ Correct answer validation
✅ Idempotent INSERTs (can run multiple times)
✅ Progress indicators during generation
✅ Comprehensive verification queries
✅ Error handling for malformed rows

## What's NOT Included

❌ Question images (CSV doesn't have image paths)
❌ Past paper year/session metadata
❌ Question tags or categories beyond subject/topic
❌ User-specific data (attempts, bookmarks, etc.)
❌ Learning resources or explanatory videos

## Next Steps

After successful import:

1. ✅ **Verify data integrity** - Run validation script (Task 5)
2. ✅ **Test mock generation** - Verify sufficient questions per slot (Task 6)
3. ✅ **Integration testing** - Test all features end-to-end (Task 7)
4. ✅ **Documentation** - Create admin guides (Task 8)
5. ✅ **Deploy** - Push to production (Task 9-10)

---

**Status**: TASK 4 COMPLETE ✅  
**Date**: 2026-08-26  
**Time Taken**: ~2 hours  
**Blockers Resolved**: UTF-8 BOM encoding issue, Unicode print error  
**Next Milestone**: Task 5 (Validation Script)
