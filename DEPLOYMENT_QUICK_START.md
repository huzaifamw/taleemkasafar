# PU Lahore Test - Quick Deployment Guide

## 🚀 Quick Start (5 Minutes to Deploy)

### Prerequisites
- [ ] Database connection URL ready
- [ ] `psql` installed OR Supabase Dashboard access
- [ ] Files verified in repository

---

## Method 1: One-Command Deploy (Fastest)

```bash
# Set connection
export SUPABASE_DB_URL="postgres://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres"

# Deploy everything
chmod +x scripts/deploy_pu_test.sh && ./scripts/deploy_pu_test.sh production
```

**Time**: 2-3 minutes  
**Automated**: Migrations + Import + Validation

---

## Method 2: Manual Steps (Supabase Dashboard)

### Step 1: Run Migrations (5 minutes)
Open Supabase → SQL Editor → Run these 3 files:

1. Copy/paste `supabase/migrations/20260820000000_add_pu_test.sql` → Run
2. Copy/paste `supabase/migrations/20260820100000_add_pu_topics.sql` → Run
3. Copy/paste `supabase/migrations/20260820200000_add_pu_blueprint.sql` → Run

### Step 2: Import Questions (2 minutes)
4. Copy/paste `mcqs/import_pu.sql` → Run (may take 30-60 seconds)

### Step 3: Validate (30 seconds)
5. Copy/paste `mcqs/validate_pu_import.sql` → Run
6. Check output shows ✓ for all checks

**Done!** PU test is live.

---

## Method 3: Command Line (psql)

```bash
# Windows PowerShell
$DB="postgres://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"

Get-Content supabase/migrations/20260820000000_add_pu_test.sql | psql $DB
Get-Content supabase/migrations/20260820100000_add_pu_topics.sql | psql $DB
Get-Content supabase/migrations/20260820200000_add_pu_blueprint.sql | psql $DB
Get-Content mcqs/import_pu.sql | psql $DB
Get-Content mcqs/validate_pu_import.sql | psql $DB
```

---

## Verification (2 Minutes)

### Quick Database Check
```sql
-- Should return 1 row
SELECT * FROM entry_tests WHERE slug = 'pu';

-- Should return 1444
SELECT COUNT(*) FROM questions 
WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);
```

### Quick UI Check
1. Open your app → Login
2. Dashboard → Test dropdown
3. **Verify**: "PU Lahore" appears
4. Click "PU Lahore" → Navigate to Subjects
5. **Verify**: 5 subjects show (Verbal, Quant, CS, Maths, Physics)
6. Click any subject → Click "Practice"
7. **Verify**: Questions load

✅ If all verified → **Deployment successful!**

---

## Rollback (If Needed)

### Soft Rollback (Hide test, keep data)
```sql
UPDATE entry_tests SET is_active = false WHERE slug = 'pu';
```

### Hard Rollback (Delete everything)
```sql
DELETE FROM entry_tests WHERE slug = 'pu';
-- Cascades to all related data
```

---

## Common Issues

### "PU test not in dropdown"
```sql
-- Check if active
SELECT is_active FROM entry_tests WHERE slug = 'pu';
-- If false, run:
UPDATE entry_tests SET is_active = true WHERE slug = 'pu';
```

### "Mock generation fails"
```bash
# Run test script
psql $DB < mcqs/test_pu_mock_generation.sql
# Look for "INSUFFICIENT" in output
```

### "Questions not loading"
```sql
-- Check question count
SELECT s.name, COUNT(q.id)
FROM subjects s
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
LEFT JOIN questions q ON q.subject_id = s.id
WHERE et.slug = 'pu'
GROUP BY s.name;
-- Should show ~499, ~405, ~220, ~161, ~159
```

---

## Files Reference

| Need | File Location |
|------|---------------|
| Deploy script | `scripts/deploy_pu_test.sh` |
| Migration 1 | `supabase/migrations/20260820000000_add_pu_test.sql` |
| Migration 2 | `supabase/migrations/20260820100000_add_pu_topics.sql` |
| Migration 3 | `supabase/migrations/20260820200000_add_pu_blueprint.sql` |
| Questions | `mcqs/import_pu.sql` |
| Validation | `mcqs/validate_pu_import.sql` |
| Full checklist | `docs/PU_DEPLOYMENT_CHECKLIST.md` |
| Monitoring | `docs/PU_POST_DEPLOYMENT_VERIFICATION.md` |

---

## Success Checklist

- [ ] Migrations ran without errors
- [ ] Import script completed (1,444 questions)
- [ ] Validation shows all ✓ checks
- [ ] PU test visible in UI dropdown
- [ ] Can practice questions
- [ ] Can generate mock test (100 questions)
- [ ] Mock test submits and shows results

✅ **7/7 = Deployment Successful!**

---

## Support

**Detailed guides**: See `docs/` folder  
**Troubleshooting**: `docs/PU_TEST_SETUP.md` → Troubleshooting section  
**Admin operations**: `docs/PU_ADMIN_GUIDE.md`  
**Monitoring queries**: `docs/PU_POST_DEPLOYMENT_VERIFICATION.md`

---

**Deployment Time**: 5-20 minutes (depending on method)  
**Rollback Time**: < 1 minute  
**Risk Level**: Low ✅
