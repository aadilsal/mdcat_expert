-- ============================================================================
-- MDCAT EXPERT - COMPLETE DATABASE SCHEMA
-- Supabase PostgreSQL Implementation
-- ============================================================================
-- Description: Complete database schema for quiz/assessment platform
--              Supports text and image-based questions with analytics
-- ============================================================================

-- ============================================================================
-- 1️⃣ USERS & AUTHORIZATION
-- ============================================================================

-- Users table linked to Supabase Auth
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster role-based queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- RLS Policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all users
CREATE POLICY "Admins can update all users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 2️⃣ QUESTION CATEGORIES / TOPICS
-- ============================================================================

CREATE TABLE question_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for category name lookups
CREATE INDEX idx_question_categories_name ON question_categories(name);

-- RLS Policies for question_categories
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read categories
CREATE POLICY "Authenticated users can view categories"
    ON question_categories FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can insert categories
CREATE POLICY "Admins can insert categories"
    ON question_categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update categories
CREATE POLICY "Admins can update categories"
    ON question_categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete categories
CREATE POLICY "Admins can delete categories"
    ON question_categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 3️⃣ QUESTIONS TABLE
-- ============================================================================

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES question_categories(id) ON DELETE SET NULL,
    question_text TEXT,
    question_image_url TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    explanation TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Either question_text OR question_image_url must be present
    CONSTRAINT question_content_check CHECK (
        question_text IS NOT NULL OR question_image_url IS NOT NULL
    )
);

-- Indexes for performance
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_created_by ON questions(created_by);

-- RLS Policies for questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read questions
CREATE POLICY "Authenticated users can view questions"
    ON questions FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can insert questions
CREATE POLICY "Admins can insert questions"
    ON questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update questions
CREATE POLICY "Admins can update questions"
    ON questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete questions
CREATE POLICY "Admins can delete questions"
    ON questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 4️⃣ QUIZ SESSIONS
-- ============================================================================

CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER NOT NULL DEFAULT 0,
    score INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX idx_quiz_sessions_completed ON quiz_sessions(completed_at);

-- RLS Policies for quiz_sessions
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
    ON quiz_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions"
    ON quiz_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON quiz_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
    ON quiz_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 5️⃣ USER ANSWERS
-- ============================================================================

CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate answers for same question in same session
    UNIQUE(session_id, question_id)
);

-- Indexes for performance
CREATE INDEX idx_user_answers_session ON user_answers(session_id);
CREATE INDEX idx_user_answers_question ON user_answers(question_id);
CREATE INDEX idx_user_answers_correct ON user_answers(is_correct);

-- RLS Policies for user_answers
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Users can view their own answers
CREATE POLICY "Users can view own answers"
    ON user_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = user_answers.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Users can insert their own answers
CREATE POLICY "Users can insert own answers"
    ON user_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = user_answers.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Admins can view all answers
CREATE POLICY "Admins can view all answers"
    ON user_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 7️⃣ USER ANALYTICS
-- ============================================================================

CREATE TABLE user_analytics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_quizzes INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX idx_user_analytics_accuracy ON user_analytics(accuracy_percentage DESC);
CREATE INDEX idx_user_analytics_total_correct ON user_analytics(total_correct_answers DESC);

-- RLS Policies for user_analytics
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics"
    ON user_analytics FOR SELECT
    USING (auth.uid() = user_id);

-- All authenticated users can view all analytics (for leaderboard)
CREATE POLICY "Authenticated users can view all analytics"
    ON user_analytics FOR SELECT
    TO authenticated
    USING (true);

-- System can insert/update analytics (via triggers)
CREATE POLICY "System can manage analytics"
    ON user_analytics FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 6️⃣ LEADERBOARD VIEW
-- ============================================================================

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    COALESCE(ua.total_quizzes, 0) as total_quizzes,
    COALESCE(ua.total_correct_answers, 0) as total_correct_answers,
    COALESCE(ua.total_questions_answered, 0) as total_questions_answered,
    COALESCE(ua.accuracy_percentage, 0.00) as accuracy_percentage,
    ua.last_active_at,
    ROW_NUMBER() OVER (ORDER BY ua.total_correct_answers DESC, ua.accuracy_percentage DESC) as rank
FROM users u
LEFT JOIN user_analytics ua ON u.id = ua.user_id
WHERE u.role = 'user'
ORDER BY total_correct_answers DESC, accuracy_percentage DESC;

-- Grant access to authenticated users
GRANT SELECT ON leaderboard TO authenticated;

-- ============================================================================
-- 8️⃣ DATABASE FUNCTIONS
-- ============================================================================

