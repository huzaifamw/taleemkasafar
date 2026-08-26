# PU Lahore Entry Test - Import Process Documentation

## Overview
Technical documentation for the PU question import process, from CSV source to database insertion.

---

## Source Data

### CSV File
**Location**: `mcqs/pu_csp_css_mcqs.csv`

**Encoding**: UTF-8 with BOM (Byte Order Mark)
- **Critical**: Must use `encoding='utf-8-sig'` in Python to handle BOM
- Using `encoding='utf-8'` will cause `KeyError: 'external_id'`

### CSV Structure

**Headers** (15 columns):
```
external_id, subject, chapter, topic, question_text, question_type, 
difficulty, option_a, option_b, option_c, option_d, correct_answer, 
explanation, usage, tests
```

**Sample Row**:
```csv
PU-CS-IT-001,Computer Science,Overview of Information Technology,IT Basics,"What does CPU stand for?",mcq,easy,"Central Processing Unit","Computer Personal Unit","Central Processor Unit","Core Processing Unit",A,"CPU stands for Central Processing Unit, the main processor of a computer.",practice,"pu"
```

### Data Mapping

| CSV Column | Database Column | Notes |
|------------|-----------------|-------|
| `external_id` | `questions.external_id` | Unique identifier (e.g., PU-CS-IT-001) |
| `subject` | `subjects.name` | Must match existing subject |
| `chapter` | `chapters.name` | Maps to subject's chapters |
| `topic` | `topics.name` | Maps to chapter's topics |
| `question_text` | `questions.question_text` | Full question body |
| `question_type` | `questions.question_type` | Always 'mcq' for PU |
| `difficulty` | `questions.difficulty` | easy/medium/hard |
| `option_a` through `option_d` | `question_options.option_text` | 4 options per question |
| `correct_answer` | `question_options.is_correct` | A/B/C/D maps to TRUE/FALSE |
| `explanation` | `questions.explanation` | Answer explanation |
| `usage` | Determines `question_usage` enum | practice/past_paper/both |
| `tests` | Links to `entry_tests` | Always "pu" for this import |

---

## Import Script: build_pu_import.py

### Purpose
Generates `import_pu.sql` from CSV source file.

### Location
`mcqs/build_pu_import.py`

### Dependencies
```python
import csv
import uuid
```

No external packages required (uses Python stdlib only).

### Key Functions

#### 1. `slugify(text)`
Converts text to URL-friendly slug format.

**Example**:
```python
slugify("Computer Science")  # → "computer-science"
slugify("Overview of Information Technology")  # → "overview-of-information-technology"
```

#### 2. `clean_text(text)`
Escapes SQL-sensitive characters for safe insertion.

