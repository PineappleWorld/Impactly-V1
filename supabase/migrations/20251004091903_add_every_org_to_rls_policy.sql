/*
  # Add Every.org API key to RLS policy

  1. Changes
    - Update RLS policy to allow API routes to read every_org_api_key setting
    - This allows the Every.org service to retrieve its API key from settings

  2. Security
    - Only adds read access for the specific every_org_api_key setting
    - Maintains existing security model - anon/authenticated can only read specific allowed keys
*/

-- Drop and recreate the policy with every_org_api_key included
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
      'markup_percentage',
      'profit_split_company',
      'profit_split_charity',
      'impact_tickets_multiplier'
    )
  );
