-- ============================================================================
-- User Dashboard Schema
-- ============================================================================
-- Tables and functions for personalized user dashboard features
-- ============================================================================

-- ============================================================================
-- Table: quiz_attempts
-- ============================================================================
-- Comprehensive quiz attempt tracking (extends quiz_sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES question_categories(id) ON DELETE SET NULL,
    
    -- Quiz configuration
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    
    -- Scoring
    score NUMERIC(5,2) DEFAULT 0, -- Percentage score
    
    -- Timing
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_category ON quiz_attempts(category_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed ON quiz_attempts(user_id, completed_at DESC);

COMMENT ON TABLE quiz_attempts IS 'Comprehensive quiz attempt tracking for user dashboard';

-- ============================================================================
-- Table: user_streaks
-- ============================================================================
-- Tracks daily and weekly activity streaks
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Current streak
    current_streak INTEGER DEFAULT 0,
    current_streak_start_date DATE,
    
    -- Longest streak
    longest_streak INTEGER DEFAULT 0,
    longest_streak_start_date DATE,
    longest_streak_end_date DATE,
    
    -- Last activity
    last_activity_date DATE DEFAULT CURRENT_DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_longest ON user_streaks(longest_streak DESC);

COMMENT ON TABLE user_streaks IS 'Tracks user activity streaks for gamification';

-- ============================================================================
-- Table: user_achievements
-- ============================================================================
-- Badge and milestone system
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Achievement details
    achievement_type TEXT NOT NULL CHECK (achievement_type IN (
        'first_quiz',
        'quiz_master_10',
        'quiz_master_50',
        'quiz_master_100',
        'perfect_score',
        'streak_7',
        'streak_30',
        'streak_100',
        'category_expert',
        'speed_demon',
        'night_owl',
        'early_bird',
        'comeback_kid',
        'consistent_learner'
    )),
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    
    -- Achievement data
    category_id UUID REFERENCES question_categories(id) ON DELETE SET NULL, -- For category-specific achievements
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Unlock info
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_type, category_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON user_achievements(unlocked_at DESC);

COMMENT ON TABLE user_achievements IS 'User badges and milestone achievements';

-- ============================================================================
-- Table: study_plans
-- ============================================================================
-- Personalized study recommendations
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Focus areas (weak categories)
    focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {category_id, category_name, priority, reason}
    
    -- Goals
    daily_goals JSONB DEFAULT '[]'::jsonb, -- Array of {goal, completed, target_date}
    weekly_goals JSONB DEFAULT '[]'::jsonb,
    
    -- Recommendations
    recommended_quizzes JSONB DEFAULT '[]'::jsonb, -- Array of {category_id, difficulty, reason}
    
    -- Plan metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_active ON study_plans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_study_plans_expires ON study_plans(expires_at);

COMMENT ON TABLE study_plans IS 'Personalized study plans and recommendations';

-- ============================================================================
-- RLS Policies - User-only access
-- ============================================================================

-- quiz_attempts policies
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
    ON quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
    ON quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts"
    ON quiz_attempts FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can view all attempts
CREATE POLICY "Admins can view all quiz attempts"
    ON quiz_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- user_streaks policies
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
    ON user_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks"
    ON user_streaks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_achievements policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage achievements"
    ON user_achievements FOR ALL
    USING (true)
    WITH CHECK (true);

-- study_plans policies
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study plans"
    ON study_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study plans"
    ON study_plans FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Function: calculate_user_streak
-- ============================================================================
-- Calculates and updates user streak based on activity
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS TABLE(
    current_streak INTEGER,
    longest_streak INTEGER
) AS $$
DECLARE
    v_activity_dates DATE[];
    v_current_streak INTEGER := 0;
    v_longest_streak INTEGER := 0;
    v_temp_streak INTEGER := 0;
    v_prev_date DATE;
    v_date DATE;
    v_current_date DATE := CURRENT_DATE;
BEGIN
    -- Get all unique activity dates (quiz completions)
    SELECT ARRAY_AGG(DISTINCT DATE(completed_at) ORDER BY DATE(completed_at) DESC)
    INTO v_activity_dates
    FROM quiz_attempts
    WHERE user_id = p_user_id
    AND status = 'completed'
    AND completed_at IS NOT NULL;
    
    -- If no activity, return zeros
    IF v_activity_dates IS NULL OR array_length(v_activity_dates, 1) = 0 THEN
        RETURN QUERY SELECT 0, 0;
        RETURN;
    END IF;
    
    -- Calculate current streak (from today backwards)
    v_current_streak := 0;
    v_prev_date := v_current_date;
    
    FOREACH v_date IN ARRAY v_activity_dates LOOP
        -- Check if this date is consecutive
        IF v_date = v_prev_date OR v_date = v_prev_date - 1 THEN
            v_current_streak := v_current_streak + 1;
            v_prev_date := v_date;
        ELSE
            EXIT; -- Streak broken
        END IF;
    END LOOP;
    
    -- Calculate longest streak
    v_longest_streak := 0;
    v_temp_streak := 1;
    v_prev_date := v_activity_dates[1];
    
    FOR i IN 2..array_length(v_activity_dates, 1) LOOP
        v_date := v_activity_dates[i];
        
        IF v_prev_date - v_date = 1 THEN
            v_temp_streak := v_temp_streak + 1;
        ELSE
            v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
            v_temp_streak := 1;
        END IF;
        
        v_prev_date := v_date;
    END LOOP;
    
    v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
    
    -- Update user_streaks table
    INSERT INTO user_streaks (
        user_id,
        current_streak,
        longest_streak,
        last_activity_date,
        updated_at
    ) VALUES (
        p_user_id,
        v_current_streak,
        v_longest_streak,
        v_activity_dates[1],
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        current_streak = EXCLUDED.current_streak,
        longest_streak = GREATEST(user_streaks.longest_streak, EXCLUDED.longest_streak),
        last_activity_date = EXCLUDED.last_activity_date,
        updated_at = NOW();
    
    RETURN QUERY SELECT v_current_streak, v_longest_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_user_streak IS 'Calculates and updates user activity streak';

-- ============================================================================
-- Function: unlock_achievement
-- ============================================================================
-- Unlocks an achievement for a user if criteria met
-- ============================================================================

CREATE OR REPLACE FUNCTION unlock_achievement(
    p_user_id UUID,
    p_achievement_type TEXT,
    p_category_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_achievement_name TEXT;
    v_achievement_desc TEXT;
    v_already_unlocked BOOLEAN;
BEGIN
    -- Check if already unlocked
    SELECT EXISTS(
        SELECT 1 FROM user_achievements
        WHERE user_id = p_user_id
        AND achievement_type = p_achievement_type
        AND (category_id = p_category_id OR (category_id IS NULL AND p_category_id IS NULL))
    ) INTO v_already_unlocked;
    
    IF v_already_unlocked THEN
        RETURN FALSE;
    END IF;
    
    -- Set achievement details based on type
    CASE p_achievement_type
        WHEN 'first_quiz' THEN
            v_achievement_name := 'First Steps';
            v_achievement_desc := 'Completed your first quiz';
        WHEN 'quiz_master_10' THEN
            v_achievement_name := 'Quiz Novice';
            v_achievement_desc := 'Completed 10 quizzes';
        WHEN 'quiz_master_50' THEN
            v_achievement_name := 'Quiz Expert';
            v_achievement_desc := 'Completed 50 quizzes';
        WHEN 'quiz_master_100' THEN
            v_achievement_name := 'Quiz Master';
            v_achievement_desc := 'Completed 100 quizzes';
        WHEN 'perfect_score' THEN
            v_achievement_name := 'Perfect!';
            v_achievement_desc := 'Achieved 100% score';
        WHEN 'streak_7' THEN
            v_achievement_name := 'Week Warrior';
            v_achievement_desc := '7-day streak';
        WHEN 'streak_30' THEN
            v_achievement_name := 'Month Master';
            v_achievement_desc := '30-day streak';
        WHEN 'category_expert' THEN
            v_achievement_name := 'Category Expert';
            v_achievement_desc := 'Mastered a category';
        ELSE
            v_achievement_name := 'Achievement';
            v_achievement_desc := 'Special achievement unlocked';
    END CASE;
    
    -- Insert achievement
    INSERT INTO user_achievements (
        user_id,
        achievement_type,
        achievement_name,
        achievement_description,
        category_id
    ) VALUES (
        p_user_id,
        p_achievement_type,
        v_achievement_name,
        v_achievement_desc,
        p_category_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION unlock_achievement IS 'Unlocks an achievement for a user';

-- ============================================================================
-- Function: check_and_unlock_achievements
-- ============================================================================
-- Checks user stats and unlocks eligible achievements
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_quizzes INTEGER;
    v_current_streak INTEGER;
    v_unlocked_count INTEGER := 0;
BEGIN
    -- Get user stats
    SELECT COUNT(*) INTO v_total_quizzes
    FROM quiz_attempts
    WHERE user_id = p_user_id AND status = 'completed';
    
    SELECT current_streak INTO v_current_streak
    FROM user_streaks
    WHERE user_id = p_user_id;
    
    -- Check quiz count achievements
    IF v_total_quizzes >= 1 THEN
        IF unlock_achievement(p_user_id, 'first_quiz') THEN
            v_unlocked_count := v_unlocked_count + 1;
        END IF;
    END IF;
    
    IF v_total_quizzes >= 10 THEN
        IF unlock_achievement(p_user_id, 'quiz_master_10') THEN
            v_unlocked_count := v_unlocked_count + 1;
        END IF;
    END IF;
    
    IF v_total_quizzes >= 50 THEN
        IF unlock_achievement(p_user_id, 'quiz_master_50') THEN
            v_unlocked_count := v_unlocked_count + 1;
        END IF;
    END IF;
    
    IF v_total_quizzes >= 100 THEN
        IF unlock_achievement(p_user_id, 'quiz_master_100') THEN
            v_unlocked_count := v_unlocked_count + 1;
        END IF;
    END IF;
    
    -- Check streak achievements
    IF v_current_streak >= 7 THEN
        IF unlock_achievement(p_user_id, 'streak_7') THEN
            v_unlocked_count := v_unlocked_count + 1;
        END IF;
    END IF;
    
    IF v_current_streak >= 30 THEN
        IF unlock_achievement(p_user_id, 'streak_30') THEN
            v_unlocked_count := v_unlocked_count + 1;
        END IF;
    END IF;
    
    -- Check for perfect scores
    IF EXISTS(
        SELECT 1 FROM quiz_attempts
        WHERE user_id = p_user_id
        AND status = 'completed'
        AND score >= 100
    ) THEN
        IF unlock_achievement(p_user_id, 'perfect_score') THEN
            v_unlocked_count := v_unlocked_count + 1;
        END IF;
    END IF;
    
    RETURN v_unlocked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_and_unlock_achievements IS 'Checks and unlocks eligible achievements for a user';

-- ============================================================================
-- Trigger: Update streak on quiz completion
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_update_streak_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        PERFORM calculate_user_streak(NEW.user_id);
        PERFORM check_and_unlock_achievements(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_streak_on_quiz_completion
    AFTER INSERT OR UPDATE ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_streak_on_quiz();

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT ON quiz_attempts TO authenticated;
GRANT SELECT ON user_streaks TO authenticated;
GRANT SELECT ON user_achievements TO authenticated;
GRANT SELECT ON study_plans TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_streak TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_achievement TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_unlock_achievements TO authenticated;
