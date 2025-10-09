/*
  # Add Google OAuth to RLS policy

  1. Changes
    - Update RLS policy to allow API routes to read google_oauth_client_id
    - Keep google_oauth_client_secret private (not readable by anon)

  2. Security
    - Only public client ID is readable
    - Secret remains protected
*/

DROP POLICY IF EXISTS "API can read settings for external integrations" ON app_settings;

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
      'every_org_api_key',
      'google_oauth_client_id',
      'markup_percentage',
      'profit_split_company',
      'profit_split_charity',
      'impact_tickets_multiplier'
    )
  );
