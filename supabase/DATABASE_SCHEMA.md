# MDCAT Expert - Database Schema Documentation

## Overview

This document provides comprehensive documentation for the mdcatExpert database schema implemented in Supabase (PostgreSQL).

---

## Schema Architecture

### Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐         ┌──────────────────────┐
│     users       │         │ question_categories  │
│─────────────────│         │──────────────────────│
│ id (PK)         │         │ id (PK)              │
│ full_name       │         │ name                 │
│ email           │         │ description          │
│ role            │         │ created_at           │
│ created_at      │         └──────────┬───────────┘
│ updated_at      │                    │
└────────┬────────┘                    │ 1:N
         │                             │
         │ 1:N                         ▼
         │                    ┌─────────────────────┐
         │                    │     questions       │
         │                    │─────────────────────│
         │                    │ id (PK)             │
         │                    │ category_id (FK)    │
         │                    │ question_text       │
         │                    │ question_image_url  │
         │                    │ option_a/b/c/d      │
         │                    │ correct_option      │
         │                    │ difficulty_level    │
         │                    │ explanation         │
         │                    │ created_by (FK)     │
         │                    └──────────┬──────────┘
         │                               │
         │ 1:N                           │ N:M
         ▼                               │
┌─────────────────────┐                 │
│   quiz_sessions     │                 │
│─────────────────────│                 │
│ id (PK)             │                 │
│ user_id (FK)        │                 │
│ started_at          │                 │
│ completed_at        │                 │
│ total_questions     │                 │
│ score               │                 │
│ status              │                 │
└──────────┬──────────┘                 │
           │                            │
           │ 1:N                        │
           ▼                            │
┌─────────────────────┐                 │
│   user_answers      │◄────────────────┘
│─────────────────────│
│ id (PK)             │
│ session_id (FK)     │
│ question_id (FK)    │
│ selected_option     │
│ is_correct          │
│ answered_at         │
└─────────────────────┘

         ┌─────────────────────┐
         │  user_analytics     │
         │─────────────────────│
         │ user_id (PK, FK)    │
         │ total_quizzes       │
         │ total_questions     │
         │ total_correct       │
         │ accuracy_percentage │
         │ last_active_at      │
         └─────────────────────┘
                  ▲
                  │ (Updated by triggers)
                  │
         ┌────────┴─────────┐
         │  Leaderboard     │ (VIEW)
         │  (Read-only)     │
         └──────────────────┘
```

---

## Table Specifications

### 1. users

**Purpose:** Store user profiles linked to Supabase Auth

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | User identifier |
| full_name | TEXT | NOT NULL | User's full name |
| email | TEXT | UNIQUE, NOT NULL | User's email |
| role | TEXT | CHECK (admin/user) | User role |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_role` on `role`
- `idx_users_email` on `email`

**RLS Policies:**
- Users can view/update own profile
- Admins can view/update all users

---

### 2. question_categories

**Purpose:** Organize questions by subject/topic

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Category identifier |
| name | TEXT | UNIQUE, NOT NULL | Category name |
| description | TEXT | - | Category description |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_question_categories_name` on `name`

**RLS Policies:**
- All authenticated users can read
- Only admins can create/update/delete

**Default Categories:**
- Biology
- Chemistry
- Physics
- English
- Logical Reasoning

---

### 3. questions

**Purpose:** Store quiz questions with text or image support

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Question identifier |
| category_id | UUID | FK → question_categories | Question category |
| question_text | TEXT | - | Text-based question |
| question_image_url | TEXT | - | Image URL from storage |
| option_a | TEXT | NOT NULL | Option A |
| option_b | TEXT | NOT NULL | Option B |
| option_c | TEXT | NOT NULL | Option C |
| option_d | TEXT | NOT NULL | Option D |
| correct_option | TEXT | CHECK (A/B/C/D) | Correct answer |
| difficulty_level | TEXT | CHECK (easy/medium/hard) | Difficulty |
| explanation | TEXT | - | Answer explanation |
| created_by | UUID | FK → users | Admin who created |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints:**
- `question_content_check`: Either `question_text` OR `question_image_url` must be present

**Indexes:**
- `idx_questions_category` on `category_id`
- `idx_questions_difficulty` on `difficulty_level`
- `idx_questions_created_by` on `created_by`

**RLS Policies:**
- All authenticated users can read
- Only admins can create/update/delete

---

### 4. quiz_sessions

**Purpose:** Track user quiz attempts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Session identifier |
| user_id | UUID | FK → users | User taking quiz |
| started_at | TIMESTAMPTZ | DEFAULT NOW() | Quiz start time |
| completed_at | TIMESTAMPTZ | - | Quiz completion time |
| total_questions | INTEGER | DEFAULT 0 | Number of questions |
| score | INTEGER | DEFAULT 0 | Correct answers count |
| status | TEXT | CHECK (in_progress/completed) | Session status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_quiz_sessions_user` on `user_id`
- `idx_quiz_sessions_status` on `status`
- `idx_quiz_sessions_completed` on `completed_at`
- `idx_quiz_sessions_user_status` on `(user_id, status)`

