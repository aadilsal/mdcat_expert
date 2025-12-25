-- Comprehensive debug script for user role issue
-- Run this in Supabase SQL Editor

-- 1. Check if user exists in auth.users
SELECT 
    'Auth User' as source,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'hairythelion@gmail.com';

-- 2. Check if user exists in public.users table
SELECT 
    'Public Users' as source,
    id,
    email,
    role,
    created_at
FROM public.users
WHERE email = 'hairythelion@gmail.com';

-- 3. Check if there's a mismatch between auth.users and public.users
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    pu.id as public_id,
    pu.email as public_email,
    pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'hairythelion@gmail.com';

-- 4. If user doesn't exist in public.users, create it
-- (Only run this if step 2 returned no results)
INSERT INTO public.users (id, full_name, email, role)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', 'Hairy Lion'),
    email,
    'admin'
FROM auth.users
WHERE email = 'hairythelion@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- 5. Verify the fix
SELECT 
    id,
    email,
    role,
    created_at
FROM public.users
WHERE email = 'hairythelion@gmail.com';
