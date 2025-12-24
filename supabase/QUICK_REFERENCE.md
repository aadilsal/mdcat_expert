# Database Quick Reference Guide

## 🚀 Quick Start

### 1. Deploy Schema to Supabase

```bash
# Copy the SQL file contents
cat supabase/migrations/001_initial_schema.sql

# Go to Supabase Dashboard → SQL Editor
# Paste and execute the SQL
```

### 2. Verify Deployment

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'question_images';
```

---

## 📊 Common Queries

### Get Random Quiz Questions

```sql
SELECT * FROM get_random_questions(
  NULL,        -- category_id (NULL = all categories)
  'medium',    -- difficulty
  10           -- number of questions
);
```

### View Leaderboard

```sql
SELECT * FROM leaderboard LIMIT 10;
```

### Get User Quiz History

```sql
SELECT * FROM get_user_quiz_history('user-uuid-here');
```

### Get User Analytics

```sql
SELECT * FROM user_analytics WHERE user_id = 'user-uuid-here';
```

---

## 🔐 Admin Operations

### Create Admin User

```sql
-- After user signs up via Supabase Auth
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Add Question Category

```sql
INSERT INTO question_categories (name, description)
VALUES ('Biochemistry', 'Biochemistry questions for MDCAT');
```

### Add Text Question

```sql
INSERT INTO questions (
  category_id,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  difficulty_level,
  explanation,
  created_by
) VALUES (
  'category-uuid',
  'What is the powerhouse of the cell?',
  'Nucleus',
  'Mitochondria',
  'Ribosome',
  'Golgi Apparatus',
  'B',
  'easy',
  'Mitochondria produce ATP through cellular respiration.',
  'admin-user-uuid'
);
```

### Add Image Question

```sql
-- First upload image to storage, then:
INSERT INTO questions (
  category_id,
  question_image_url,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  difficulty_level,
  created_by
) VALUES (
  'category-uuid',
  'https://your-project.supabase.co/storage/v1/object/public/question_images/questions/uuid/image.jpg',
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'C',
  'hard',
  'admin-user-uuid'
);
```

---

## 👤 User Operations

### Start Quiz Session

```sql
INSERT INTO quiz_sessions (user_id, status)
VALUES ('user-uuid', 'in_progress')
RETURNING id;
```

### Submit Answer

```sql
-- Answer is auto-evaluated by trigger
INSERT INTO user_answers (session_id, question_id, selected_option)
VALUES ('session-uuid', 'question-uuid', 'B');
```

### Complete Quiz

```sql
SELECT complete_quiz_session('session-uuid');
-- This automatically:
-- 1. Calculates score
-- 2. Marks session as completed
-- 3. Updates user analytics
```

---

## 📁 Storage Operations

### Upload Question Image (Admin)

```typescript
// In your application code
const { data, error } = await supabase.storage
  .from('question_images')
  .upload(`questions/${questionId}/${file.name}`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('question_images')
  .getPublicUrl(`questions/${questionId}/${file.name}`)
```

### Get Image URL

```typescript
const { data } = supabase.storage
  .from('question_images')
  .getPublicUrl('questions/uuid/image.jpg')
```

---

## 🔍 Analytics Queries

### Top Performers

```sql
SELECT * FROM leaderboard LIMIT 10;
```

### Category Performance

```sql
SELECT 
  qc.name as category,
  COUNT(DISTINCT ua.session_id) as attempts,
  AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0.0 END) as avg_accuracy
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
JOIN question_categories qc ON q.category_id = qc.id
WHERE ua.session_id IN (
  SELECT id FROM quiz_sessions WHERE user_id = 'user-uuid'
)
GROUP BY qc.name;
```

### Question Difficulty Stats

```sql
SELECT 
  difficulty_level,
  COUNT(*) as total_questions,
  AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0.0 END) as avg_accuracy
FROM questions q
LEFT JOIN user_answers ua ON q.id = ua.question_id
GROUP BY difficulty_level;
```

---

## 🛠️ Maintenance

### Recalculate User Analytics

```sql
SELECT update_user_analytics('user-uuid');
```

### Clean Old Sessions (Example)

```sql
DELETE FROM quiz_sessions 
WHERE status = 'in_progress' 
AND started_at < NOW() - INTERVAL '7 days';
```

### Reindex Tables

```sql
REINDEX TABLE questions;
REINDEX TABLE quiz_sessions;
REINDEX TABLE user_answers;
```

---

## 🔒 Security Checks

### Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should show 't' (true)
```

### List RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 📝 File Paths

- **Schema:** `supabase/migrations/001_initial_schema.sql`
- **Documentation:** `supabase/DATABASE_SCHEMA.md`
- **Types:** `types/index.ts`
- **Implementation Plan:** See artifacts

---

## 🎯 Next Steps

1. ✅ Deploy schema to Supabase
2. ✅ Create first admin user
3. ✅ Add question categories
4. ✅ Test storage upload
5. ✅ Add sample questions
6. ✅ Test quiz flow
7. ✅ Verify leaderboard
