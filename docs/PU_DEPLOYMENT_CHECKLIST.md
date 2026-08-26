# PU Lahore Entry Test - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Preparation

#### Database Access
- [ ] Supabase project URL available
- [ ] Database connection credentials secured
- [ ] SQL Editor access verified OR psql client installed
- [ ] Database backup completed (if production)

#### File Verification
- [ ] `supabase/migrations/20260820000000_add_pu_test.sql` exists
- [ ] `supabase/migrations/20260820100000_add_pu_topics.sql` exists
- [ ] `supabase/migrations/20260820200000_add_pu_blueprint.sql` exists
- [ ] `mcqs/import_pu.sql` exists (4.3MB)
- [ ] `mcqs/validate_pu_import.sql` exists
- [ ] `mcqs/test_pu_mock_generation.sql` exists

#### Code Review
- [ ] Migrations reviewed by tech lead
- [ ] Import script tested in staging
- [ ] No hardcoded credentials in migration files
- [ ] External IDs follow naming convention (PU-SUBJECT-TOPIC-NNN)

---

## Staging Deployment

### Phase 1: Structure Setup (Migrations)

**Task**: Run 3 migration files

- [ ] Execute `20260820000000_add_pu_test.sql`
  - **Verify**: `SELECT * FROM entry_tests WHERE slug = 'pu';` returns 1 row
  - **Verify**: `SELECT COUNT(*) FROM test_subjects WHERE entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu');` returns 5

- [ ] Execute `20260820100000_add_pu_topics.sql`
  - **Verify**: Topic count query returns 48
  ```sql
  SELECT COUNT(*) FROM topics 
  WHERE chapter_id IN (
    SELECT c.id FROM chapters c
    JOIN test_subjects ts ON ts.subject_id = c.subject_id
    JOIN entry_tests et ON et.id = ts.entry_test_id
    WHERE et.slug = 'pu'
  );
  ```

- [ ] Execute `20260820200000_add_pu_blueprint.sql`
  - **Verify**: `SELECT * FROM mock_test_blueprints WHERE external_id = 'pu-full-mock';` returns 1 row
  - **Verify**: Blueprint has 5 slots totaling 100 questions

**Time Estimate**: 5 minutes

**Rollback**: If Phase 1 fails, run:
```sql
DELETE FROM entry_tests WHERE slug = 'pu';
```

---

### Phase 2: Question Import

**Task**: Import 1,444 questions with options

- [ ] Execute `mcqs/import_pu.sql`
  - **Method**: SQL Editor (chunked) OR psql command line
  - **Duration**: 30-60 seconds
  - **Watch for**: Duplicate key errors, constraint violations

- [ ] Run validation script
  ```bash
  psql $DB_URL < mcqs/validate_pu_import.sql
  ```
  
- [ ] Verify output:
  - [ ] Total PU Questions: ~1,444 ✓
  - [ ] Total Options: ~5,888 ✓
  - [ ] Questions with Correct Options: ~1,444 ✓
  - [ ] All subjects have questions:
    - [ ] Computer Science: ~499
    - [ ] Verbal Reasoning: ~405
    - [ ] Quantitative Reasoning: ~220
    - [ ] Mathematics: ~161
    - [ ] Physics: ~159

**Time Estimate**: 3-5 minutes

**Rollback**: If Phase 2 fails:
```sql
DELETE FROM questions 
WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);
```

---

### Phase 3: Mock Generation Testing

**Task**: Verify mock test can be generated

- [ ] Execute `mcqs/test_pu_mock_generation.sql`
- [ ] Verify all checks PASS:
  - [ ] Blueprint Exists: PASS
  - [ ] Has 5 Slots: PASS
  - [ ] Slot Totals = 100: PASS
  - [ ] Verbal (20): SUFFICIENT
  - [ ] Quant (20): SUFFICIENT
  - [ ] CS (20): SUFFICIENT
  - [ ] Maths (20): SUFFICIENT
  - [ ] Physics (20): SUFFICIENT

- [ ] Attempt dry-run mock generation:
  ```sql
  SELECT generate_mock_attempt(
    (SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock')
  );
  ```
  - **Expected**: Returns UUID (mock attempt ID)
  - **If fails**: Check error message for insufficient questions

