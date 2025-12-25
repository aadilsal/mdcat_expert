-- ============================================================================
-- FIX: Infinite Recursion in Users Table RLS Policies
-- ============================================================================
-- Problem: The admin policies check if a user is admin by querying the users
--          table, which triggers the same policy again, causing infinite recursion
-- Solution: Remove the recursive admin policies and rely on simpler policies
-- ============================================================================

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Step 2: Keep only the simple, non-recursive policies
-- (These already exist, just documenting them)
-- "Users can view own profile" - allows users to read their own record
-- "Users can update own profile" - allows users to update their own record

-- Step 3: Create new admin policies that don't cause recursion
-- Instead of checking the users table, we'll use a simpler approach

-- Allow admins to view all users (using auth.jwt() to check role)
CREATE POLICY "Admins can view all users v2"
    ON users FOR SELECT
    USING (
        (auth.jwt()->>'role')::text = 'admin'
        OR auth.uid() = id
    );

-- Allow admins to update all users
CREATE POLICY "Admins can update all users v2"
    ON users FOR UPDATE
    USING (
        (auth.jwt()->>'role')::text = 'admin'
        OR auth.uid() = id
    );

-- ============================================================================
-- IMPORTANT: Update JWT Claims
-- ============================================================================
-- For the above policies to work, we need to add the role to the JWT claims
-- This is done via a database trigger that updates auth.users metadata

-- Create function to sync role to JWT
CREATE OR REPLACE FUNCTION public.handle_user_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the user's raw_app_meta_data in auth.users
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Create trigger to sync role changes
DROP TRIGGER IF EXISTS on_user_role_change ON users;
CREATE TRIGGER on_user_role_change
    AFTER INSERT OR UPDATE OF role ON users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_role_change();

-- ============================================================================
-- Apply the fix to current user
-- ============================================================================

-- Update the current admin user's metadata
UPDATE auth.users
SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'admin')
WHERE email = 'hairythelion@gmail.com';

-- Verify the update
SELECT 
    id,
    email,
    raw_app_meta_data->>'role' as jwt_role
FROM auth.users
WHERE email = 'hairythelion@gmail.com';
