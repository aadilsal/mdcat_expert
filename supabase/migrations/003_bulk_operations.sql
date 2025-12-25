-- ============================================================================
-- Bulk Operations RPC Functions
-- ============================================================================
-- Supabase functions for bulk question insertion and duplicate detection
-- ============================================================================

-- ============================================================================
-- Function: bulk_insert_questions
-- ============================================================================
-- Inserts multiple questions in a single transaction
-- Returns success status, count, and error message if any
-- ============================================================================

CREATE OR REPLACE FUNCTION bulk_insert_questions(
    questions_data JSONB,
    admin_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    inserted_count INTEGER,
    error_message TEXT
) AS $$
DECLARE
    question_record JSONB;
    inserted_count_var INTEGER := 0;
BEGIN
    -- Loop through each question in the array
    FOR question_record IN SELECT * FROM jsonb_array_elements(questions_data)
    LOOP
        INSERT INTO questions (
            category_id,
            question_text,
            question_image_url,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            difficulty_level,
            explanation,
            created_by
        ) VALUES (
            (question_record->>'category_id')::UUID,
            question_record->>'question_text',
            question_record->>'question_image_url',
            question_record->>'option_a',
            question_record->>'option_b',
            question_record->>'option_c',
            question_record->>'option_d',
            question_record->>'correct_option',
            question_record->>'difficulty_level',
            question_record->>'explanation',
            admin_id
        );
        
        inserted_count_var := inserted_count_var + 1;
    END LOOP;
    
    RETURN QUERY SELECT TRUE, inserted_count_var, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, 0, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION bulk_insert_questions IS 'Bulk insert questions with transaction support';

-- ============================================================================
-- Function: detect_duplicate_questions
-- ============================================================================
-- Detects duplicate questions by matching question text
-- Returns existing question text and ID for duplicates found
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_duplicate_questions(
    question_texts TEXT[]
)
RETURNS TABLE(
    question_text TEXT,
    existing_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.question_text,
        q.id
    FROM questions q
    WHERE q.question_text = ANY(question_texts)
    AND q.question_text IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION detect_duplicate_questions IS 'Detects duplicate questions by text matching';
