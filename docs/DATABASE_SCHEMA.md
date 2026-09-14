# Database Schema Notes

## Important Column Names

### Topics Table
- Uses `title` column (not `name`)
- When joining topics in queries, always use `topics(id, title)`

### Subjects Table
- Uses `name` column
- Standard join: `subjects(id, name, slug)`

### Question Options Table
- Uses `option_label` column in database
- Maps to `label` in application code for consistency
- When inserting: use `option_label`
- When querying: map `option_label` to `label`

## Common Query Patterns

### Admin Questions Query
```sql
SELECT 
  *,
  subjects!inner(id, name),
  topics(id, title)
FROM questions
```

### Mapping Options
```typescript
options: optionsData?.map(opt => ({ 
  ...opt, 
  label: opt.option_label 
}))
```

## Student Bookmark Use Case

- `bookmarks` stores one saved question per student through the unique
  `(user_id, question_id)` relationship.
- Row-level security restricts bookmark reads and writes to the owning student.
- Bookmarks are available from subject practice and past-paper sessions, not
  mock-test sessions.
- `/subjects/bookmarks` shows only bookmarked questions associated with the
  student's currently selected entry test through `question_tests`.
- Correct answers and explanations are loaded only on the authenticated saved
  questions revision page. Regular practice question queries remain answer-free.
- No additional bookmark table or explanation field is required; explanations
  come from `questions.explanation`.
