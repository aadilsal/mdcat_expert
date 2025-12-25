-- ============================================================================
-- Quiz Results & AI Explanations Enhancement
-- ============================================================================
-- Description: Adds AI explanation caching, rate limiting, and enhanced
--              analytics for quiz results
-- ============================================================================

-- ============================================================================
-- 1️⃣ AI EXPLANATIONS TABLE (Caching)
-- ============================================================================

CREATE TABLE ai_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL CHECK (user_answer IN ('A', 'B', 'C', 'D')),
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation_text TEXT NOT NULL,
    model_version TEXT DEFAULT 'gemini-1.5-flash',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for caching: one explanation per question-answer combination
    UNIQUE(question_id, user_answer)
);

-- Indexes for performance
CREATE INDEX idx_ai_explanations_question ON ai_explanations(question_id);
CREATE INDEX idx_ai_explanations_generated ON ai_explanations(generated_at DESC);

-- RLS Policies
ALTER TABLE ai_explanations ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read explanations
CREATE POLICY "Authenticated users can view explanations"
    ON ai_explanations FOR SELECT
    TO authenticated
    USING (true);

-- System can insert explanations (via API)
CREATE POLICY "System can insert explanations"
    ON ai_explanations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- 2️⃣ EXPLANATION REGENERATIONS TABLE (Rate Limiting)
-- ============================================================================

CREATE TABLE explanation_regenerations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    regenerated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rate limiting queries
CREATE INDEX idx_regenerations_user_question ON explanation_regenerations(user_id, question_id);
CREATE INDEX idx_regenerations_session ON explanation_regenerations(session_id);

-- RLS Policies
ALTER TABLE explanation_regenerations ENABLE ROW LEVEL SECURITY;

-- Users can view their own regenerations
CREATE POLICY "Users can view own regenerations"
    ON explanation_regenerations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own regenerations
CREATE POLICY "Users can insert own regenerations"
    ON explanation_regenerations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3️⃣ ENHANCE QUIZ_SESSIONS TABLE
-- ============================================================================

-- Add columns for detailed analytics
ALTER TABLE quiz_sessions
ADD COLUMN IF NOT EXISTS difficulty_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS topic_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_time_taken ON quiz_sessions(time_taken_seconds);

-- ============================================================================
-- 4️⃣ QUESTION TIME TRACKING TABLE
-- ============================================================================

CREATE TABLE question_time_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One time record per question per session
    UNIQUE(session_id, question_id)
);

-- Indexes
CREATE INDEX idx_question_time_session ON question_time_tracking(session_id);
CREATE INDEX idx_question_time_question ON question_time_tracking(question_id);

-- RLS Policies
ALTER TABLE question_time_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own time tracking
CREATE POLICY "Users can view own time tracking"
    ON question_time_tracking FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = question_time_tracking.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Users can insert their own time tracking
CREATE POLICY "Users can insert own time tracking"
    ON question_time_tracking FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = question_time_tracking.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Users can update their own time tracking
CREATE POLICY "Users can update own time tracking"
    ON question_time_tracking FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = question_time_tracking.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 5️⃣ DATABASE FUNCTIONS
-- ============================================================================

