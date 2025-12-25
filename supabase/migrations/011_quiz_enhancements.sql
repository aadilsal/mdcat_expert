-- ============================================================================
-- QUIZ ENHANCEMENTS - Database Migration
-- ============================================================================
-- Description: Extends the quiz system with quiz configurations, bookmarks,
--              and state persistence for pause/resume functionality
-- ============================================================================

-- ============================================================================
-- 1️⃣ QUIZZES TABLE - Store Quiz Configurations
-- ============================================================================

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES question_categories(id) ON DELETE SET NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'mixed')),
    time_limit_minutes INTEGER NOT NULL DEFAULT 60,
    question_count INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    is_practice_mode BOOLEAN DEFAULT false, -- Practice mode: no timer, can review answers
    allow_pause BOOLEAN DEFAULT true,
    show_results_immediately BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quizzes_category ON quizzes(category_id);
CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty_level);
CREATE INDEX idx_quizzes_active ON quizzes(is_active);

-- RLS Policies
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active quizzes
CREATE POLICY "Authenticated users can view active quizzes"
    ON quizzes FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Admins can manage all quizzes
CREATE POLICY "Admins can manage quizzes"
    ON quizzes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 2️⃣ QUIZ_QUESTIONS - Junction Table for Quiz-Question Relationships
-- ============================================================================

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate questions in same quiz
    UNIQUE(quiz_id, question_id)
);

-- Indexes
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_question ON quiz_questions(question_id);
CREATE INDEX idx_quiz_questions_order ON quiz_questions(quiz_id, question_order);

-- RLS Policies
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view quiz questions
CREATE POLICY "Authenticated users can view quiz questions"
    ON quiz_questions FOR SELECT
    TO authenticated
    USING (true);

-- Admins can manage quiz questions
CREATE POLICY "Admins can manage quiz questions"
    ON quiz_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 3️⃣ BOOKMARKED_QUESTIONS - Track User-Flagged Questions
-- ============================================================================

CREATE TABLE bookmarked_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate bookmarks
    UNIQUE(session_id, question_id)
);

-- Indexes
CREATE INDEX idx_bookmarked_questions_session ON bookmarked_questions(session_id);
CREATE INDEX idx_bookmarked_questions_question ON bookmarked_questions(question_id);

-- RLS Policies
ALTER TABLE bookmarked_questions ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
    ON bookmarked_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = bookmarked_questions.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks"
    ON bookmarked_questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = bookmarked_questions.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own bookmarks"
    ON bookmarked_questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = bookmarked_questions.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 4️⃣ QUIZ_STATE - Store Pause/Resume State
-- ============================================================================

