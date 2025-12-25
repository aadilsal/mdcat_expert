-- ============================================================================
-- SIMPLE FIX: Remove Recursive RLS Policies
-- ============================================================================
-- This removes the problematic admin policies that cause infinite recursion
-- Users can still read their own records, which is all we need for auth
-- ============================================================================

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- The remaining policies are sufficient:
-- ✅ "Users can view own profile" - allows reading own role
-- ✅ "Users can update own profile" - allows updating own data

-- If you need admins to view/manage other users, create admin-specific
-- API routes that use service role client instead of relying on RLS