**Time Estimate**: 2 minutes

---

### Phase 4: Application Integration

**Task**: Verify PU test appears in frontend

- [ ] Restart application server (clear cache)
- [ ] Log in as test user
- [ ] Navigate to dashboard
- [ ] **Verify**: "PU Lahore" appears in test selection dropdown
- [ ] Select "PU Lahore" test
- [ ] Navigate to Subjects page
- [ ] **Verify**: 5 subject cards display (Verbal, Quant, CS, Maths, Physics)
- [ ] Click one subject (e.g., Computer Science)
- [ ] **Verify**: Chapters/topics list loads
- [ ] Click "Practice" on any topic
- [ ] **Verify**: Questions load with 4 options
- [ ] Answer a question
- [ ] **Verify**: Immediate feedback appears

**Time Estimate**: 5-10 minutes

---

### Phase 5: Mock Test Flow

**Task**: Complete full mock test workflow

- [ ] Navigate to Mock Tests page
- [ ] Click "Start New Mock Test" for PU
- [ ] **Verify**: Mock generates successfully (< 3 seconds)
- [ ] **Verify**: Mock shows:
  - [ ] 100 questions total
  - [ ] Timer: 80:00 (80 minutes)
  - [ ] Question 1/100 displayed
  - [ ] 4 options selectable
- [ ] Answer 5-10 questions (mix of subjects)
- [ ] Submit mock test
- [ ] **Verify**: Results page loads
- [ ] **Verify**: Results show:
  - [ ] Total score (out of 100)
  - [ ] Time taken
  - [ ] Subject-wise breakdown
  - [ ] Can review answers

**Time Estimate**: 10-15 minutes

---

### Phase 6: Staging Sign-Off

**Task**: Get approval to proceed to production

- [ ] All integration tests passed (see `PU_INTEGRATION_TEST_PLAN.md`)
- [ ] No JavaScript errors in browser console
- [ ] No database errors in logs
- [ ] Performance acceptable (mock generation < 3s, page loads < 2s)
- [ ] Stakeholder reviewed and approved
- [ ] **Sign-off**: _________________ Date: _______

---

## Production Deployment

### Pre-Production Checks

- [ ] Staging deployment completed successfully
- [ ] All integration tests passed in staging
- [ ] Production database backup completed
- [ ] Rollback plan reviewed and understood
- [ ] Deployment window scheduled (low traffic period recommended)
- [ ] Team notified of deployment
- [ ] Monitoring/alerting enabled

### Production Deployment Steps

**Option A: Automated Script**
```bash
# Set production DB URL
export SUPABASE_DB_URL="postgres://postgres:[PROD-PASSWORD]@[PROD-PROJECT].supabase.co:5432/postgres"

# Run deployment script
./scripts/deploy_pu_test.sh production
```

**Option B: Manual Steps**
Follow same phases as Staging Deployment (Phases 1-3)

### Production Verification

- [ ] Re-run all verification queries from staging
- [ ] Log in as real user (not admin)
- [ ] Complete Phases 4-5 verification in production
- [ ] Check production logs for errors
- [ ] Monitor database performance metrics

**Time Estimate**: 15-20 minutes

---

## Post-Deployment Monitoring

### First Hour
- [ ] Check error logs every 15 minutes
- [ ] Monitor user activity (mock attempts, practice sessions)
- [ ] Watch for database slow queries
- [ ] Verify no spike in error rates

### First 24 Hours
- [ ] Review user analytics:
  - [ ] How many users selected PU test?
  - [ ] How many mock attempts created?
  - [ ] Any questions with 0% or 100% accuracy? (potential errors)
- [ ] Check support tickets for PU-related issues
- [ ] Monitor database disk space (new questions added)

### First Week
- [ ] Collect user feedback
- [ ] Review question accuracy rates
- [ ] Identify problematic questions (very low accuracy)
- [ ] Plan content improvements based on data

---

## Rollback Plan

### When to Rollback
- Critical bugs preventing users from taking tests
- Data corruption detected
- Performance degradation severe enough to impact other tests
- Security vulnerability discovered

### Rollback Procedure

