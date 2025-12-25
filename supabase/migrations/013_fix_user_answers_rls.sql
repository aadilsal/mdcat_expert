-- ============================================================================
-- Fix User Answers RLS Policy
-- ============================================================================
-- Fixes the INSERT policy for user_answers to properly validate session ownership
-- ============================================================================

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can insert own answers" ON user_answers;

-- Create corrected policy
-- The issue was that the WITH CHECK clause was referencing user_answers.session_id
-- which doesn't exist yet during INSERT validation
CREATE POLICY "Users can insert own answers"
    ON user_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

COMMENT ON POLICY "Users can insert own answers" ON user_answers IS 'Allows users to insert answers for their own quiz sessions';
