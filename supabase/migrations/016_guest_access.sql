-- ============================================================================
-- Guest Access - Allow Anonymous Users to View Questions
-- ============================================================================
-- Enables trial mode: 10 questions without signup
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON question_categories;

-- Allow anonymous users to read questions (limited by app logic)
CREATE POLICY "Anyone can view questions"
    ON questions FOR SELECT
    USING (true);

-- Allow anonymous users to read categories
CREATE POLICY "Anyone can view categories"
    ON question_categories FOR SELECT
    USING (true);

-- Grant anonymous access to questions and categories
GRANT SELECT ON questions TO anon;
GRANT SELECT ON question_categories TO anon;

-- Note: Trial limit (10 questions) is enforced in the application layer
-- Anonymous users cannot create sessions or save answers (those still require auth)
