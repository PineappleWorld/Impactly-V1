/*
  # Fix Admin Users RLS for Login
  
  1. Changes
    - Add policy to allow authenticated users to check if their own ID exists in admin_users
    - This enables the login flow to verify admin status without causing a circular dependency
  
  2. Security
    - Users can ONLY read their own admin record (WHERE id = auth.uid())
    - Cannot read other admin users during login
*/

CREATE POLICY "Users can check their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
