-- ============================================================================
-- Search and Performance Indexes
-- ============================================================================
-- Adds indexes for full-text search and common query patterns
-- ============================================================================

-- Full-text search index on question_text
CREATE INDEX idx_questions_text_search ON questions 
USING gin(to_tsvector('english', COALESCE(question_text, '')));

-- Composite indexes for common filter combinations
CREATE INDEX idx_questions_category_difficulty ON questions(category_id, difficulty_level)
WHERE deleted_at IS NULL;

CREATE INDEX idx_questions_created_deleted ON questions(created_at DESC, deleted_at)
WHERE deleted_at IS NULL;

-- Index for image vs text questions
CREATE INDEX idx_questions_has_image ON questions((question_image_url IS NOT NULL))
WHERE deleted_at IS NULL;

CREATE INDEX idx_questions_has_text ON questions((question_text IS NOT NULL))
WHERE deleted_at IS NULL;

-- ============================================================================
-- Full-Text Search Function
-- ============================================================================

CREATE OR REPLACE FUNCTION search_questions(
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    question_text TEXT,
    question_image_url TEXT,
    category_id UUID,
    difficulty_level TEXT,
    rank REAL
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
        q.category_id,
        q.difficulty_level,
        ts_rank(
            to_tsvector('english', COALESCE(q.question_text, '')),
            plainto_tsquery('english', p_search_term)
        ) as rank
    FROM questions q
    WHERE deleted_at IS NULL
    AND to_tsvector('english', COALESCE(q.question_text, '')) @@ plainto_tsquery('english', p_search_term)
    ORDER BY rank DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