**RLS Policies:**
- Users can view/create/update own sessions
- Admins can view all sessions

---

### 5. user_answers

**Purpose:** Store individual question answers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Answer identifier |
| session_id | UUID | FK → quiz_sessions | Quiz session |
| question_id | UUID | FK → questions | Question answered |
| selected_option | TEXT | CHECK (A/B/C/D) | User's answer |
| is_correct | BOOLEAN | - | Auto-evaluated correctness |
| answered_at | TIMESTAMPTZ | DEFAULT NOW() | Answer time |

**Constraints:**
- `UNIQUE(session_id, question_id)` - Prevent duplicate answers

**Indexes:**
- `idx_user_answers_session` on `session_id`
- `idx_user_answers_question` on `question_id`
- `idx_user_answers_correct` on `is_correct`
- `idx_user_answers_session_correct` on `(session_id, is_correct)`

**RLS Policies:**
- Users can view/insert own answers
- Admins can view all answers

---

### 6. user_analytics

**Purpose:** Aggregate user performance metrics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PK, FK → users | User identifier |
| total_quizzes | INTEGER | DEFAULT 0 | Completed quizzes |
| total_questions_answered | INTEGER | DEFAULT 0 | Total questions |
| total_correct_answers | INTEGER | DEFAULT 0 | Correct answers |
| accuracy_percentage | DECIMAL(5,2) | DEFAULT 0.00 | Accuracy % |
| last_active_at | TIMESTAMPTZ | DEFAULT NOW() | Last activity |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_user_analytics_accuracy` on `accuracy_percentage DESC`
- `idx_user_analytics_total_correct` on `total_correct_answers DESC`

**RLS Policies:**
- Users can view own analytics
- All authenticated users can view all (for leaderboard)

---

## Views

### leaderboard

**Purpose:** Real-time user ranking

**Columns:**
- `id` - User ID
- `full_name` - User name
- `email` - User email
- `total_quizzes` - Completed quizzes
- `total_correct_answers` - Total correct
- `total_questions_answered` - Total answered
- `accuracy_percentage` - Accuracy %
- `last_active_at` - Last activity
- `rank` - User rank (ROW_NUMBER)

**Ordering:** By `total_correct_answers DESC`, `accuracy_percentage DESC`

---

## Database Functions

### calculate_quiz_score(p_session_id UUID)

Calculates the score for a quiz session by counting correct answers.

**Returns:** INTEGER (score)

---

### update_user_analytics(p_user_id UUID)

Updates user analytics based on all completed quiz sessions.

**Returns:** VOID

**Updates:**
- Total quizzes
- Total questions answered
- Total correct answers
- Accuracy percentage
- Last active timestamp

---

### complete_quiz_session(p_session_id UUID)

Marks a quiz session as completed and updates analytics.

**Returns:** VOID

**Actions:**
1. Calculates final score
2. Updates session status to 'completed'
3. Sets completion timestamp
4. Triggers analytics update

---

### get_random_questions(p_category_id, p_difficulty, p_limit)

Retrieves random questions for a quiz.

**Parameters:**
- `p_category_id` UUID (optional) - Filter by category
- `p_difficulty` TEXT (optional) - Filter by difficulty
- `p_limit` INTEGER (default 10) - Number of questions

**Returns:** SETOF questions

---

### get_user_quiz_history(p_user_id UUID)

Retrieves a user's quiz history with calculated accuracy.

**Returns:** TABLE with session details and accuracy

---

## Triggers

### trigger_evaluate_answer

**Table:** user_answers  
**Event:** BEFORE INSERT  
**Function:** evaluate_answer()

Automatically evaluates if the selected option is correct by comparing with the question's correct_option.

---

### trigger_update_session_on_answer

**Table:** user_answers  
**Event:** AFTER INSERT  
**Function:** update_session_on_answer()

Updates the quiz session's total_questions count after each answer.

---

### trigger_quiz_completion

**Table:** quiz_sessions  
**Event:** AFTER UPDATE  
**Function:** trigger_update_analytics_on_completion()

Updates user analytics when a quiz session status changes to 'completed'.

---

### trigger_users_updated_at / trigger_questions_updated_at

**Tables:** users, questions  
**Event:** BEFORE UPDATE  
**Function:** update_updated_at_column()

Automatically updates the `updated_at` timestamp on record updates.

---

## Storage Configuration

### Bucket: question_images

**Purpose:** Store question images uploaded by admins

**Configuration:**
- **Public:** Yes (images accessible via URL)
- **File Path Structure:** `/questions/{question_id}/{filename}`

**RLS Policies:**
- **SELECT:** All authenticated users can view
- **INSERT:** Only admins can upload
- **UPDATE:** Only admins can modify
- **DELETE:** Only admins can delete

**Recommended File Naming:**
- Format: `{question_id}_{timestamp}.{ext}`
- Example: `a1b2c3d4-5678-90ab-cdef-1234567890ab_1640000000.jpg`

---

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled with policies based on:

1. **User Identity:** `auth.uid()` matches record owner
2. **Role-Based Access:** Admin role check via users table
3. **Cascading Permissions:** Session ownership determines answer access

### Role Hierarchy

```
admin
  ├── Full CRUD on all tables
  ├── Can upload/manage question images
  ├── Can view all user data
  └── Can manage categories and questions

