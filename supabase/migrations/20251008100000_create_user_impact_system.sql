/*
  # Create User Impact System

  ## Overview
  This migration creates the complete user impact tracking system including:
  - User charity preferences
  - Purchase tracking
  - Profit splits to charity treasury
  - PACT credits (Impact Credits) wallet system
  - Social media links configuration

  ## New Tables

  ### social_media_links
  - Admin-configurable social media links
  - Displayed in header and footer

  ### user_charity_preferences
  - Stores which charities users want to support
  - Priority order for profit distribution

  ### user_purchases
  - Tracks all gift card purchases
  - Records purchase amount and profit generated

  ### charity_treasury
  - Tracks profit splits to each charity
  - Running totals per charity

  ### user_pact_credits
  - PACT credits wallet (100 PACT = $1)
  - Earned from purchases

  ## Security
  - Enable RLS on all tables
  - Users can only view/edit their own data
  - Admins can view all data
*/

-- Social media links for header/footer
CREATE TABLE IF NOT EXISTS social_media_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User charity preferences
CREATE TABLE IF NOT EXISTS user_charity_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nonprofit_slug text NOT NULL,
  priority_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nonprofit_slug)
);

-- User purchases tracking
CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  purchase_amount numeric(10,2) NOT NULL DEFAULT 0,
  profit_amount numeric(10,2) NOT NULL DEFAULT 0,
  charity_split_amount numeric(10,2) NOT NULL DEFAULT 0,
  pact_credits_earned integer NOT NULL DEFAULT 0,
  purchase_date timestamptz DEFAULT now(),
  split_processed boolean DEFAULT false,
  processed_at timestamptz
);

-- Charity treasury (profit splits)
CREATE TABLE IF NOT EXISTS charity_treasury (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  purchase_id uuid,
  nonprofit_slug text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- PACT credits wallet
CREATE TABLE IF NOT EXISTS user_pact_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  balance integer DEFAULT 0,
  lifetime_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_charity_prefs_user ON user_charity_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_date ON user_purchases(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_charity_treasury_user ON charity_treasury(user_id);
CREATE INDEX IF NOT EXISTS idx_charity_treasury_nonprofit ON charity_treasury(nonprofit_slug);
CREATE INDEX IF NOT EXISTS idx_user_pact_credits_user ON user_pact_credits(user_id);

-- Enable RLS
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charity_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pact_credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read social links" ON social_media_links;
DROP POLICY IF EXISTS "Admins can manage social links" ON social_media_links;
DROP POLICY IF EXISTS "Users can read own charity preferences" ON user_charity_preferences;
DROP POLICY IF EXISTS "Users can manage own charity preferences" ON user_charity_preferences;
DROP POLICY IF EXISTS "Admins can read all charity preferences" ON user_charity_preferences;
DROP POLICY IF EXISTS "Users can read own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Admins can manage all purchases" ON user_purchases;
DROP POLICY IF EXISTS "Users can read own charity contributions" ON charity_treasury;
DROP POLICY IF EXISTS "Admins can manage charity treasury" ON charity_treasury;
DROP POLICY IF EXISTS "Users can read own PACT credits" ON user_pact_credits;
DROP POLICY IF EXISTS "Users can update own PACT credits" ON user_pact_credits;
DROP POLICY IF EXISTS "Admins can manage all PACT credits" ON user_pact_credits;

-- RLS Policies: Social media links (public read, admin write)
CREATE POLICY "Anyone can read social links"
  ON social_media_links FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage social links"
  ON social_media_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies: User charity preferences
CREATE POLICY "Users can read own charity preferences"
  ON user_charity_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own charity preferences"
  ON user_charity_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all charity preferences"
  ON user_charity_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies: User purchases
CREATE POLICY "Users can read own purchases"
  ON user_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all purchases"
  ON user_purchases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies: Charity treasury
CREATE POLICY "Users can read own charity contributions"
  ON charity_treasury FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage charity treasury"
  ON charity_treasury FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies: PACT credits
CREATE POLICY "Users can read own PACT credits"
  ON user_pact_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own PACT credits"
  ON user_pact_credits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all PACT credits"
  ON user_pact_credits FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Insert default social media links
INSERT INTO social_media_links (platform, url, display_order, is_active)
VALUES
  ('Telegram', 'https://t.me/impactly', 1, true),
  ('X', 'https://x.com/impactly', 2, true),
ON CONFLICT DO NOTHING;

-- Update admin settings to include profit split percentage
INSERT INTO app_settings (key, value, description)
VALUES ('profit_split_percentage', '50', 'Percentage of profit that goes to charity (0-100)')
ON CONFLICT (key) DO NOTHING;
