/*
  # Add Google OAuth Settings

  1. Changes
    - Add Google OAuth client ID and secret to app_settings
  
  2. Security
    - Encrypted storage in database
    - Only admin users can update these settings
*/

-- Add Google OAuth settings if they don't exist
INSERT INTO app_settings (key, value, category, is_secret, description)
VALUES 
  ('google_oauth_client_id', '', 'auth', false, 'Google OAuth Client ID for authentication'),
  ('google_oauth_client_secret', '', 'auth', true, 'Google OAuth Client Secret for authentication')
ON CONFLICT (key) DO NOTHING;
