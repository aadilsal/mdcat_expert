-- ============================================================================
-- AUTH TRIGGER - Automatic User Profile Creation
-- ============================================================================
-- This migration adds a trigger to automatically create a user profile
-- in the public.users table when a new user signs up via Supabase Auth
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'user'  -- Default role is 'user'
  );
  
  -- Also initialize user analytics
  INSERT INTO public.user_analytics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to execute function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a user profile in public.users when a new user signs up via Supabase Auth. Also initializes user analytics.';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
'Triggers automatic user profile creation on signup';