**Handles**:
- Single quotes → doubled (`'` → `''`)
- Backslashes → escaped (`\` → `\\`)
- Newlines → preserved
- Unicode → preserved

**Example**:
```python
clean_text("What's the answer?")  # → "What''s the answer?"
```

#### 3. `difficulty_mapping(csv_difficulty)`
Maps CSV difficulty values to standardized format.

**Mappings**:
```python
'Easy' → 'easy'
'EASY' → 'easy'
'Medium' → 'medium'
'Hard' → 'hard'
```

### Script Flow

```
1. Read CSV (utf-8-sig encoding)
   ↓
2. Build subject/chapter/topic hierarchy
   ↓
3. Process each question row:
   - Lookup subject_id
   - Lookup chapter_id (by subject + chapter name)
   - Lookup topic_id (by chapter + topic name)
   - Generate question UUID
   - Clean question_text and explanation
   - Map difficulty
   - Generate 4 option UUIDs
   ↓
4. Generate SQL:
   - INSERT INTO questions (...)
   - INSERT INTO question_options (...) [4x per question]
   - INSERT INTO question_tests (...) [links to entry_test]
   ↓
5. Write import_pu.sql
```

### Critical Code Sections

**BOM Handling** (Line ~15):
```python
with open('pu_csp_css_mcqs.csv', 'r', encoding='utf-8-sig') as file:
    reader = csv.DictReader(file)
```
❌ **Wrong**: `encoding='utf-8'` → BOM treated as part of first column name → KeyError

✅ **Correct**: `encoding='utf-8-sig'` → BOM automatically stripped

**Subject Resolution** (Line ~40):
```python
subject_map = {
    'Verbal Reasoning': 'verbal-reasoning',
    'Quantitative Reasoning': 'quantitative-reasoning',
    'Computer Science': 'computer-science',
    'Mathematics': 'mathematics',
    'Physics': 'physics'
}
subject_slug = subject_map.get(row['subject'])
```

**Lookup Queries**:
```sql
(SELECT id FROM subjects WHERE slug = 'computer-science')
(SELECT id FROM chapters WHERE slug = 'overview-of-information-technology' 
  AND subject_id = (SELECT id FROM subjects WHERE slug = 'computer-science'))
(SELECT id FROM topics WHERE slug = 'it-basics' 
  AND chapter_id = (...))
```

### Output Format

**Generated SQL Structure**:
```sql
-- Questions (1,444 rows)
INSERT INTO questions (
  id, subject_id, chapter_id, topic_id, question_text, 
  question_type, difficulty, explanation, external_id, 
  usage, moderation_status, created_at, updated_at
) VALUES (
  'uuid-here',
  (SELECT id FROM subjects WHERE slug = 'computer-science'),
  (SELECT id FROM chapters WHERE slug = 'overview-of-information-technology' ...),
  (SELECT id FROM topics WHERE slug = 'it-basics' ...),
  'What does CPU stand for?',
  'mcq',
  'easy',
  'CPU stands for Central Processing Unit...',
  'PU-CS-IT-001',
  'practice',
  'approved',
  NOW(),
  NOW()
);

-- Options (5,888 rows = 1,444 × 4 + 32 deleted)
INSERT INTO question_options (
  id, question_id, option_text, option_order, is_correct
) VALUES 
  ('uuid1', 'question-uuid', 'Central Processing Unit', 'A', true),
  ('uuid2', 'question-uuid', 'Computer Personal Unit', 'B', false),
  ('uuid3', 'question-uuid', 'Central Processor Unit', 'C', false),
  ('uuid4', 'question-uuid', 'Core Processing Unit', 'D', false);

-- Question-Test Associations (1,444 rows)
INSERT INTO question_tests (
  id, question_id, entry_test_id, difficulty
) VALUES (
  'uuid-here',
  'question-uuid',
  (SELECT id FROM entry_tests WHERE slug = 'pu'),
  'easy'
);
```

---

## Running the Import

### Step 1: Generate SQL

```powershell
cd mcqs
python build_pu_import.py
```

**Output**: `import_pu.sql` (4.3 MB)

**Success Indicators**:
- No Python errors
- File size ~4-5 MB
- Contains 1,444 question INSERTs
- Contains 5,888 option INSERTs
- Contains 1,444 question_tests INSERTs

### Step 2: Validate SQL Syntax (Optional)

```powershell
# Check for common SQL errors
Select-String -Path import_pu.sql -Pattern "ERROR|Warning|syntax"
```

Should return no matches.

### Step 3: Execute SQL

**Option A: Supabase SQL Editor**
1. Open `import_pu.sql` in text editor
2. Copy entire content (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Run query
5. Wait 30-60 seconds for completion

**Option B: psql Command Line**
```powershell
$DB_URL = "postgres://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"
Get-Content import_pu.sql | psql $DB_URL
```

**Success Indicators**:
- No SQL errors in output
- `INSERT 0 1` messages (or similar)
- Query completes without timeout

### Step 4: Validate Import

```powershell
psql $DB_URL < validate_pu_import.sql
```

**Expected Output**:
```
==================================================
PU Lahore Import Validation Report
==================================================

1. Total PU Questions: 1444 ✓
2. Total Question Options: 5888 ✓
3. Questions with Correct Options: 1444 ✓
4. Topics Created: 48 ✓
5. Mock Blueprints: 1 ✓

If all checks pass, PU import is SUCCESSFUL!
==================================================
```

---

## Subject-Specific Statistics

### Actual Question Distribution (from CSV)

| Subject | Questions | Easy | Medium | Hard |
|---------|-----------|------|--------|------|
| Computer Science | 499 | 120 | 179 | 200 |
| Verbal Reasoning | 405 | 135 | 135 | 135 |
| Quantitative Reasoning | 220 | 73 | 74 | 73 |
| Mathematics | 161 | 54 | 54 | 53 |
| Physics | 159 | 53 | 53 | 53 |
| **Total** | **1,444** | **435** | **495** | **514** |

### Topic Breakdown

**Computer Science (10 topics, 499Q)**:
- DBMS: 85 questions
- C Programming: 80 questions
- Operating Systems: 75 questions
- Networks: 70 questions
- IT Overview: 65 questions
- Data Structures: 45 questions
- Normalization: 30 questions
- ER Models: 25 questions
- Topologies: 14 questions
- OSI Model: 10 questions

**Verbal Reasoning (10 topics, 405Q)**:
- Vocabulary: 60 questions
- Synonyms: 55 questions
- Antonyms: 55 questions
- Sentence Completion: 50 questions
- Analogies: 50 questions
- Critical Reading: 45 questions
- Reading Comprehension: 40 questions
- Grammar: 30 questions
- Prepositions: 10 questions
- Articles: 10 questions

*(Similar breakdowns exist for Quant, Maths, Physics)*

---

## Troubleshooting

### Error: KeyError: 'external_id'

**Cause**: BOM (Byte Order Mark) in CSV file not handled

**Solution**:
```python
# Change line 15 in build_pu_import.py
# FROM:
with open('pu_csp_css_mcqs.csv', 'r', encoding='utf-8') as file:

# TO:
with open('pu_csp_css_mcqs.csv', 'r', encoding='utf-8-sig') as file:
```

### Error: Subject not found

**Cause**: CSV subject name doesn't match database subject

**Solution**: Update `subject_map` in script:
```python
subject_map = {
    'Verbal Reasoning': 'verbal-reasoning',  # Must match exactly
    # Add new mapping if CSV has different name
    'Verbal': 'verbal-reasoning'
}
```

### Error: Chapter/Topic not found

**Cause**: Topics created in migration but slugs don't match CSV

**Solution**: Check topic slugs:
```sql
SELECT t.external_id, t.name, t.slug, c.name as chapter, s.name as subject
FROM topics t
JOIN chapters c ON c.id = t.chapter_id
JOIN subjects s ON s.id = c.subject_id
WHERE s.slug = 'computer-science';
```

Verify slugs match `slugify()` output of CSV values.

### Error: Duplicate key violation

**Cause**: Running import twice without cleanup

**Solution**: Delete existing PU questions first:
```sql
DELETE FROM questions 
WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);
```

Then re-run import.

### Error: Query timeout in SQL Editor

**Cause**: 4.3MB SQL file too large for single execution

**Solution**: Split import_pu.sql into chunks:
```powershell
# Split every 500 lines
$lines = Get-Content import_pu.sql
for ($i = 0; $i -lt $lines.Count; $i += 500) {
    $lines[$i..($i+499)] | Out-File "import_pu_part_$($i/500).sql"
}
```

Execute each part separately.

---

## Data Quality Checks

### Pre-Import Validation

Run these checks on CSV before generating SQL:

**1. Check for duplicate external_ids**:
```python
import csv
from collections import Counter

