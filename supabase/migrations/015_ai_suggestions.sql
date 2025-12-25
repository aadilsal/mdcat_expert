-- ============================================================================
-- AI-Powered Suggestions Module
-- ============================================================================
-- Description: Caching and rate limiting for AI-generated suggestions
-- ============================================================================

-- ============================================================================
-- 1️⃣ AI SUGGESTIONS CACHE TABLE
-- ============================================================================

CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    performance_hash TEXT NOT NULL,
    suggestions_data JSONB NOT NULL,
    study_plan JSONB,
    practice_suggestions JSONB,
    motivational_insights JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Unique constraint: one cache per user per performance state
    UNIQUE(user_id, performance_hash)
);

-- Indexes
CREATE INDEX idx_ai_suggestions_user ON ai_suggestions(user_id);
CREATE INDEX idx_ai_suggestions_expires ON ai_suggestions(expires_at);
CREATE INDEX idx_ai_suggestions_hash ON ai_suggestions(user_id, performance_hash);

-- RLS Policies
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view their own suggestions
CREATE POLICY "Users can view own suggestions"
    ON ai_suggestions FOR SELECT
    USING (auth.uid() = user_id);

-- System can insert/update suggestions
CREATE POLICY "System can manage suggestions"
    ON ai_suggestions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2️⃣ SUGGESTION REGENERATIONS TABLE (Rate Limiting)
-- ============================================================================

CREATE TABLE suggestion_regenerations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    regenerated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suggestion_regenerations_user ON suggestion_regenerations(user_id);
CREATE INDEX idx_suggestion_regenerations_date ON suggestion_regenerations(regenerated_at DESC);

-- RLS Policies
ALTER TABLE suggestion_regenerations ENABLE ROW LEVEL SECURITY;

-- Users can view their own regenerations
CREATE POLICY "Users can view own regenerations"
    ON suggestion_regenerations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own regenerations
CREATE POLICY "Users can insert own regenerations"
    ON suggestion_regenerations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3️⃣ DATABASE FUNCTIONS
-- ============================================================================

