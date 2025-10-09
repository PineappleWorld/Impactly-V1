/*
  # Allow API routes to read app settings
  
  1. Changes
    - Add policy to allow anon to read settings for API routes
  
  2. Security
    - Allows reading API credentials needed for external integrations
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "API can read non-secret settings" ON app_settings;
DROP POLICY IF EXISTS "API can read settings for external integrations" ON app_settings;

-- Allow API to read settings needed for external integrations
CREATE POLICY "API can read settings for external integrations"
  ON app_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'reloadly_client_id', 
      'reloadly_client_secret',
      'stripe_publishable_key',
      'stripe_secret_key',
      'stripe_webhook_secret',
      'markup_percentage',
      'profit_split_company',
      'profit_split_charity',
      'impact_tickets_multiplier'
    )
  );