with open('pu_csp_css_mcqs.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    ids = [row['external_id'] for row in reader]
    duplicates = [id for id, count in Counter(ids).items() if count > 1]
    print(f"Duplicates: {duplicates}")
```

**2. Check for empty required fields**:
```python
required = ['external_id', 'subject', 'question_text', 'correct_answer']
with open('pu_csp_css_mcqs.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader, start=2):  # Line 2 = first data row
        for field in required:
            if not row.get(field, '').strip():
                print(f"Line {i}: Missing {field}")
```

**3. Check correct_answer format**:
```python
with open('pu_csp_css_mcqs.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader, start=2):
        if row['correct_answer'] not in ['A', 'B', 'C', 'D']:
            print(f"Line {i}: Invalid correct_answer: {row['correct_answer']}")
```

### Post-Import Validation

Run `validate_pu_import.sql` (see Task 5 documentation).

---

## Updating Questions

### Adding New Questions to CSV

1. Open `pu_csp_css_mcqs.csv` in Excel/text editor
2. Add new row with all required columns
3. Use consistent formatting:
   - `external_id`: PU-[SUBJECT]-[TOPIC]-[NUMBER] (e.g., PU-CS-DBMS-501)
   - `subject`: Exact match to existing subjects
   - `difficulty`: easy/medium/hard (lowercase)
   - `correct_answer`: A/B/C/D (uppercase)
   - `tests`: "pu"

4. Save file (UTF-8 with BOM)
5. Re-run `build_pu_import.py`
6. Execute generated SQL (only new questions will insert if using proper IDs)

### Bulk Editing Questions

**Recommend**: Edit SQL directly for bulk changes:

```sql
-- Change all "easy" CS questions to "medium"
UPDATE questions 
SET difficulty = 'medium'
WHERE subject_id = (SELECT id FROM subjects WHERE slug = 'computer-science')
  AND difficulty = 'easy'
  AND external_id LIKE 'PU-CS-%';
```

Then re-export to CSV to keep in sync:
```sql
\copy (SELECT external_id, ...) TO 'pu_updated.csv' WITH CSV HEADER;
```

---

## Performance Considerations

### Import Speed
- **1,444 questions**: ~30-60 seconds in Supabase
- **Rate**: ~25-50 questions/second
- **Bottleneck**: Subquery lookups for subject/chapter/topic IDs

### Optimization Opportunities

**Current**: Subqueries in every INSERT
```sql
INSERT INTO questions (...) VALUES (
  'uuid',
  (SELECT id FROM subjects WHERE slug = 'computer-science'),  -- Repeated 499 times!
  ...
);
```

**Optimized**: Use CTEs or temp table
```sql
WITH subject_ids AS (
  SELECT slug, id FROM subjects WHERE slug IN ('computer-science', 'verbal-reasoning', ...)
)
INSERT INTO questions (...)
SELECT 
  'uuid',
  si.id,
  ...
FROM subject_ids si
WHERE si.slug = 'computer-science';
```

**Savings**: Could reduce import time by 50% (15-30 seconds)

---

## Export Process

### Exporting PU Questions Back to CSV

```sql
\copy (
  SELECT 
    q.external_id,
    s.name as subject,
    c.name as chapter,
    t.name as topic,
    q.question_text,
    q.question_type,
    q.difficulty,
    opt_a.option_text as option_a,
    opt_b.option_text as option_b,
    opt_c.option_text as option_c,
    opt_d.option_text as option_d,
    CASE 
      WHEN opt_a.is_correct THEN 'A'
      WHEN opt_b.is_correct THEN 'B'
      WHEN opt_c.is_correct THEN 'C'
      WHEN opt_d.is_correct THEN 'D'
    END as correct_answer,
    q.explanation,
    q.usage,
    'pu' as tests
  FROM questions q
  JOIN subjects s ON s.id = q.subject_id
  JOIN chapters c ON c.id = q.chapter_id
  JOIN topics t ON t.id = q.topic_id
  JOIN question_tests qt ON qt.question_id = q.id
  JOIN entry_tests et ON et.id = qt.entry_test_id
  LEFT JOIN question_options opt_a ON opt_a.question_id = q.id AND opt_a.option_order = 'A'
  LEFT JOIN question_options opt_b ON opt_b.question_id = q.id AND opt_b.option_order = 'B'
  LEFT JOIN question_options opt_c ON opt_c.question_id = q.id AND opt_c.option_order = 'C'
  LEFT JOIN question_options opt_d ON opt_d.question_id = q.id AND opt_d.option_order = 'D'
  WHERE et.slug = 'pu'
  ORDER BY q.external_id
) TO 'pu_export.csv' WITH CSV HEADER;
```

---

## File Manifest

### Input Files
- `mcqs/pu_csp_css_mcqs.csv` (600 KB) - Source data

### Generated Files
- `mcqs/import_pu.sql` (4.3 MB) - INSERT statements

### Validation Files
- `mcqs/validate_pu_import.sql` (14 KB) - Post-import checks
- `mcqs/test_pu_mock_generation.sql` (12 KB) - Blueprint readiness

### Script Files
- `mcqs/build_pu_import.py` (8 KB) - SQL generator

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial import (1,444 questions) |
| 1.1 | - | (Future) Added Biology subject |

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Script Version**: build_pu_import.py v1.0