CREATE TABLE quiz_state (
    session_id UUID PRIMARY KEY REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    current_question_index INTEGER NOT NULL DEFAULT 0,
    time_remaining_seconds INTEGER,
    is_paused BOOLEAN DEFAULT false,
    paused_at TIMESTAMP WITH TIME ZONE,
    state_data JSONB, -- Additional state (e.g., navigation history)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_state_paused ON quiz_state(is_paused);

-- RLS Policies
ALTER TABLE quiz_state ENABLE ROW LEVEL SECURITY;

-- Users can view their own quiz state
CREATE POLICY "Users can view own quiz state"
    ON quiz_state FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_state.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Users can manage their own quiz state
CREATE POLICY "Users can manage own quiz state"
    ON quiz_state FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_state.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_state.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 5️⃣ EXTEND QUIZ_SESSIONS TABLE
-- ============================================================================

-- Add new columns to quiz_sessions
ALTER TABLE quiz_sessions 
ADD COLUMN quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
ADD COLUMN time_limit_minutes INTEGER,
ADD COLUMN time_taken_seconds INTEGER,
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;

-- Create index for quiz_id
CREATE INDEX idx_quiz_sessions_quiz ON quiz_sessions(quiz_id);

-- ============================================================================
-- 6️⃣ DATABASE FUNCTIONS
-- ============================================================================

-- Function to get quiz questions in order
CREATE OR REPLACE FUNCTION get_quiz_questions(p_quiz_id UUID)
RETURNS TABLE (
    question_id UUID,
    question_order INTEGER,
    question_text TEXT,
    question_image_url TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    difficulty_level TEXT,
    category_id UUID
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        q.id as question_id,
        qq.question_order,
        q.question_text,
        q.question_image_url,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.difficulty_level,
        q.category_id
    FROM quiz_questions qq
    JOIN questions q ON qq.question_id = q.id
    WHERE qq.quiz_id = p_quiz_id
    ORDER BY qq.question_order;
$$;

-- Function to create quiz session with state
CREATE OR REPLACE FUNCTION create_quiz_session(
    p_user_id UUID,
    p_quiz_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
    v_time_limit INTEGER;
    v_question_count INTEGER;
BEGIN
    -- Get quiz configuration
    SELECT time_limit_minutes, question_count
    INTO v_time_limit, v_question_count
    FROM quizzes
    WHERE id = p_quiz_id;
    
    -- Create quiz session
    INSERT INTO quiz_sessions (
        user_id,
        quiz_id,
        time_limit_minutes,
        total_questions,
        status
    ) VALUES (
        p_user_id,
        p_quiz_id,
        v_time_limit,
        v_question_count,
        'in_progress'
    )
    RETURNING id INTO v_session_id;
    
    -- Initialize quiz state
    INSERT INTO quiz_state (
        session_id,
        current_question_index,
        time_remaining_seconds,
        is_paused
    ) VALUES (
        v_session_id,
        0,
        v_time_limit * 60,
        false
    );
    
    RETURN v_session_id;
END;
$$;

-- Function to pause quiz
CREATE OR REPLACE FUNCTION pause_quiz(p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE quiz_state
    SET 
        is_paused = true,
        paused_at = NOW(),
        updated_at = NOW()
    WHERE session_id = p_session_id;
END;
$$;

-- Function to resume quiz
CREATE OR REPLACE FUNCTION resume_quiz(p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE quiz_state
    SET 
        is_paused = false,
        paused_at = NULL,
        updated_at = NOW()
    WHERE session_id = p_session_id;
END;
$$;

-- Function to update quiz state
CREATE OR REPLACE FUNCTION update_quiz_state(
    p_session_id UUID,
    p_current_index INTEGER,
    p_time_remaining INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE quiz_state
    SET 
        current_question_index = p_current_index,
        time_remaining_seconds = p_time_remaining,
        updated_at = NOW()
    WHERE session_id = p_session_id;
END;
$$;

-- Function to get session progress
CREATE OR REPLACE FUNCTION get_session_progress(p_session_id UUID)
RETURNS TABLE (
    total_questions INTEGER,
    answered_questions INTEGER,
    bookmarked_questions INTEGER,
    current_index INTEGER,
    time_remaining INTEGER,
    is_paused BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        qs.total_questions,
        COUNT(DISTINCT ua.question_id)::INTEGER as answered_questions,
        COUNT(DISTINCT bq.question_id)::INTEGER as bookmarked_questions,
        COALESCE(qst.current_question_index, 0) as current_index,
        COALESCE(qst.time_remaining_seconds, 0) as time_remaining,
        COALESCE(qst.is_paused, false) as is_paused
    FROM quiz_sessions qs
    LEFT JOIN user_answers ua ON qs.id = ua.session_id
    LEFT JOIN bookmarked_questions bq ON qs.id = bq.session_id
    LEFT JOIN quiz_state qst ON qs.id = qst.session_id
    WHERE qs.id = p_session_id
    GROUP BY qs.total_questions, qst.current_question_index, 
             qst.time_remaining_seconds, qst.is_paused;
$$;

-- ============================================================================
-- 7️⃣ TRIGGERS
-- ============================================================================

-- Trigger to update quiz_state timestamp
CREATE OR REPLACE FUNCTION update_quiz_state_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_quiz_state_updated_at
    BEFORE UPDATE ON quiz_state
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_state_timestamp();

-- Trigger to update quizzes timestamp
CREATE TRIGGER trigger_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8️⃣ INITIAL DATA - Sample Quizzes
-- ============================================================================

-- Insert sample quizzes (optional - for testing)
INSERT INTO quizzes (title, description, difficulty_level, time_limit_minutes, question_count, is_practice_mode, allow_pause)
VALUES 
    ('Quick Practice Quiz', 'A quick 10-question practice quiz covering all topics', 'mixed', 15, 10, true, true),
    ('MDCAT Mock Test - Biology', 'Full-length biology section mock test', 'medium', 30, 20, false, true),
    ('MDCAT Mock Test - Chemistry', 'Full-length chemistry section mock test', 'medium', 30, 20, false, true),
    ('MDCAT Mock Test - Physics', 'Full-length physics section mock test', 'medium', 30, 20, false, true),
    ('Complete MDCAT Mock Test', 'Full-length MDCAT mock test covering all subjects', 'mixed', 120, 100, false, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9️⃣ GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON quizzes TO authenticated;
GRANT ALL ON quiz_questions TO authenticated;
GRANT ALL ON bookmarked_questions TO authenticated;
GRANT ALL ON quiz_state TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
