# PU Lahore Entry Test - Integration Test Plan

## Purpose
Manual testing scenarios to verify PU Lahore test has complete feature parity with NET Engineering test after deployment.

## Prerequisites
- All 3 migrations executed successfully
- Import script (import_pu.sql) executed
- Validation script shows all checks passing
- Mock generation test shows readiness

---

## Test Suite

### 1. Dashboard - Test Selection Dropdown

**Objective**: Verify PU test appears in test selection dropdown alongside NET

**Steps**:
1. Log in as regular user
2. Navigate to dashboard home (`/`)
3. Locate test selection dropdown (usually top of page)
4. Click dropdown to expand options

**Expected Results**:
- ✓ Dropdown shows both "NET Engineering" and "PU Lahore" options
- ✓ Both tests are selectable
- ✓ PU test name displays as "PU Lahore Entry Test"

**Pass Criteria**: User can select PU Lahore from dropdown

---

### 2. Subjects Navigation

**Objective**: Verify all 5 PU subjects are accessible

**Steps**:
1. Select "PU Lahore" from test dropdown
2. Navigate to Subjects page (`/subjects`)
3. Verify subject cards/list display

**Expected Results**:
- ✓ 5 subject cards visible:
  - Verbal Reasoning
  - Quantitative Reasoning
  - Computer Science
  - Mathematics
  - Physics
- ✓ Each subject shows question count
- ✓ Subject cards are clickable

**Pass Criteria**: All 5 subjects display with correct names

---

### 3. Subject Detail - Chapter List

**Objective**: Verify chapters load for each subject

**Test 3a: Verbal Reasoning**
1. Click "Verbal Reasoning" subject
2. Verify URL: `/subjects/verbal-reasoning`
3. Check chapter list displays

**Expected**: 10 chapters (Synonyms, Antonyms, Analogies, Sentence Completion, Critical Reading, Grammar, Articles, Prepositions, Vocabulary, Reading Comprehension)

**Test 3b: Quantitative Reasoning**
1. Click "Quantitative Reasoning" subject
2. Check chapter list

**Expected**: 10 chapters (Arithmetic, Percentages, Ratios, Proportions, Averages, Fractions, Algebra, Word Problems, Speed/Distance/Time, Work Rate)

**Test 3c: Computer Science**
1. Click "Computer Science" subject
2. Check chapter list

**Expected**: 10 chapters (IT Overview, Networks, Topologies, OSI Model, Operating Systems, DBMS, ER Models, Normalization, C Programming, Data Structures)

**Test 3d: Mathematics**
1. Click "Mathematics" subject
2. Check chapter list

**Expected**: 8 chapters (Number Systems, Sets/Functions, Matrices, Quadratic Equations, Trigonometry, Calculus, Integration, Analytical Geometry)

**Test 3e: Physics**
1. Click "Physics" subject
2. Check chapter list

**Expected**: 10 chapters (Measurements, Vectors, Motion, Force/Energy, Waves, Optics, Electrostatics, Current Electricity, Electronics, Modern Physics)

**Pass Criteria**: All subjects show their respective chapters with question counts

---

### 4. Topic Practice Mode

**Objective**: Verify users can practice questions from any topic

**Steps**:
1. Navigate to any subject (e.g., Computer Science)
2. Click on a chapter (e.g., "DBMS")
3. Click "Practice" button
4. Verify practice interface loads
5. Answer 2-3 questions
6. Check immediate feedback appears
7. Verify "Next Question" navigation works

**Expected Results**:
- ✓ Questions load from selected topic
- ✓ 4 options (A/B/C/D) display for each question
- ✓ Selecting answer shows immediate feedback (correct/incorrect)
- ✓ Explanation displays after answering
- ✓ Can navigate to next question
- ✓ Progress tracker shows (e.g., "Question 3 of 45")

**Pass Criteria**: Practice mode fully functional, questions display with feedback

---

### 5. Mock Test Generation

**Objective**: Verify 100-question mock test generates successfully

**Steps**:
1. Navigate to Mock Tests page (`/mock`)
2. Click "Start New Mock Test" or similar button
3. Wait for mock generation (should be <2 seconds)
4. Verify redirect to mock attempt page

**Expected Results**:
- ✓ Mock generates without errors
- ✓ Redirects to `/mock/[attemptId]`
- ✓ Shows 100 questions in navigation
- ✓ Timer shows 80:00 (80 minutes)
- ✓ Question counter shows "1/100"

**Pass Criteria**: Mock generates and loads successfully

---

### 6. Mock Test - Question Distribution

**Objective**: Verify mock contains correct subject distribution

**Steps**:
1. From generated mock test, open question palette/navigator
2. Check question grouping by subject
3. Verify question numbers for each subject

**Expected Results**:
- ✓ Questions 1-20: Verbal Reasoning (20 questions)
- ✓ Questions 21-40: Quantitative Reasoning (20 questions)
- ✓ Questions 41-60: Computer Science (20 questions)
- ✓ Questions 61-80: Mathematics (20 questions)
- ✓ Questions 81-100: Physics (20 questions)

**Pass Criteria**: Mock contains exactly 100 questions with correct 20/20/20/20/20 distribution

---

### 7. Mock Test - Submission & Results

**Objective**: Verify mock submission and result calculation

