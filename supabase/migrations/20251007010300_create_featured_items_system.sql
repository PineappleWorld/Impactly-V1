/*
  # Featured Items System

  1. New Tables
    - `featured_products`
      - `id` (uuid, primary key)
      - `product_id` (integer) - Reloadly product ID
      - `display_order` (integer) - Order in which to display
      - `is_active` (boolean) - Whether this feature is active
      - `created_at` (timestamptz)
      - `created_by` (uuid) - Admin who created it

    - `featured_nonprofits`
      - `id` (uuid, primary key)
      - `nonprofit_slug` (text) - Every.org nonprofit slug
      - `display_order` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `created_by` (uuid)

  2. Security
    - Enable RLS on both tables
    - Public can read active featured items
    - Only admins can modify featured items

  3. Indexes
    - Index on is_active and display_order for efficient queries
*/

CREATE TABLE IF NOT EXISTS featured_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS featured_nonprofits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonprofit_slug text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_featured_products_active_order
  ON featured_products(is_active, display_order)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_featured_nonprofits_active_order
  ON featured_nonprofits(is_active, display_order)
  WHERE is_active = true;

ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_nonprofits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured products"
  ON featured_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active featured nonprofits"
  ON featured_nonprofits FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all featured products"
  ON featured_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can view all featured nonprofits"
  ON featured_nonprofits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can insert featured products"
  ON featured_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can insert featured nonprofits"
  ON featured_nonprofits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update featured products"
  ON featured_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update featured nonprofits"
  ON featured_nonprofits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can delete featured products"
  ON featured_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can delete featured nonprofits"
  ON featured_nonprofits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );
