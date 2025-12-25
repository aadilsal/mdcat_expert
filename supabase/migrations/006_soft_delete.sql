-- ============================================================================
-- Soft Delete Support for Questions
-- ============================================================================
-- Adds deleted_at column to enable soft deletion of questions
-- ============================================================================

-- Add deleted_at column
ALTER TABLE questions ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Index for filtering out deleted questions
CREATE INDEX idx_questions_deleted ON questions(deleted_at) WHERE deleted_at IS NULL;

-- Index for finding deleted questions
CREATE INDEX idx_questions_deleted_at ON questions(deleted_at DESC) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- Helper Function to Soft Delete Questions
-- ============================================================================

CREATE OR REPLACE FUNCTION soft_delete_question(p_question_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usage_count INTEGER;
BEGIN
    -- Check if question is used in quiz history
    SELECT COUNT(*)
    INTO v_usage_count
    FROM user_answers
    WHERE question_id = p_question_id;
    
    -- If used, prevent deletion
    IF v_usage_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete question: Used in % quiz attempts', v_usage_count;
    END IF;
    
    -- Soft delete
    UPDATE questions
    SET deleted_at = NOW()
    WHERE id = p_question_id
    AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$;

-- ============================================================================
-- Helper Function to Restore Deleted Questions
-- ============================================================================

CREATE OR REPLACE FUNCTION restore_question(p_question_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE questions
    SET deleted_at = NULL
    WHERE id = p_question_id
    AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$;

-- ============================================================================
-- View for Active Questions Only
-- ============================================================================

CREATE OR REPLACE VIEW active_questions AS
SELECT * FROM questions
WHERE deleted_at IS NULL;

-- Grant access to authenticated users
GRANT SELECT ON active_questions TO authenticated;
