/*
  # Admin Settings and Configuration

  ## Overview
  This migration creates tables for storing admin credentials and API keys securely.
  Admin users can log in and manage API credentials for Reloadly, Stripe, and Every.org
  through a settings interface.

  ## New Tables

  ### 1. admin_users
  - `id` (uuid, FK to auth.users) - Admin user identifier
  - `email` (text) - Admin email address
  - `role` (text) - Admin role (superadmin, admin)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. app_settings
  - `id` (uuid, PK) - Setting identifier
  - `key` (text) - Setting key (e.g., 'reloadly_client_id')
  - `value` (text) - Setting value (encrypted for sensitive data)
  - `category` (text) - Setting category (api_keys, payment, donation, general)
  - `is_secret` (boolean) - Whether this is a sensitive value
  - `description` (text) - Human-readable description
  - `updated_by` (uuid, FK to admin_users) - Who last updated this setting
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Only admin users can read/write settings
  - Regular users cannot access these tables
  - Audit trail for who updates what settings

  ## Notes
  - API keys are stored in the database for flexibility
  - Admin interface will allow updating these without code changes
  - Initial setup requires creating the first admin user manually
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  category text NOT NULL,
  is_secret boolean DEFAULT false,
  description text,
  updated_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admins can read all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Superadmins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'superadmin'
    )
  );

-- App settings policies
CREATE POLICY "Admins can read settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);

-- Insert default settings structure
INSERT INTO app_settings (key, value, category, is_secret, description)
VALUES 
  ('reloadly_client_id', '', 'api_keys', true, 'Reloadly API Client ID for gift card marketplace'),
  ('reloadly_client_secret', '', 'api_keys', true, 'Reloadly API Client Secret for authentication'),
  ('stripe_publishable_key', '', 'payment', false, 'Stripe Publishable Key for client-side payments'),
  ('stripe_secret_key', '', 'payment', true, 'Stripe Secret Key for server-side operations'),
  ('stripe_webhook_secret', '', 'payment', true, 'Stripe Webhook Secret for event verification'),
  ('every_org_api_key', '', 'donation', true, 'Every.org API Key for charitable donations'),
  ('profit_split_company', '50', 'general', false, 'Company share of profit (percentage)'),
  ('profit_split_charity', '50', 'general', false, 'Charity share of profit (percentage)'),
  ('markup_percentage', '5', 'general', false, 'Markup percentage on gift card cost price'),
  ('impact_tickets_multiplier', '10', 'general', false, 'Multiplier for converting charity share to impact tickets')
ON CONFLICT (key) DO NOTHING;