**Step 1: Disable PU Test (Soft Rollback)**
```sql
-- Makes test invisible to users but preserves data
UPDATE entry_tests 
SET is_active = false 
WHERE slug = 'pu';
```
**Time**: < 1 minute  
**Impact**: Users cannot select PU test, but existing data preserved

**Step 2: Full Rollback (Hard Delete)**
```sql
-- WARNING: Permanent data deletion!

BEGIN;

-- Delete mock attempts (if any)
DELETE FROM mock_attempts 
WHERE blueprint_id IN (
  SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock'
);

-- Delete user responses to PU questions
DELETE FROM user_responses 
WHERE question_id IN (
  SELECT q.id FROM questions q
  JOIN test_subjects ts ON ts.subject_id = q.subject_id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
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

-- Delete subjects (only if not used by other tests)
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

COMMIT;
```

**Time**: 2-5 minutes  
**Impact**: All PU data permanently deleted

**Step 3: Restore from Backup (if needed)**
```bash
# If rollback causes issues, restore database backup
psql $DB_URL < backup_before_pu_deployment.sql
```

---

## Common Issues & Solutions

### Issue: PU test not appearing in dropdown

**Diagnostic**:
```sql
SELECT slug, name, is_active FROM entry_tests WHERE slug = 'pu';
```

**Solutions**:
- If `is_active = false`: Run `UPDATE entry_tests SET is_active = true WHERE slug = 'pu';`
- If no rows: Re-run migration 1
- If exists but not in UI: Clear frontend cache, restart server

### Issue: Mock generation fails

**Diagnostic**:
```bash
psql $DB_URL < mcqs/test_pu_mock_generation.sql
```

**Solutions**:
- If "INSUFFICIENT" for any subject: Import script missed questions for that subject
- If "Blueprint not found": Re-run migration 3
- If "No slots": Check `mock_blueprint_slots` table

### Issue: Questions display wrong difficulty

**Solution**:
```sql
-- Update question difficulty
UPDATE question_tests 
SET difficulty = 'medium'  -- or 'easy', 'hard'
WHERE question_id IN (
  SELECT q.id FROM questions q
  WHERE q.external_id LIKE 'PU-CS-%'  -- adjust pattern
)
AND entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu');
```

### Issue: Performance degradation

**Diagnostic**:
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%questions%' OR query LIKE '%mock%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Solutions**:
- Add indexes on frequently queried columns
- Run `VACUUM ANALYZE questions;`
- Consider materialized views for analytics

---

## Success Criteria

Deployment is considered successful when:

- [x] All 3 migrations executed without errors
- [x] 1,444 questions imported with 5,888 options
- [x] Validation script shows all checks passing
- [x] Mock generation test shows all subjects SUFFICIENT
- [x] PU test visible in frontend dropdown
- [x] Users can practice questions from all topics
- [x] Users can generate and complete 100-question mock tests
- [x] Results calculate correctly with subject breakdown
- [x] No critical errors in logs for 24 hours post-deployment
- [x] User feedback positive (no blocking issues reported)

---

## Communication Plan

### Pre-Deployment Announcement
**To**: All users  
**When**: 24 hours before deployment  
**Message**:
> "We're launching PU Lahore Entry Test tomorrow! Practice 1,400+ questions and take full 100-question mock tests. Available from [TIME] on [DATE]."

### Deployment Notification
**To**: Team Slack/Discord  
**When**: During deployment  
**Message**:
> "🚀 PU Lahore deployment in progress. ETA: 20 minutes. Production may be briefly unavailable."

### Go-Live Announcement
**To**: All users  
**When**: After successful deployment  
**Message**:
> "🎉 PU Lahore Entry Test is now live! Select 'PU Lahore' from your dashboard to start practicing. Good luck with your preparation!"

### Rollback Notification (if needed)
**To**: All users + team  
**When**: After rollback  
**Message**:
> "We've temporarily disabled PU Lahore test due to [ISSUE]. We're working on a fix and will re-launch soon. Thank you for your patience."

---

## Deployment Sign-Off

### Staging
- [ ] Technical Lead: _________________ Date: _______
- [ ] QA Engineer: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

### Production
- [ ] Technical Lead: _________________ Date: _______
- [ ] DevOps Engineer: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

---

**Checklist Version**: 1.0  
**Last Updated**: January 2026  
**Next Review**: After first production deployment