-- Function to check if user can regenerate suggestions
CREATE OR REPLACE FUNCTION can_regenerate_suggestions(p_user_id UUID)
RETURNS TABLE (
    can_regenerate BOOLEAN,
    regenerations_today INTEGER,
    regenerations_remaining INTEGER,
    max_regenerations INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_max_regenerations INTEGER := 3;
    v_regenerations_today INTEGER;
BEGIN
    -- Count regenerations in last 24 hours
    SELECT COUNT(*)
    INTO v_regenerations_today
    FROM suggestion_regenerations
    WHERE user_id = p_user_id
    AND regenerated_at > NOW() - INTERVAL '24 hours';
    
    RETURN QUERY SELECT
        v_regenerations_today < v_max_regenerations AS can_regenerate,
        v_regenerations_today AS regenerations_today,
        GREATEST(0, v_max_regenerations - v_regenerations_today) AS regenerations_remaining,
        v_max_regenerations AS max_regenerations;
END;
$$;

-- Function to get comprehensive user performance summary
CREATE OR REPLACE FUNCTION get_user_performance_summary(p_user_id UUID)
RETURNS TABLE (
    overall_accuracy DECIMAL(5,2),
    total_quizzes INTEGER,
    total_questions INTEGER,
    total_correct INTEGER,
    avg_time_per_question DECIMAL(10,2),
    recent_trend TEXT,
    weak_topics JSONB,
    strong_topics JSONB,
    difficulty_performance JSONB,
    time_analysis JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total_quizzes INTEGER;
    v_total_questions INTEGER;
    v_total_correct INTEGER;
    v_overall_accuracy DECIMAL(5,2);
    v_avg_time DECIMAL(10,2);
    v_recent_trend TEXT;
BEGIN
    -- Get basic stats
    SELECT 
        COUNT(DISTINCT qs.id),
        COALESCE(SUM(qs.total_questions), 0),
        COALESCE(SUM(qs.score), 0)
    INTO 
        v_total_quizzes,
        v_total_questions,
        v_total_correct
    FROM quiz_sessions qs
    WHERE qs.user_id = p_user_id
    AND qs.status = 'completed';
    
    -- Calculate overall accuracy
    IF v_total_questions > 0 THEN
        v_overall_accuracy := (v_total_correct::DECIMAL / v_total_questions::DECIMAL) * 100;
    ELSE
        v_overall_accuracy := 0.00;
    END IF;
    
    -- Calculate average time per question
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 AND SUM(qs.total_questions) > 0
            THEN SUM(COALESCE(qs.time_taken_seconds, 0))::DECIMAL / SUM(qs.total_questions)::DECIMAL
            ELSE 0.00
        END
    INTO v_avg_time
    FROM quiz_sessions qs
    WHERE qs.user_id = p_user_id
    AND qs.status = 'completed'
    AND qs.time_taken_seconds IS NOT NULL;
    
    -- Determine recent trend (last 5 vs previous 5 quizzes)
    WITH recent_scores AS (
        SELECT 
            score::DECIMAL / NULLIF(total_questions, 0)::DECIMAL * 100 as accuracy,
            ROW_NUMBER() OVER (ORDER BY completed_at DESC) as rn
        FROM quiz_sessions
        WHERE user_id = p_user_id
        AND status = 'completed'
        AND total_questions > 0
        LIMIT 10
    ),
    trend_calc AS (
        SELECT 
            AVG(CASE WHEN rn <= 5 THEN accuracy END) as recent_avg,
            AVG(CASE WHEN rn > 5 THEN accuracy END) as previous_avg
        FROM recent_scores
    )
    SELECT 
        CASE 
            WHEN recent_avg > previous_avg + 5 THEN 'improving'
            WHEN recent_avg < previous_avg - 5 THEN 'declining'
            ELSE 'stable'
        END
    INTO v_recent_trend
    FROM trend_calc;
    
    -- Return comprehensive summary
    RETURN QUERY
    SELECT 
        v_overall_accuracy,
        v_total_quizzes,
        v_total_questions,
        v_total_correct,
        v_avg_time,
        COALESCE(v_recent_trend, 'stable'),
        -- Weak topics (accuracy < 60%)
        (SELECT JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'topic_id', category_id,
                'topic_name', category_name,
                'accuracy', accuracy_percentage,
                'questions_attempted', total_questions
            )
        )
        FROM get_topic_analysis(
            (SELECT id FROM quiz_sessions WHERE user_id = p_user_id AND status = 'completed' ORDER BY completed_at DESC LIMIT 1)
        )
        WHERE accuracy_percentage < 60
        LIMIT 5) as weak_topics,
        -- Strong topics (accuracy >= 80%)
        (SELECT JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'topic_id', category_id,
                'topic_name', category_name,
                'accuracy', accuracy_percentage,
                'questions_attempted', total_questions
            )
        )
        FROM get_topic_analysis(
            (SELECT id FROM quiz_sessions WHERE user_id = p_user_id AND status = 'completed' ORDER BY completed_at DESC LIMIT 1)
        )
        WHERE accuracy_percentage >= 80
        LIMIT 5) as strong_topics,
        -- Difficulty performance
        (SELECT JSONB_OBJECT_AGG(
            difficulty,
            JSONB_BUILD_OBJECT(
                'accuracy', accuracy_percentage,
                'total', total_questions,
                'correct', correct_answers
            )
        )
        FROM get_difficulty_analysis(
            (SELECT id FROM quiz_sessions WHERE user_id = p_user_id AND status = 'completed' ORDER BY completed_at DESC LIMIT 1)
        )) as difficulty_performance,
        -- Time analysis
        JSONB_BUILD_OBJECT(
            'avg_time_per_question', v_avg_time,
            'total_time_spent', (SELECT SUM(time_taken_seconds) FROM quiz_sessions WHERE user_id = p_user_id AND status = 'completed')
        ) as time_analysis;
END;
$$;

-- Function to get practice question recommendations
CREATE OR REPLACE FUNCTION get_practice_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    topic_id UUID,
    topic_name TEXT,
    current_accuracy DECIMAL(5,2),
    recommended_difficulty TEXT,
    priority_score DECIMAL(5,2),
    question_count INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH user_topic_performance AS (
        SELECT 
            q.category_id,
            qc.name as category_name,
            COUNT(*) as attempted,
            COUNT(CASE WHEN ua.is_correct THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100 as accuracy
        FROM user_answers ua
        JOIN questions q ON ua.question_id = q.id
        JOIN quiz_sessions qs ON ua.session_id = qs.id
        LEFT JOIN question_categories qc ON q.category_id = qc.id
        WHERE qs.user_id = p_user_id
        AND qs.status = 'completed'
        GROUP BY q.category_id, qc.name
    ),
    prioritized_topics AS (
        SELECT 
            category_id,
            category_name,
            accuracy,
            -- Priority: lower accuracy = higher priority
            (100 - accuracy) / 100 as priority,
            CASE 
                WHEN accuracy < 40 THEN 'easy'
                WHEN accuracy < 70 THEN 'medium'
                ELSE 'hard'
            END as recommended_diff
        FROM user_topic_performance
        WHERE accuracy < 80  -- Focus on topics with room for improvement
        ORDER BY priority DESC
        LIMIT p_limit
    )
    SELECT 
        pt.category_id,
        pt.category_name,
        pt.accuracy,
        pt.recommended_diff,
        pt.priority * 100,
        (SELECT COUNT(*) FROM questions WHERE category_id = pt.category_id AND difficulty_level = pt.recommended_diff)::INTEGER
    FROM prioritized_topics pt;
END;
$$;

-- ============================================================================
-- 4️⃣ GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION can_regenerate_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_performance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_practice_recommendations TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
