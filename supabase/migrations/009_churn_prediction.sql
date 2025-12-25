-- ============================================================================
-- Churn Prediction & Engagement Analytics Schema
-- ============================================================================
-- Tables and functions for tracking user engagement, predicting churn,
-- and generating retention insights
-- ============================================================================

-- ============================================================================
-- Table: user_engagement_metrics
-- ============================================================================
-- Stores calculated engagement metrics for each user
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Recency metrics (days since last activity)
    days_since_last_login INTEGER DEFAULT 0,
    days_since_last_quiz INTEGER DEFAULT 0,
    
    -- Frequency metrics (activity counts)
    login_count_7d INTEGER DEFAULT 0,
    login_count_30d INTEGER DEFAULT 0,
    quiz_count_7d INTEGER DEFAULT 0,
    quiz_count_30d INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_score_7d NUMERIC(5,2) DEFAULT 0,
    avg_score_30d NUMERIC(5,2) DEFAULT 0,
    avg_accuracy_7d NUMERIC(5,2) DEFAULT 0,
    avg_accuracy_30d NUMERIC(5,2) DEFAULT 0,
    
    -- Engagement metrics
    session_duration_avg_minutes NUMERIC(8,2) DEFAULT 0,
    categories_engaged INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    
    -- Calculated component scores (0-100)
    recency_score NUMERIC(5,2) DEFAULT 0,
    frequency_score NUMERIC(5,2) DEFAULT 0,
    performance_score NUMERIC(5,2) DEFAULT 0,
    
    -- Final engagement score (0-100)
    engagement_score NUMERIC(5,2) DEFAULT 0,
    
    -- Risk assessment
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    churn_probability NUMERIC(5,2) DEFAULT 0, -- 0-100
    
    -- Trend indicators
    score_trend TEXT CHECK (score_trend IN ('improving', 'stable', 'declining')),
    previous_score NUMERIC(5,2),
    
    -- Metadata
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_engagement UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_engagement_user ON user_engagement_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_risk ON user_engagement_metrics(risk_level);
CREATE INDEX IF NOT EXISTS idx_engagement_score ON user_engagement_metrics(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_churn ON user_engagement_metrics(churn_probability DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_updated ON user_engagement_metrics(updated_at DESC);

COMMENT ON TABLE user_engagement_metrics IS 'Stores calculated engagement metrics and churn predictions for users';

-- ============================================================================
-- Table: churn_predictions
-- ============================================================================
-- Historical record of churn predictions for trend analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS churn_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prediction_date DATE DEFAULT CURRENT_DATE,
    
    -- Prediction outputs
    churn_probability NUMERIC(5,2) NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    engagement_score NUMERIC(5,2) NOT NULL,
    
    -- Contributing factors (stored as JSON)
    factors JSONB DEFAULT '{}'::jsonb,
    
    -- Recommended actions
    recommended_actions TEXT[],
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_prediction_date UNIQUE(user_id, prediction_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_predictions_user ON churn_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON churn_predictions(prediction_date DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_risk ON churn_predictions(risk_level);

COMMENT ON TABLE churn_predictions IS 'Historical churn predictions for trend analysis';

-- ============================================================================
-- Table: engagement_alerts
-- ============================================================================
-- Alerts for at-risk users and engagement changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS engagement_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'high_risk',
        'engagement_drop',
        'inactive_user',
        'performance_decline',
        'no_recent_activity'
    )),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Alert management
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    dismissed_by UUID REFERENCES users(id),
    
    -- Cooldown tracking (prevent spam)
    last_triggered_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_alert_type UNIQUE(user_id, alert_type, is_dismissed)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user ON engagement_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON engagement_alerts(is_dismissed) WHERE is_dismissed = FALSE;
CREATE INDEX IF NOT EXISTS idx_alerts_created ON engagement_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON engagement_alerts(alert_type);

COMMENT ON TABLE engagement_alerts IS 'Alerts for at-risk users and engagement changes';

-- ============================================================================
-- Function: calculate_user_engagement_metrics
-- ============================================================================
-- Calculates all engagement metrics for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_user_engagement_metrics(p_user_id UUID)
RETURNS TABLE(
    recency_score NUMERIC,
    frequency_score NUMERIC,
    performance_score NUMERIC,
    engagement_score NUMERIC,
    risk_level TEXT,
    churn_probability NUMERIC
) AS $$
DECLARE
    v_days_since_login INTEGER;
    v_days_since_quiz INTEGER;
    v_login_7d INTEGER;
    v_login_30d INTEGER;
    v_quiz_7d INTEGER;
    v_quiz_30d INTEGER;
    v_avg_score_7d NUMERIC;
    v_avg_score_30d NUMERIC;
    v_avg_accuracy_7d NUMERIC;
    v_recency_score NUMERIC;
    v_frequency_score NUMERIC;
    v_performance_score NUMERIC;
    v_final_score NUMERIC;
    v_risk TEXT;
    v_churn_prob NUMERIC;
BEGIN
    -- Calculate recency metrics
    SELECT 
        COALESCE(EXTRACT(DAY FROM NOW() - MAX(created_at)), 999)
    INTO v_days_since_login
    FROM user_activity_logs
    WHERE user_id = p_user_id AND activity_type = 'login';
    
    SELECT 
        COALESCE(EXTRACT(DAY FROM NOW() - MAX(completed_at)), 999)
    INTO v_days_since_quiz
    FROM quiz_attempts
    WHERE user_id = p_user_id AND status = 'completed';
    
    -- Calculate frequency metrics
    SELECT COUNT(*) INTO v_login_7d
    FROM user_activity_logs
    WHERE user_id = p_user_id 
    AND activity_type = 'login'
    AND created_at >= NOW() - INTERVAL '7 days';
    
    SELECT COUNT(*) INTO v_login_30d
    FROM user_activity_logs
    WHERE user_id = p_user_id 
    AND activity_type = 'login'
    AND created_at >= NOW() - INTERVAL '30 days';
    
    SELECT COUNT(*) INTO v_quiz_7d
    FROM quiz_attempts
    WHERE user_id = p_user_id
    AND status = 'completed'
    AND completed_at >= NOW() - INTERVAL '7 days';
    
    SELECT COUNT(*) INTO v_quiz_30d
    FROM quiz_attempts
    WHERE user_id = p_user_id
    AND status = 'completed'
    AND completed_at >= NOW() - INTERVAL '30 days';
    
    -- Calculate performance metrics
    SELECT COALESCE(AVG(score), 0) INTO v_avg_score_7d
    FROM quiz_attempts
    WHERE user_id = p_user_id
    AND status = 'completed'
    AND completed_at >= NOW() - INTERVAL '7 days';
    
    SELECT COALESCE(AVG(score), 0) INTO v_avg_score_30d
    FROM quiz_attempts
    WHERE user_id = p_user_id
    AND status = 'completed'
    AND completed_at >= NOW() - INTERVAL '30 days';
    
    SELECT COALESCE(AVG(
        CASE 
            WHEN total_questions > 0 
            THEN (correct_answers::NUMERIC / total_questions * 100)
            ELSE 0
        END
    ), 0) INTO v_avg_accuracy_7d
    FROM quiz_attempts
    WHERE user_id = p_user_id
    AND status = 'completed'
    AND completed_at >= NOW() - INTERVAL '7 days';
    
    -- Calculate component scores
    -- Recency Score: More recent = higher score
    v_recency_score := (
        GREATEST(0, 100 - (v_days_since_login * 3.33)) * 0.6 +
        GREATEST(0, 100 - (v_days_since_quiz * 2.5)) * 0.4
    );
    
    -- Frequency Score: More activity = higher score
    v_frequency_score := (
        LEAST(100, (v_login_7d::NUMERIC / 7) * 100) * 0.5 +
        LEAST(100, (v_quiz_7d::NUMERIC / 3) * 100) * 0.5
    );
    
    -- Performance Score: Better results = higher score
    v_performance_score := (v_avg_score_7d * 0.6 + v_avg_accuracy_7d * 0.4);
    
    -- Calculate final engagement score (weighted average)
    v_final_score := (
        v_recency_score * 0.4 +
        v_frequency_score * 0.35 +
        v_performance_score * 0.25
    );
    v_final_score := ROUND(LEAST(100, GREATEST(0, v_final_score)), 2);
    
    -- Determine risk level
    IF v_final_score >= 70 THEN
        v_risk := 'low';
    ELSIF v_final_score >= 40 THEN
        v_risk := 'medium';
    ELSE
        v_risk := 'high';
    END IF;
    
    -- Calculate churn probability
    v_churn_prob := 100 - v_final_score;
    
    -- Adjust based on specific risk factors
    IF v_days_since_login > 14 THEN v_churn_prob := v_churn_prob + 15; END IF;
    IF v_days_since_quiz > 21 THEN v_churn_prob := v_churn_prob + 20; END IF;
    IF v_quiz_30d = 0 THEN v_churn_prob := v_churn_prob + 25; END IF;
    IF v_avg_score_30d < 50 THEN v_churn_prob := v_churn_prob + 10; END IF;
    
    v_churn_prob := ROUND(LEAST(100, GREATEST(0, v_churn_prob)), 2);
    
    RETURN QUERY SELECT 
        ROUND(v_recency_score, 2),
        ROUND(v_frequency_score, 2),
        ROUND(v_performance_score, 2),
        v_final_score,
        v_risk,
        v_churn_prob;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_user_engagement_metrics IS 'Calculates engagement scores and churn probability for a user';

-- ============================================================================
-- Function: update_all_engagement_metrics
-- ============================================================================
-- Updates engagement metrics for all users (batch job)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_all_engagement_metrics()
RETURNS INTEGER AS $$
DECLARE
    v_user_record RECORD;
    v_metrics RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_user_record IN SELECT id FROM users WHERE role = 'user' LOOP
        -- Calculate metrics
        SELECT * INTO v_metrics FROM calculate_user_engagement_metrics(v_user_record.id);
        
        -- Upsert into engagement metrics table
        INSERT INTO user_engagement_metrics (
            user_id,
            recency_score,
            frequency_score,
            performance_score,
            engagement_score,
            risk_level,
            churn_probability,
            last_calculated_at,
            updated_at
        ) VALUES (
            v_user_record.id,
            v_metrics.recency_score,
            v_metrics.frequency_score,
            v_metrics.performance_score,
            v_metrics.engagement_score,
            v_metrics.risk_level,
            v_metrics.churn_probability,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            recency_score = EXCLUDED.recency_score,
            frequency_score = EXCLUDED.frequency_score,
            performance_score = EXCLUDED.performance_score,
            previous_score = user_engagement_metrics.engagement_score,
            engagement_score = EXCLUDED.engagement_score,
            risk_level = EXCLUDED.risk_level,
            churn_probability = EXCLUDED.churn_probability,
            last_calculated_at = NOW(),
            updated_at = NOW();
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_all_engagement_metrics IS 'Batch update engagement metrics for all users';

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT ON user_engagement_metrics TO authenticated;
GRANT SELECT ON churn_predictions TO authenticated;
GRANT SELECT ON engagement_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_engagement_metrics TO authenticated;
