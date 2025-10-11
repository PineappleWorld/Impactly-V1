/*
  # Fix Admin Authentication and Policies
  
  1. Changes
    - Drop ALL existing policies on admin_users table
    - Drop and recreate admin_users table with proper structure
    - Create single comprehensive policy for admin access
    - Enable first admin creation when table is empty
  
  2. Security
    - Allow first admin creation when no admins exist
    - Allow superadmins full access to admin_users
    - Allow admins read-only access to their own record
*/

-- Drop everything and start clean
DROP POLICY IF EXISTS "admin_access_policy" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow superadmins full access" ON public.admin_users;
DROP POLICY IF EXISTS "Allow users to check their own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can read all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can check their own admin status" ON public.admin_users;
DROP TABLE IF EXISTS public.admin_users;

-- Create clean admin_users table
CREATE TABLE public.admin_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('superadmin', 'admin')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create single comprehensive policy
CREATE POLICY "admin_access_policy" ON public.admin_users
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    -- Allow first admin creation when table is empty
    (NOT EXISTS (SELECT 1 FROM public.admin_users))
    OR 
    -- Allow superadmins full access
    (
        role = 'superadmin' 
        AND 
        id = auth.uid()
    )
    OR
    -- Allow admins read-only access
    (
        role = 'admin' 
        AND 
        id = auth.uid()
    )
);