-- Function to check if user can regenerate explanation
CREATE OR REPLACE FUNCTION can_regenerate_explanation(
    p_user_id UUID,
    p_question_id UUID
)
RETURNS TABLE (
    can_regenerate BOOLEAN,
    regenerations_used INTEGER,
    regenerations_remaining INTEGER,
    max_regenerations INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_max_regenerations INTEGER := 5;
    v_regenerations_used INTEGER;
BEGIN
    -- Count regenerations for this user and question
    SELECT COUNT(*)
    INTO v_regenerations_used
    FROM explanation_regenerations
    WHERE user_id = p_user_id
    AND question_id = p_question_id;
    
    RETURN QUERY SELECT
        v_regenerations_used < v_max_regenerations AS can_regenerate,
        v_regenerations_used AS regenerations_used,
        GREATEST(0, v_max_regenerations - v_regenerations_used) AS regenerations_remaining,
        v_max_regenerations AS max_regenerations;
END;
$$;

-- Function to get detailed quiz results
CREATE OR REPLACE FUNCTION get_quiz_detailed_results(p_session_id UUID)
RETURNS TABLE (
    session_id UUID,
    user_id UUID,
    quiz_id UUID,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER,
    score INTEGER,
    correct_answers INTEGER,
    incorrect_answers INTEGER,
    accuracy_percentage DECIMAL(5,2),
    time_taken_seconds INTEGER,
    average_time_per_question DECIMAL(10,2),
    difficulty_breakdown JSONB,
    topic_breakdown JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total_questions INTEGER;
    v_correct_answers INTEGER;
    v_incorrect_answers INTEGER;
    v_accuracy DECIMAL(5,2);
    v_avg_time DECIMAL(10,2);
BEGIN
    -- Get basic session data
    SELECT 
        qs.total_questions,
        qs.score
    INTO 
        v_total_questions,
        v_correct_answers
    FROM quiz_sessions qs
    WHERE qs.id = p_session_id;
    
    -- Calculate derived metrics
    v_incorrect_answers := v_total_questions - v_correct_answers;
    
    IF v_total_questions > 0 THEN
        v_accuracy := (v_correct_answers::DECIMAL / v_total_questions::DECIMAL) * 100;
    ELSE
        v_accuracy := 0.00;
    END IF;
    
    -- Calculate average time per question
    SELECT 
        CASE 
            WHEN qs.time_taken_seconds IS NOT NULL AND qs.total_questions > 0
            THEN qs.time_taken_seconds::DECIMAL / qs.total_questions::DECIMAL
            ELSE 0.00
        END
    INTO v_avg_time
    FROM quiz_sessions qs
    WHERE qs.id = p_session_id;
    
    -- Return results
    RETURN QUERY
    SELECT 
        qs.id,
        qs.user_id,
        qs.quiz_id,
        qs.started_at,
        qs.completed_at,
        qs.total_questions,
        qs.score,
        v_correct_answers,
        v_incorrect_answers,
        v_accuracy,
        qs.time_taken_seconds,
        v_avg_time,
        qs.difficulty_breakdown,
        qs.topic_breakdown
    FROM quiz_sessions qs
    WHERE qs.id = p_session_id;
END;
$$;

-- Function to calculate difficulty analysis
CREATE OR REPLACE FUNCTION get_difficulty_analysis(p_session_id UUID)
RETURNS TABLE (
    difficulty TEXT,
    total_questions INTEGER,
    correct_answers INTEGER,
    accuracy_percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.difficulty_level,
        COUNT(*)::INTEGER AS total_questions,
        COUNT(CASE WHEN ua.is_correct = true THEN 1 END)::INTEGER AS correct_answers,
        CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN ua.is_correct = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
            ELSE 0.00
        END AS accuracy_percentage
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    WHERE ua.session_id = p_session_id
    GROUP BY q.difficulty_level
    ORDER BY 
        CASE q.difficulty_level
            WHEN 'easy' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'hard' THEN 3
        END;
END;
$$;

-- Function to calculate topic/category analysis
CREATE OR REPLACE FUNCTION get_topic_analysis(p_session_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    total_questions INTEGER,
    correct_answers INTEGER,
    accuracy_percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(q.category_id, '00000000-0000-0000-0000-000000000000'::UUID) AS category_id,
        COALESCE(qc.name, 'Uncategorized') AS category_name,
        COUNT(*)::INTEGER AS total_questions,
        COUNT(CASE WHEN ua.is_correct = true THEN 1 END)::INTEGER AS correct_answers,
        CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN ua.is_correct = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
            ELSE 0.00
        END AS accuracy_percentage
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    LEFT JOIN question_categories qc ON q.category_id = qc.id
    WHERE ua.session_id = p_session_id
    GROUP BY q.category_id, qc.name
    ORDER BY accuracy_percentage ASC;
END;
$$;

-- Function to get question results with details
CREATE OR REPLACE FUNCTION get_question_results(p_session_id UUID)
RETURNS TABLE (
    question_id UUID,
    question_text TEXT,
    question_image_url TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option TEXT,
    user_answer TEXT,
    is_correct BOOLEAN,
    difficulty_level TEXT,
    category_name TEXT,
    is_bookmarked BOOLEAN,
    time_spent_seconds INTEGER,
    explanation_text TEXT,
    explanation_cached BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question_text,
        q.question_image_url,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_option,
        ua.selected_option,
        ua.is_correct,
        q.difficulty_level,
        COALESCE(qc.name, 'Uncategorized') AS category_name,
        EXISTS (
            SELECT 1 FROM bookmarked_questions bq
            WHERE bq.session_id = p_session_id
            AND bq.question_id = q.id
        ) AS is_bookmarked,
        COALESCE(qtt.time_spent_seconds, 0) AS time_spent_seconds,
        ae.explanation_text,
        (ae.id IS NOT NULL) AS explanation_cached
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    LEFT JOIN question_categories qc ON q.category_id = qc.id
    LEFT JOIN question_time_tracking qtt ON qtt.session_id = p_session_id AND qtt.question_id = q.id
    LEFT JOIN ai_explanations ae ON ae.question_id = q.id AND ae.user_answer = ua.selected_option
    WHERE ua.session_id = p_session_id
    ORDER BY ua.answered_at;
END;
$$;

-- ============================================================================
-- 6️⃣ GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION can_regenerate_explanation TO authenticated;
GRANT EXECUTE ON FUNCTION get_quiz_detailed_results TO authenticated;
GRANT EXECUTE ON FUNCTION get_difficulty_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION get_topic_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION get_question_results TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
