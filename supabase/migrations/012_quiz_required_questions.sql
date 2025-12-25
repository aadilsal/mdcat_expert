-- ============================================================================
-- Quiz-Required Questions Migration
-- ============================================================================
-- Makes all questions belong to a quiz
-- Auto-creates quizzes for Excel uploads
-- ============================================================================

-- ============================================================================
-- Step 1: Create default quiz for existing orphaned questions
-- ============================================================================

-- Insert default quiz for uncategorized questions
INSERT INTO quizzes (
    title,
    description,
    difficulty_level,
    time_limit_minutes,
    question_count,
    is_active,
    is_practice_mode,
    allow_pause,
    show_results_immediately
) VALUES (
    'Uncategorized Questions',
    'Questions that have not been organized into specific quizzes yet',
    'mixed',
    60,
    0, -- Will be updated by trigger
    true,
    true,
    true,
    true
)
ON CONFLICT DO NOTHING;

-- Link all existing questions to the default quiz
DO $$
DECLARE
    default_quiz_id UUID;
    question_record RECORD;
    order_num INTEGER := 1;
BEGIN
    -- Get the default quiz ID
    SELECT id INTO default_quiz_id 
    FROM quizzes 
    WHERE title = 'Uncategorized Questions' 
    LIMIT 1;

    -- Link all questions that aren't already in a quiz
    FOR question_record IN 
        SELECT q.id 
        FROM questions q
        LEFT JOIN quiz_questions qq ON q.id = qq.question_id
        WHERE qq.question_id IS NULL
    LOOP
        INSERT INTO quiz_questions (quiz_id, question_id, question_order)
        VALUES (default_quiz_id, question_record.id, order_num)
        ON CONFLICT DO NOTHING;
        
        order_num := order_num + 1;
    END LOOP;

    -- Update question count
    UPDATE quizzes 
    SET question_count = order_num - 1
    WHERE id = default_quiz_id;
END $$;

-- ============================================================================
-- Step 2: Create RPC function for bulk upload with quiz creation
-- ============================================================================

CREATE OR REPLACE FUNCTION bulk_insert_questions_with_quiz(
    quiz_title TEXT,
    quiz_description TEXT,
    quiz_category_id UUID,
    questions_data JSONB,
    admin_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    quiz_id UUID,
    inserted_count INTEGER,
    error_message TEXT
) AS $$
DECLARE
    new_quiz_id UUID;
    question_record JSONB;
    inserted_question_id UUID;
    inserted_count_var INTEGER := 0;
    question_order_var INTEGER := 1;
    calculated_difficulty TEXT;
    calculated_time_limit INTEGER;
    question_count_var INTEGER;
BEGIN
    -- Calculate question count
    SELECT jsonb_array_length(questions_data) INTO question_count_var;
    
    -- Calculate difficulty (most common difficulty in questions)
    SELECT 
        COALESCE(
            (SELECT value->>'difficulty_level' 
             FROM jsonb_array_elements(questions_data) AS value
             GROUP BY value->>'difficulty_level'
             ORDER BY COUNT(*) DESC
             LIMIT 1),
            'medium'
        ) INTO calculated_difficulty;
    
    -- Calculate time limit (1.5 minutes per question, rounded up)
    calculated_time_limit := CEIL(question_count_var * 1.5);
    
    -- Create the quiz
    INSERT INTO quizzes (
        title,
        description,
        category_id,
        difficulty_level,
        time_limit_minutes,
        question_count,
        is_active,
        is_practice_mode,
        allow_pause,
        show_results_immediately,
        created_by
    ) VALUES (
        quiz_title,
        COALESCE(quiz_description, 'Imported from Excel upload'),
        quiz_category_id,
        calculated_difficulty,
        calculated_time_limit,
        question_count_var,
        true,
        false,
        true,
        true,
        admin_id
    )
    RETURNING id INTO new_quiz_id;
    
    -- Insert questions and link to quiz
    FOR question_record IN SELECT * FROM jsonb_array_elements(questions_data)
    LOOP
        -- Insert question
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
        )
        RETURNING id INTO inserted_question_id;
        
        -- Link question to quiz
        INSERT INTO quiz_questions (
            quiz_id,
            question_id,
            question_order
        ) VALUES (
            new_quiz_id,
            inserted_question_id,
            question_order_var
        );
        
        inserted_count_var := inserted_count_var + 1;
        question_order_var := question_order_var + 1;
    END LOOP;
    
    RETURN QUERY SELECT TRUE, new_quiz_id, inserted_count_var, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 0, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION bulk_insert_questions_with_quiz IS 'Bulk insert questions with automatic quiz creation';

-- ============================================================================
-- Step 3: Create RPC function for adding single question to quiz
-- ============================================================================

CREATE OR REPLACE FUNCTION add_question_to_quiz(
    p_quiz_id UUID,
    p_category_id UUID,
    p_question_text TEXT,
    p_question_image_url TEXT,
    p_option_a TEXT,
    p_option_b TEXT,
    p_option_c TEXT,
    p_option_d TEXT,
    p_correct_option TEXT,
    p_difficulty_level TEXT,
    p_explanation TEXT,
    p_admin_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    question_id UUID,
    error_message TEXT
) AS $$
DECLARE
    new_question_id UUID;
    next_order INTEGER;
BEGIN
    -- Get next question order for this quiz
    SELECT COALESCE(MAX(question_order), 0) + 1 
    INTO next_order
    FROM quiz_questions
    WHERE quiz_id = p_quiz_id;
    
    -- Insert question
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
        p_category_id,
        p_question_text,
        p_question_image_url,
        p_option_a,
        p_option_b,
        p_option_c,
        p_option_d,
        p_correct_option,
        p_difficulty_level,
        p_explanation,
        p_admin_id
    )
    RETURNING id INTO new_question_id;
    
    -- Link to quiz
    INSERT INTO quiz_questions (
        quiz_id,
        question_id,
        question_order
    ) VALUES (
        p_quiz_id,
        new_question_id,
        next_order
    );
    
    -- Update quiz question count
    UPDATE quizzes
    SET question_count = question_count + 1
    WHERE id = p_quiz_id;
    
    RETURN QUERY SELECT TRUE, new_question_id, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_question_to_quiz IS 'Add a single question to a specific quiz';

-- ============================================================================
-- Step 4: Create trigger to update quiz question count
-- ============================================================================

CREATE OR REPLACE FUNCTION update_quiz_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE quizzes
        SET question_count = (
            SELECT COUNT(*)
            FROM quiz_questions
            WHERE quiz_id = NEW.quiz_id
        )
        WHERE id = NEW.quiz_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE quizzes
        SET question_count = (
            SELECT COUNT(*)
            FROM quiz_questions
            WHERE quiz_id = OLD.quiz_id
        )
        WHERE id = OLD.quiz_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count ON quiz_questions;

CREATE TRIGGER trigger_update_quiz_question_count
AFTER INSERT OR DELETE ON quiz_questions
FOR EACH ROW
EXECUTE FUNCTION update_quiz_question_count();

COMMENT ON TRIGGER trigger_update_quiz_question_count ON quiz_questions IS 'Automatically updates quiz question count';
