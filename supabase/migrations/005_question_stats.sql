-- ============================================================================
-- Question Usage Statistics Table
-- ============================================================================
-- Tracks how questions are used in quizzes and their performance metrics
-- ============================================================================

CREATE TABLE question_usage_stats (
    question_id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
    times_attempted INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    correct_percentage DECIMAL(5,2) DEFAULT 0.00,
    avg_response_time_ms INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_question_stats_usage ON question_usage_stats(times_attempted DESC);
CREATE INDEX idx_question_stats_accuracy ON question_usage_stats(correct_percentage DESC);

-- RLS Policies
ALTER TABLE question_usage_stats ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view stats
CREATE POLICY "Authenticated users can view question stats"
    ON question_usage_stats FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- Trigger to Update Question Stats
-- ============================================================================

CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update or insert stats for the question
    INSERT INTO question_usage_stats (
        question_id,
        times_attempted,
        times_correct,
        correct_percentage,
        last_used_at,
        updated_at
    )
    SELECT 
        NEW.question_id,
        COUNT(*),
        COUNT(*) FILTER (WHERE is_correct = true),
        CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100
            ELSE 0.00
        END,
        NOW(),
        NOW()
    FROM user_answers
    WHERE question_id = NEW.question_id
    ON CONFLICT (question_id) DO UPDATE SET
        times_attempted = EXCLUDED.times_attempted,
        times_correct = EXCLUDED.times_correct,
        correct_percentage = EXCLUDED.correct_percentage,
        last_used_at = EXCLUDED.last_used_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT ON user_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_question_stats();

-- ============================================================================
-- Initialize Stats for Existing Questions
-- ============================================================================

INSERT INTO question_usage_stats (question_id, times_attempted, times_correct, correct_percentage)
SELECT 
    q.id,
    COALESCE(COUNT(ua.id), 0) as times_attempted,
    COALESCE(COUNT(ua.id) FILTER (WHERE ua.is_correct = true), 0) as times_correct,
    CASE 
        WHEN COUNT(ua.id) > 0 
        THEN (COUNT(ua.id) FILTER (WHERE ua.is_correct = true)::DECIMAL / COUNT(ua.id)) * 100
        ELSE 0.00
    END as correct_percentage
FROM questions q
LEFT JOIN user_answers ua ON q.id = ua.question_id
GROUP BY q.id
ON CONFLICT (question_id) DO NOTHING;
