# PU Lahore Entry Test - Post-Deployment Verification

## Overview
Verification and monitoring procedures after PU test deployment to ensure system stability and user satisfaction.

---

## Immediate Verification (Within 5 Minutes)

### 1. Smoke Tests

**Database Connectivity**
```sql
-- Test 1: Entry test exists and is active
SELECT id, slug, name, is_active 
FROM entry_tests 
WHERE slug = 'pu';

-- Expected: 1 row, is_active = true
```

```sql
-- Test 2: Question count is correct
SELECT COUNT(*) as total_questions
FROM questions 
WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
);

-- Expected: ~1,444
```

```sql
-- Test 3: Mock blueprint is active
SELECT id, external_id, total_questions, is_active
FROM mock_test_blueprints
WHERE external_id = 'pu-full-mock';

-- Expected: 1 row, total_questions = 100, is_active = true
```

**Application Health**
- [ ] Homepage loads without errors
- [ ] Dashboard loads without errors
- [ ] No 500 errors in application logs
- [ ] No database connection errors

---

### 2. Critical User Paths

**Path A: Test Selection**
1. Navigate to dashboard
2. Locate test selection dropdown
3. **Verify**: "PU Lahore" appears as option
4. Select "PU Lahore"
5. **Verify**: Page updates/redirects successfully

**Path B: Subject Navigation**
1. With PU test selected, navigate to Subjects
2. **Verify**: 5 subjects display (Verbal, Quant, CS, Maths, Physics)
3. Click any subject
4. **Verify**: Chapters/topics list loads

**Path C: Practice Question**
1. From subject page, click any topic
2. Click "Practice" or "Start Practice"
3. **Verify**: Question displays with 4 options
4. Select an answer
5. **Verify**: Immediate feedback shows (correct/incorrect)
6. **Verify**: Explanation displays

**Path D: Mock Test Generation**
1. Navigate to Mock Tests page
2. Click "Start New Mock Test"
3. **Verify**: Mock generates in < 3 seconds
4. **Verify**: Redirects to mock attempt page
5. **Verify**: Shows question 1/100
6. **Verify**: Timer starts at 80:00

**Time Estimate**: 5-10 minutes

---

## First Hour Monitoring

### 3. Error Log Review

**Check Application Logs**
```bash
# Example for Node.js/Next.js
tail -f logs/production.log | grep -i "error\|exception\|failed"
```

**Watch For**:
- Database query errors (e.g., relation not found, column not found)
- JavaScript exceptions in frontend
- Timeout errors during mock generation
- Authentication/authorization errors

**Action If Errors Found**: Document error, assess severity, escalate if critical

---

### 4. Database Performance Metrics