user
  ├── Read-only access to questions and categories
  ├── Full access to own quiz sessions and answers
  ├── Read-only access to leaderboard
  └── Can view own analytics
```

---

## Performance Optimization

### Indexes

**15 indexes** created for optimal query performance:

1. Foreign key indexes (category_id, user_id, etc.)
2. Frequently filtered columns (role, difficulty, status)
3. Composite indexes for common query patterns
4. Descending indexes for leaderboard sorting

### Query Optimization

- Leaderboard uses indexed columns for fast ranking
- Random question selection uses PostgreSQL's RANDOM()
- Analytics calculations use aggregated data

---

## Data Flow

### Quiz Workflow

```
1. User starts quiz
   ↓
2. quiz_sessions record created (status: in_progress)
   ↓
3. User answers questions
   ↓
4. user_answers records created
   ↓
5. Trigger auto-evaluates correctness
   ↓
6. Trigger updates session total_questions
   ↓
7. User completes quiz
   ↓
8. complete_quiz_session() called
   ↓
9. Session marked as completed
   ↓
10. Trigger updates user_analytics
    ↓
11. Leaderboard automatically reflects new data
```

---

## File Structure

```
mdcat-expert/
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  (Complete schema)
```

---

## Deployment Instructions

See [implementation_plan.md](file:///C:/Users/HP/.gemini/antigravity/brain/93b5ccb0-b030-47ae-b600-4f2ec6ba5c04/implementation_plan.md) for detailed deployment steps.

---

## Maintenance

### Regular Tasks

1. **Monitor Analytics:** Check user_analytics for anomalies
2. **Clean Old Sessions:** Archive completed sessions older than X months
3. **Optimize Indexes:** Run ANALYZE periodically
4. **Backup Images:** Ensure question_images bucket is backed up

### Future Enhancements

- Add question tags for advanced filtering
- Implement question difficulty auto-adjustment
- Add time-based quiz modes
- Track question-level analytics (most missed, etc.)
