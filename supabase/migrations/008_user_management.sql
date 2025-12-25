-- ============================================================================
-- User Management Database Schema
-- ============================================================================
-- Tables for user activity tracking, suspensions, role changes, 
-- communications, and segmentation
-- ============================================================================

-- ============================================================================
-- Table: user_activity_logs
-- ============================================================================
-- Tracks all user activities including logins, quiz attempts, and submissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'login', 
        'logout', 
        'quiz_start', 
        'quiz_complete', 
        'answer_submit',
        'profile_update'
    )),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_type ON user_activity_logs(user_id, activity_type);

-- Add comment
COMMENT ON TABLE user_activity_logs IS 'Tracks all user activities for audit and analytics';

-- ============================================================================
-- Table: user_suspensions
-- ============================================================================
-- Manages user suspension and reactivation
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_suspensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    suspended_by UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    suspended_at TIMESTAMPTZ DEFAULT NOW(),
    reactivated_at TIMESTAMPTZ,
    reactivated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT valid_reactivation CHECK (
        (is_active = TRUE AND reactivated_at IS NULL) OR
        (is_active = FALSE AND reactivated_at IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_suspension_user ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_suspension_active ON user_suspensions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_suspension_suspended_by ON user_suspensions(suspended_by);

-- Add comment
COMMENT ON TABLE user_suspensions IS 'Manages user account suspensions and reactivations';

-- ============================================================================
-- Table: user_role_changes
-- ============================================================================
-- Audit log for role changes (admin ↔ user)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_role_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    old_role TEXT NOT NULL,
    new_role TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_roles CHECK (old_role != new_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_role_changes_user ON user_role_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_role_changes_changed_by ON user_role_changes(changed_by);
CREATE INDEX IF NOT EXISTS idx_role_changes_created ON user_role_changes(created_at DESC);

-- Add comment
COMMENT ON TABLE user_role_changes IS 'Audit trail for user role changes';

-- ============================================================================
-- Table: user_communications
-- ============================================================================
-- Tracks emails and announcements sent to users
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sent_by UUID REFERENCES users(id),
    recipient_ids UUID[] NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    communication_type TEXT DEFAULT 'email' CHECK (communication_type IN ('email', 'announcement', 'notification')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivery_status JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_communications_sent_by ON user_communications(sent_by);
CREATE INDEX IF NOT EXISTS idx_communications_sent_at ON user_communications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_recipients ON user_communications USING GIN(recipient_ids);

-- Add comment
COMMENT ON TABLE user_communications IS 'Tracks all communications sent to users';

-- ============================================================================
-- Table: user_segments
-- ============================================================================
-- Saved user segments for filtering and targeting
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    filter_criteria JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_segment_name UNIQUE(name, created_by)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_segments_created_by ON user_segments(created_by);
CREATE INDEX IF NOT EXISTS idx_segments_name ON user_segments(name);

-- Add comment
COMMENT ON TABLE user_segments IS 'Saved user segments for filtering and targeting';

-- ============================================================================
-- View: user_statistics_view
-- ============================================================================
-- Aggregated user statistics for performance and activity
-- ============================================================================

CREATE OR REPLACE VIEW user_statistics_view AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.role,
    u.created_at as joined_at,
    -- Quiz statistics
    COUNT(DISTINCT qa.id) as total_quizzes,
    COALESCE(AVG(qa.score), 0) as avg_score,
    COALESCE(AVG(
        CASE 
            WHEN qa.total_questions > 0 
            THEN (qa.correct_answers::FLOAT / qa.total_questions * 100)
            ELSE 0
        END
    ), 0) as avg_accuracy,
    MAX(qa.completed_at) as last_quiz_date,
    -- Activity statistics
    COUNT(DISTINCT ual.id) FILTER (WHERE ual.activity_type = 'login') as login_count,
    MAX(ual.created_at) FILTER (WHERE ual.activity_type = 'login') as last_login,
    -- Suspension status
    EXISTS(
        SELECT 1 FROM user_suspensions us 
        WHERE us.user_id = u.id AND us.is_active = TRUE
    ) as is_suspended
FROM users u
LEFT JOIN quiz_attempts qa ON u.id = qa.user_id AND qa.status = 'completed'
LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
GROUP BY u.id, u.full_name, u.email, u.role, u.created_at;

-- Add comment
COMMENT ON VIEW user_statistics_view IS 'Aggregated user statistics for admin dashboard';

-- ============================================================================
-- Function: log_user_activity
-- ============================================================================
-- Helper function to log user activities
-- ============================================================================

CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_logs (
        user_id,
        activity_type,
        metadata,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_metadata,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION log_user_activity IS 'Helper function to log user activities';

-- ============================================================================
-- Function: get_user_performance_by_category
-- ============================================================================
-- Returns user performance broken down by question category
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_performance_by_category(p_user_id UUID)
RETURNS TABLE(
    category_id UUID,
    category_name TEXT,
    total_questions INTEGER,
    correct_answers INTEGER,
    accuracy_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qc.id as category_id,
        qc.name as category_name,
        COUNT(ua.id)::INTEGER as total_questions,
        COUNT(ua.id) FILTER (WHERE ua.is_correct = TRUE)::INTEGER as correct_answers,
        ROUND(
            CASE 
                WHEN COUNT(ua.id) > 0 
                THEN (COUNT(ua.id) FILTER (WHERE ua.is_correct = TRUE)::NUMERIC / COUNT(ua.id) * 100)
                ELSE 0
            END,
            1
        ) as accuracy_percentage
    FROM question_categories qc
    LEFT JOIN questions q ON q.category_id = qc.id
    LEFT JOIN user_answers ua ON ua.question_id = q.id
    LEFT JOIN quiz_sessions qs ON qs.id = ua.session_id
    WHERE qs.user_id = p_user_id OR qs.user_id IS NULL
    GROUP BY qc.id, qc.name
    HAVING COUNT(ua.id) > 0
    ORDER BY accuracy_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_user_performance_by_category IS 'Returns user performance by question category';

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON user_statistics_view TO authenticated;
GRANT SELECT, INSERT ON user_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_performance_by_category TO authenticated;