**Query Performance**
```sql
-- Check for slow queries related to PU test
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%pu%' OR query LIKE '%PU%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Expected**: All queries < 1000ms mean execution time

**Connection Pool**
```sql
-- Check active connections
SELECT COUNT(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';
```

**Expected**: Within normal range (< 80% of max connections)

**Table Sizes**
```sql
-- Check table growth
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('questions', 'question_options', 'mock_attempts', 'user_responses')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Action If Issues**: Consider adding indexes, run VACUUM ANALYZE

---

### 5. User Activity Monitoring

**Mock Attempts Created**
```sql
-- Count mock attempts in last hour
SELECT 
  COUNT(*) as total_attempts,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(score) as avg_score
FROM mock_attempts ma
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
  AND ma.created_at > NOW() - INTERVAL '1 hour';
```

**Practice Sessions**
```sql
-- Count practice questions answered in last hour
SELECT 
  COUNT(*) as questions_answered,
  COUNT(DISTINCT ur.user_id) as unique_users
FROM user_responses ur
JOIN questions q ON q.id = ur.question_id
JOIN test_subjects ts ON ts.subject_id = q.subject_id
JOIN entry_tests et ON et.id = ts.entry_test_id
WHERE et.slug = 'pu'
  AND ur.created_at > NOW() - INTERVAL '1 hour';
```

**Expected**: Some activity if users are online; 0 is acceptable if off-peak hours

---

## First 24 Hours Monitoring

### 6. User Engagement Metrics

**Daily Active Users**
```sql
-- Users who interacted with PU test today
SELECT COUNT(DISTINCT user_id) as dau
FROM (
  -- Users who answered practice questions
  SELECT ur.user_id
  FROM user_responses ur
  JOIN questions q ON q.id = ur.question_id
  JOIN test_subjects ts ON ts.subject_id = q.subject_id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
    AND ur.created_at > CURRENT_DATE
  
  UNION
  
  -- Users who created mock attempts
  SELECT ma.user_id
  FROM mock_attempts ma
  JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
  WHERE bp.external_id = 'pu-full-mock'
    AND ma.created_at > CURRENT_DATE
) combined;
```

**Mock Test Completion Rate**
```sql
-- Percentage of mocks completed vs abandoned
SELECT 
  COUNT(*) as total_attempts,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
  SUM(CASE WHEN status = 'abandoned' THEN 1 ELSE 0 END) as abandoned,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate_pct
FROM mock_attempts ma
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
  AND ma.created_at > CURRENT_DATE;
```

**Expected**: Completion rate > 70% (lower in first days is normal as users explore)

---

### 7. Content Quality Analysis

**Question Accuracy Distribution**
```sql
-- Questions with very high or very low accuracy (potential issues)
SELECT 
  q.external_id,
  LEFT(q.question_text, 60) as question_preview,
  s.name as subject,
  q.difficulty,
  COUNT(ur.id) as attempts,
  SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) as correct,
  ROUND(100.0 * SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) / COUNT(ur.id), 2) as accuracy_pct
FROM questions q
JOIN user_responses ur ON ur.question_id = q.id
JOIN subjects s ON s.id = q.subject_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
WHERE et.slug = 'pu'
  AND ur.created_at > CURRENT_DATE
GROUP BY q.id, q.external_id, q.question_text, s.name, q.difficulty
HAVING COUNT(ur.id) >= 10  -- Minimum attempts for statistical significance
ORDER BY accuracy_pct ASC
LIMIT 20;
```

**Red Flags**:
- Accuracy < 10%: Likely incorrect answer key or ambiguous question
- Accuracy > 95%: Question may be too easy or answer obvious
- Accuracy ~25% for 4-option MCQ: Students likely guessing (unclear question)

**Action**: Review flagged questions, update if needed

---

### 8. Subject-Wise Performance

**Average Accuracy by Subject**
```sql
SELECT 
  s.name as subject,
  COUNT(DISTINCT ur.user_id) as users,
  COUNT(ur.id) as questions_attempted,
  ROUND(100.0 * SUM(CASE WHEN ur.is_correct THEN 1 ELSE 0 END) / COUNT(ur.id), 2) as avg_accuracy_pct
FROM user_responses ur
JOIN questions q ON q.id = ur.question_id
JOIN subjects s ON s.id = q.subject_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
WHERE et.slug = 'pu'
  AND ur.created_at > CURRENT_DATE
GROUP BY s.name
ORDER BY avg_accuracy_pct ASC;
```

**Expected Range**: 40-70% accuracy across subjects

**If Outliers**: 
- Subject < 30% accuracy: Content may be too difficult or poorly explained
- Subject > 80% accuracy: Content may be too easy

---

### 9. Mock Test Score Distribution

**Score Histogram**
```sql
-- Distribution of mock test scores
SELECT 
  CASE 
    WHEN score >= 90 THEN '90-100'
    WHEN score >= 80 THEN '80-89'
    WHEN score >= 70 THEN '70-79'
    WHEN score >= 60 THEN '60-69'
    WHEN score >= 50 THEN '50-59'
    WHEN score >= 40 THEN '40-49'
    WHEN score >= 30 THEN '30-39'
    WHEN score >= 20 THEN '20-29'
    WHEN score >= 10 THEN '10-19'
    ELSE '0-9'
  END as score_range,
  COUNT(*) as attempts
FROM mock_attempts ma
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
  AND ma.status = 'completed'
  AND ma.created_at > CURRENT_DATE
GROUP BY score_range
ORDER BY score_range DESC;
```

**Expected**: Normal distribution centered around 50-60%

**If Abnormal**:
- Most scores < 40%: Test may be too difficult
- Most scores > 70%: Test may be too easy
- Bimodal distribution: May indicate different student populations

---

### 10. Support Ticket Review

**Common Issues to Watch For**:
- "PU test not appearing" → Check `is_active` flag
- "Questions not loading" → Check database queries, network errors
- "Mock generation stuck" → Check for insufficient questions per slot
- "Wrong answer marked as correct" → Review question answer key
- "Can't submit mock test" → Check submission API, database constraints
- "Results not showing" → Check result calculation logic

**Action**: Create issue tracker for PU-specific bugs, prioritize by severity

---

## First Week Monitoring

### 11. Weekly Aggregated Metrics

**Overall Usage**
```sql
-- Week 1 summary
SELECT 
  COUNT(DISTINCT ma.user_id) as unique_users,
  COUNT(ma.id) as total_mock_attempts,
  SUM(CASE WHEN ma.status = 'completed' THEN 1 ELSE 0 END) as completed_mocks,
  AVG(ma.score) as avg_score,
  AVG(ma.time_taken_seconds / 60.0) as avg_time_minutes,
  (
    SELECT COUNT(DISTINCT ur.user_id)
    FROM user_responses ur
    JOIN questions q ON q.id = ur.question_id
    JOIN test_subjects ts ON ts.subject_id = q.subject_id
    JOIN entry_tests et ON et.id = ts.entry_test_id
    WHERE et.slug = 'pu'
      AND ur.created_at > CURRENT_DATE - INTERVAL '7 days'
  ) as unique_practice_users
FROM mock_attempts ma
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
  AND ma.created_at > CURRENT_DATE - INTERVAL '7 days';
```

**Retention Metrics**
```sql
-- Users who came back after first interaction
WITH first_interaction AS (
  SELECT 
    user_id,
    MIN(created_at)::date as first_date
  FROM (
    SELECT user_id, created_at
    FROM user_responses ur
    JOIN questions q ON q.id = ur.question_id
    JOIN test_subjects ts ON ts.subject_id = q.subject_id
    JOIN entry_tests et ON et.id = ts.entry_test_id
    WHERE et.slug = 'pu'
    
    UNION ALL
    
    SELECT user_id, created_at
    FROM mock_attempts ma
    JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
    WHERE bp.external_id = 'pu-full-mock'
  ) combined
  WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user_id
),
return_visits AS (
  SELECT 
    fi.user_id,
    COUNT(DISTINCT ur.created_at::date) as days_active
  FROM first_interaction fi
  JOIN user_responses ur ON ur.user_id = fi.user_id
  JOIN questions q ON q.id = ur.question_id
  JOIN test_subjects ts ON ts.subject_id = q.subject_id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
    AND ur.created_at::date > fi.first_date
  GROUP BY fi.user_id
)
SELECT 
  COUNT(DISTINCT fi.user_id) as total_users,
  COUNT(DISTINCT rv.user_id) as returning_users,
  ROUND(100.0 * COUNT(DISTINCT rv.user_id) / COUNT(DISTINCT fi.user_id), 2) as retention_rate_pct
FROM first_interaction fi
LEFT JOIN return_visits rv ON rv.user_id = fi.user_id;
```

**Expected**: Retention rate > 40% in first week

---

### 12. Content Gap Analysis

**Topics with Low Question Coverage**
```sql
SELECT 
  s.name as subject,
  t.name as topic,
  COUNT(q.id) as question_count,
  COUNT(DISTINCT q.difficulty) as difficulty_levels
FROM topics t
JOIN chapters c ON c.id = t.chapter_id
JOIN subjects s ON s.id = c.subject_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
LEFT JOIN questions q ON q.topic_id = t.id
WHERE et.slug = 'pu'
GROUP BY s.name, t.name
HAVING COUNT(q.id) < 20  -- Flag topics with < 20 questions
ORDER BY question_count ASC;
```

**Action**: Prioritize creating more questions for low-coverage topics

---

### 13. User Feedback Collection

**In-App Surveys** (if implemented):
- "How satisfied are you with PU test content?" (1-5 scale)
- "Did you find any questions confusing or incorrect?" (Yes/No)
- "How does PU test compare to NET test?" (Better/Same/Worse)

**Support Tickets Analysis**:
- Count of PU-related tickets
- Average resolution time
- Most common issues

**Social Media/Forum Monitoring**:
- Search for mentions of "PU Lahore test" on Twitter, Reddit, Discord
- Monitor sentiment (positive/negative)
- Address public complaints promptly

---

## Performance Benchmarks

### Response Time Targets

| Operation | Target | Warning | Critical |
|-----------|--------|---------|----------|
| Mock generation | < 2s | 2-5s | > 5s |
| Question load (practice) | < 500ms | 500ms-1s | > 1s |
| Mock submission | < 3s | 3-5s | > 5s |
| Results calculation | < 2s | 2-4s | > 4s |
| Subject page load | < 1s | 1-2s | > 2s |

### Database Query Targets

| Query Type | Target | Warning | Critical |
|------------|--------|---------|----------|
| Question fetch | < 100ms | 100-500ms | > 500ms |
| Mock slot randomization | < 500ms | 500ms-1s | > 1s |
| Score calculation | < 200ms | 200-500ms | > 500ms |
| Analytics aggregation | < 1s | 1-3s | > 3s |

**Monitoring Tool**: Set up alerts in Supabase Dashboard or use tools like Datadog, New Relic

---

## Rollback Criteria

### Automatic Rollback Triggers
- Error rate > 5% for 15+ minutes
- Database CPU > 90% sustained
- Application crash/restart loop
- Data corruption detected

### Manual Rollback Considerations
- > 10 support tickets in first hour citing critical bugs
- Question answer keys verified incorrect (>5% of questions)
- Mock generation failing for >20% of attempts
- Negative viral social media reaction

**Rollback Procedure**: See `PU_DEPLOYMENT_CHECKLIST.md` → Rollback Plan

---

## Success Declaration

Deployment is considered **fully successful** when:

- [x] Zero critical errors in 24 hours
- [x] > 50 unique users engaged with PU test (adjust based on user base size)
- [x] Mock test completion rate > 60%
- [x] Average question accuracy 40-70% (indicates appropriate difficulty)
- [x] No database performance degradation
- [x] User feedback net positive (> 70% satisfaction if surveyed)
- [x] All post-deployment verification checks passed

**Sign-Off**: _________________ Date: _______

---

## Long-Term Monitoring (Ongoing)

### Monthly Reviews
- Content quality audit (review low-accuracy questions)
- Performance optimization (add indexes, optimize queries)
- User engagement trends (DAU, WAU, retention)
- Competitive analysis (compare to NET test metrics)

### Quarterly Goals
- Expand question bank (target: +500 questions/quarter)
- Improve question quality (target: 50-60% average accuracy)
- Increase user retention (target: >50% monthly retention)
- Launch PU-specific features (e.g., subject-wise mocks, timed practice)

---

## Escalation Contacts

| Issue Severity | Contact | Response Time |
|----------------|---------|---------------|
| Critical (site down) | DevOps Lead | 15 minutes |
| High (feature broken) | Tech Lead | 1 hour |
| Medium (bug affecting <10% users) | Backend Dev | 4 hours |
| Low (content issue) | Content Team | 24 hours |

---

## Appendix: Useful Queries

### Find Unanswered Questions
```sql
SELECT 
  q.external_id,
  LEFT(q.question_text, 80) as question,
  s.name as subject,
  t.name as topic
FROM questions q
JOIN subjects s ON s.id = q.subject_id
JOIN topics t ON t.id = q.topic_id
JOIN test_subjects ts ON ts.subject_id = s.id
JOIN entry_tests et ON et.id = ts.entry_test_id
LEFT JOIN user_responses ur ON ur.question_id = q.id
WHERE et.slug = 'pu'
GROUP BY q.id, q.external_id, q.question_text, s.name, t.name
HAVING COUNT(ur.id) = 0
ORDER BY s.name, t.name;
```

### Top Performing Users
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
ORDER BY avg_score DESC
LIMIT 10;
```

### Daily Mock Attempts Trend
```sql
SELECT 
  ma.created_at::date as date,
  COUNT(*) as attempts,
  COUNT(DISTINCT ma.user_id) as unique_users,
  AVG(ma.score) as avg_score
FROM mock_attempts ma
JOIN mock_test_blueprints bp ON bp.id = ma.blueprint_id
WHERE bp.external_id = 'pu-full-mock'
  AND ma.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY ma.created_at::date
ORDER BY date DESC;
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Review Frequency**: After each deployment
