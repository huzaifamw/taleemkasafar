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