**Steps**:
1. Continue mock test started in Test 6
2. Answer at least 10 questions (mix of correct/incorrect)
3. Submit mock test (or let timer expire)
4. Wait for result page load

**Expected Results**:
- ✓ Submission processes without errors
- ✓ Redirects to `/mock/[attemptId]/result`
- ✓ Shows total score (out of 100)
- ✓ Shows time taken
- ✓ Shows subject-wise breakdown
- ✓ Shows percentage/percentile (if calculated)
- ✓ Can review answers (correct/incorrect marked)

**Pass Criteria**: Results display correctly with subject-wise breakdown

---

### 8. Performance Analytics

**Objective**: Verify PU test data integrates into analytics

**Steps**:
1. Navigate to Performance/Insights page (`/insights` or `/performance`)
2. Check if PU test data appears in charts
3. Verify subject-wise performance metrics

**Expected Results**:
- ✓ PU mock attempts appear in attempt history
- ✓ Subject-wise accuracy charts include PU subjects
- ✓ Topic strength/weakness analysis works for PU topics
- ✓ No errors in data visualization

**Pass Criteria**: Analytics page displays PU test data alongside NET data

---

### 9. Admin Panel - Question Management

**Objective**: Verify admin can view/manage PU questions

**Steps**:
1. Log in as admin user
2. Navigate to Admin Questions page (`/admin/questions`)
3. Filter by "PU Lahore" test
4. Verify questions list loads
5. Try editing one question
6. Save changes

**Expected Results**:
- ✓ PU Lahore appears in test filter dropdown
- ✓ Questions list shows ~1,444 PU questions
- ✓ Can filter by subject (Verbal, Quant, CS, Maths, Physics)
- ✓ Edit functionality works (opens question editor)
- ✓ Changes save successfully

**Pass Criteria**: Admin can filter, view, and edit PU questions

---

### 10. Admin Panel - Entry Test Management

**Objective**: Verify PU test appears in entry test management

**Steps**:
1. In admin panel, navigate to Entry Tests section (`/admin/entry-tests`)
2. Verify PU Lahore test is listed
3. Click to view details
4. Check test configuration (subjects, blueprints)

**Expected Results**:
- ✓ PU Lahore test listed alongside NET
- ✓ Shows correct slug: `pu`
- ✓ Shows 5 subjects associated
- ✓ Shows 1 mock blueprint (pu-full-mock)
- ✓ Test status is "active"

**Pass Criteria**: PU test visible and configurable in admin panel

---

### 11. Mobile Responsiveness (Optional)

**Objective**: Verify PU test works on mobile devices

**Steps**:
1. Access site on mobile device or use browser DevTools mobile emulation
2. Repeat Tests 2, 4, 5, 7 on mobile viewport

**Expected Results**:
- ✓ Subject cards stack vertically on mobile
- ✓ Practice mode questions readable and tappable
- ✓ Mock test interface usable on small screens
- ✓ Timer and navigation accessible

**Pass Criteria**: Core functionality works on mobile (≥360px width)

---

## Critical Path Test Sequence

**For rapid smoke testing, execute in this order**:

1. **Test 1**: Dashboard dropdown (verify PU appears)
2. **Test 2**: Subjects page (verify 5 subjects)
3. **Test 4**: Practice mode (verify questions load)
4. **Test 5**: Mock generation (verify 100Q mock creates)
5. **Test 7**: Mock submission (verify results calculate)

**If all 5 pass**: PU test has feature parity with NET ✓

---

## Failure Scenarios & Troubleshooting

### Issue: PU test not in dropdown
**Check**:
- Run: `SELECT * FROM entry_tests WHERE slug = 'pu';`
- Verify `is_active = true`
- Check frontend test selection query includes PU

### Issue: Subjects not displaying
**Check**:
- Run: `SELECT * FROM test_subjects WHERE entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu');`
- Should return 5 rows
- Check subject slugs match frontend routing

### Issue: No questions in practice mode
**Check**:
- Run validation script: `psql < validate_pu_import.sql`
- Verify "Questions by Subject" shows >100 per subject
- Check `moderation_status = 'approved'` for questions

### Issue: Mock generation fails
**Check**:
- Run: `psql < test_pu_mock_generation.sql`
- Look for "✗ INSUFFICIENT" in question pool availability
- Check blueprint exists: `SELECT * FROM mock_test_blueprints WHERE external_id = 'pu-full-mock';`

### Issue: Results not calculating
**Check**:
- Verify `mock_attempts` table has entry for attempt
- Check `user_responses` table has answers
- Look for errors in browser console during submission

---

## Test Completion Checklist

- [ ] Test 1: Dashboard dropdown
- [ ] Test 2: Subjects navigation  
- [ ] Test 3a-e: All subject chapters
- [ ] Test 4: Practice mode
- [ ] Test 5: Mock generation
- [ ] Test 6: Question distribution
- [ ] Test 7: Mock submission & results
- [ ] Test 8: Performance analytics
- [ ] Test 9: Admin question management
- [ ] Test 10: Admin entry test management
- [ ] Test 11: Mobile responsiveness (optional)

**Sign-off**: _________________ Date: _______

---

## Notes
- Execute tests in a **staging environment** first before production
- Keep browser DevTools console open to catch JavaScript errors
- Take screenshots of any failures for debugging
- Document actual vs expected results for any failing tests