-- Function to calculate quiz score
CREATE OR REPLACE FUNCTION calculate_quiz_score(p_session_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_score INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_score
    FROM user_answers
    WHERE session_id = p_session_id
    AND is_correct = true;
    
    RETURN v_score;
END;
$$;

-- Function to update user analytics
CREATE OR REPLACE FUNCTION update_user_analytics(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_quizzes INTEGER;
    v_total_questions INTEGER;
    v_total_correct INTEGER;
    v_accuracy DECIMAL(5,2);
BEGIN
    -- Calculate statistics
    SELECT 
        COUNT(DISTINCT qs.id),
        COUNT(ua.id),
        COUNT(CASE WHEN ua.is_correct = true THEN 1 END)
    INTO 
        v_total_quizzes,
        v_total_questions,
        v_total_correct
    FROM quiz_sessions qs
    LEFT JOIN user_answers ua ON qs.id = ua.session_id
    WHERE qs.user_id = p_user_id
    AND qs.status = 'completed';
    
    -- Calculate accuracy
    IF v_total_questions > 0 THEN
        v_accuracy := (v_total_correct::DECIMAL / v_total_questions::DECIMAL) * 100;
    ELSE
        v_accuracy := 0.00;
    END IF;
    
    -- Insert or update analytics
    INSERT INTO user_analytics (
        user_id,
        total_quizzes,
        total_questions_answered,
        total_correct_answers,
        accuracy_percentage,
        last_active_at,
        updated_at
    ) VALUES (
        p_user_id,
        v_total_quizzes,
        v_total_questions,
        v_total_correct,
        v_accuracy,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_quizzes = v_total_quizzes,
        total_questions_answered = v_total_questions,
        total_correct_answers = v_total_correct,
        accuracy_percentage = v_accuracy,
        last_active_at = NOW(),
        updated_at = NOW();
END;
$$;

-- Function to complete quiz session
CREATE OR REPLACE FUNCTION complete_quiz_session(p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_score INTEGER;
BEGIN
    -- Get user_id and calculate score
    SELECT user_id INTO v_user_id
    FROM quiz_sessions
    WHERE id = p_session_id;
    
    v_score := calculate_quiz_score(p_session_id);
    
    -- Update session
    UPDATE quiz_sessions
    SET 
        status = 'completed',
        completed_at = NOW(),
        score = v_score
    WHERE id = p_session_id;
    
    -- Update user analytics
    PERFORM update_user_analytics(v_user_id);
END;
$$;

-- ============================================================================
-- 9️⃣ DATABASE TRIGGERS
-- ============================================================================

-- Trigger to auto-evaluate answer correctness
CREATE OR REPLACE FUNCTION evaluate_answer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if the selected option is correct
    SELECT (q.correct_option = NEW.selected_option)
    INTO NEW.is_correct
    FROM questions q
    WHERE q.id = NEW.question_id;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_evaluate_answer
    BEFORE INSERT ON user_answers
    FOR EACH ROW
    EXECUTE FUNCTION evaluate_answer();

-- Trigger to update quiz session after answer
CREATE OR REPLACE FUNCTION update_session_on_answer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update total questions count
    UPDATE quiz_sessions
    SET total_questions = (
        SELECT COUNT(*)
        FROM user_answers
        WHERE session_id = NEW.session_id
    )
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_session_on_answer
    AFTER INSERT ON user_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_session_on_answer();

-- Trigger to update analytics when quiz is completed
CREATE OR REPLACE FUNCTION trigger_update_analytics_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only update if status changed to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        PERFORM update_user_analytics(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_quiz_completion
    AFTER UPDATE ON quiz_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_analytics_on_completion();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 🔟 PERFORMANCE OPTIMIZATION - ADDITIONAL INDEXES
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_quiz_sessions_user_status ON quiz_sessions(user_id, status);
CREATE INDEX idx_user_answers_session_correct ON user_answers(session_id, is_correct);

-- ============================================================================
-- 1️⃣1️⃣ STORAGE BUCKET SETUP (Run in Supabase Dashboard or via SQL)
-- ============================================================================

-- Note: Storage buckets are typically created via Supabase Dashboard
-- However, here's the SQL equivalent:

-- Create storage bucket for question images
INSERT INTO storage.buckets (id, name, public)
VALUES ('question_images', 'question_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for question_images bucket

-- Allow authenticated users to read images
CREATE POLICY "Authenticated users can view question images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'question_images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload question images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'question_images'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admins to update images
CREATE POLICY "Admins can update question images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'question_images'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete question images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'question_images'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- INITIAL DATA SETUP (Optional)
-- ============================================================================

-- Insert default categories
INSERT INTO question_categories (name, description) VALUES
    ('Biology', 'Biology questions for MDCAT'),
    ('Chemistry', 'Chemistry questions for MDCAT'),
    ('Physics', 'Physics questions for MDCAT'),
    ('English', 'English comprehension and grammar'),
    ('Logical Reasoning', 'Logical and analytical reasoning')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS FOR APPLICATION
-- ============================================================================

-- Function to get random questions for a quiz
CREATE OR REPLACE FUNCTION get_random_questions(
    p_category_id UUID DEFAULT NULL,
    p_difficulty TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS SETOF questions
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM questions
    WHERE (p_category_id IS NULL OR category_id = p_category_id)
    AND (p_difficulty IS NULL OR difficulty_level = p_difficulty)
    ORDER BY RANDOM()
    LIMIT p_limit;
$$;

-- Function to get user's quiz history
CREATE OR REPLACE FUNCTION get_user_quiz_history(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER,
    score INTEGER,
    accuracy DECIMAL(5,2)
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        id as session_id,
        started_at,
        completed_at,
        total_questions,
        score,
        CASE 
            WHEN total_questions > 0 
            THEN (score::DECIMAL / total_questions::DECIMAL) * 100
            ELSE 0.00
        END as accuracy
    FROM quiz_sessions
    WHERE user_id = p_user_id
    AND status = 'completed'
    ORDER BY completed_at DESC;
$$;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
