/*
  # Fix Admin Authentication System
  
  1. Changes
    - Update admin_users table structure to enforce role constraint
    - Drop all existing conflicting RLS policies
    - Create single comprehensive admin_access_policy
    - Enable proper first admin creation and role-based access
  
  2. Security
    - Allows first admin creation when table is empty
    - Gives superadmins full access
    - Gives admins read-only access
    - Enforces proper role checks
*/

-- Update admin_users table structure
-- First, drop the default on role if it exists
ALTER TABLE public.admin_users ALTER COLUMN role DROP DEFAULT;

-- Add check constraint for role
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check 
  CHECK (role IN ('superadmin', 'admin'));

-- Set role back to NOT NULL if needed
ALTER TABLE public.admin_users ALTER COLUMN role SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow superadmins full access" ON public.admin_users;
DROP POLICY IF EXISTS "Allow users to check their own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can read all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can check their own admin status" ON public.admin_users;

-- Create new comprehensive policy
CREATE POLICY "admin_access_policy" ON public.admin_users
  FOR ALL
  TO authenticated
  USING (
    -- Allow first admin creation when table is empty
    (NOT EXISTS (SELECT 1 FROM public.admin_users))
    OR 
    -- Allow superadmins full access
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
    OR
    -- Allow admins to read their own record
    (
      id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
      )
    )
  )
  WITH CHECK (
    -- Allow first admin creation when table is empty
    (NOT EXISTS (SELECT 1 FROM public.admin_users))
    OR 
    -- Allow superadmins to create/update records
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
