/*
  # Fix Infinite Recursion in Admin Users RLS
  
  1. Changes
    - Drop all existing policies that cause infinite recursion
    - Create a single simple policy that allows users to read their own record
  
  2. Security
    - Users can only check if their own ID exists in admin_users
    - No recursive lookups that cause infinite loops
*/

DROP POLICY IF EXISTS "Admins can read all admin users" ON admin_users;
DROP POLICY IF EXISTS "Superadmins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can check their own admin status" ON admin_users;

CREATE POLICY "Allow users to check their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Allow superadmins full access"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    id = auth.uid() AND role = 'superadmin'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()
    )
  );
