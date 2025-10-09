/*
  # Impactly Database Schema

  ## Overview
  This migration creates the core database structure for Impactly, a gift card marketplace
  that tracks purchases, calculates profit splits (company vs. charity), and manages
  impact tickets for charitable donations.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email address
  - `full_name` (text) - User's full name
  - `impact_tickets` (integer) - Accumulated impact tickets from purchases
  - `total_impact` (numeric) - Total dollar amount contributed to charity
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. charities
  - `id` (uuid, PK) - Unique charity identifier
  - `name` (text) - Charity name
  - `description` (text) - Charity description
  - `category` (text) - Charity category (e.g., education, health, environment)
  - `every_org_id` (text) - Every.org API identifier
  - `logo_url` (text) - URL to charity logo
  - `is_active` (boolean) - Whether charity is active for donations
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. transactions
  - `id` (uuid, PK) - Unique transaction identifier
  - `user_id` (uuid, FK to profiles) - User who made the purchase
  - `stripe_payment_id` (text) - Stripe payment intent ID
  - `reloadly_order_id` (text) - Reloadly order identifier
  - `product_name` (text) - Name of gift card product
  - `product_amount` (numeric) - Face value of gift card
  - `purchase_price` (numeric) - Amount user paid
  - `cost_price` (numeric) - Cost from Reloadly
  - `profit_amount` (numeric) - Total profit (purchase_price - cost_price)
  - `company_share` (numeric) - Company's portion of profit
  - `charity_share` (numeric) - Charity's portion of profit
  - `impact_tickets_earned` (integer) - Impact tickets awarded for this transaction
  - `status` (text) - Transaction status (pending, completed, failed, refunded)
  - `created_at` (timestamptz) - Transaction timestamp

  ### 4. donations
  - `id` (uuid, PK) - Unique donation identifier
  - `user_id` (uuid, FK to profiles) - User making the donation
  - `charity_id` (uuid, FK to charities) - Charity receiving donation
  - `amount` (numeric) - Donation amount in USD
  - `impact_tickets_used` (integer) - Number of impact tickets spent
  - `every_org_donation_id` (text) - Every.org API donation ID
  - `status` (text) - Donation status (pending, completed, failed)
  - `created_at` (timestamptz) - Donation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile data
  - Users can read active charities
  - Users can read their own transactions and donations
  - Only authenticated users can create transactions
  - Admin functions will be handled via Edge Functions with service role key
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  impact_tickets integer DEFAULT 0,
  total_impact numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create charities table
CREATE TABLE IF NOT EXISTS charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  every_org_id text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_id text,
  reloadly_order_id text,
  product_name text NOT NULL,
  product_amount numeric(10,2) NOT NULL,
  purchase_price numeric(10,2) NOT NULL,
  cost_price numeric(10,2) NOT NULL,
  profit_amount numeric(10,2) NOT NULL,
  company_share numeric(10,2) NOT NULL,
  charity_share numeric(10,2) NOT NULL,
  impact_tickets_earned integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id uuid REFERENCES charities(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  impact_tickets_used integer DEFAULT 0,
  every_org_donation_id text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Charities policies (public read for active charities)
CREATE POLICY "Anyone can view active charities"
  ON charities FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Donations policies
CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_charity_id ON donations(charity_id);

-- Insert some initial charities (examples)
INSERT INTO charities (name, description, category, logo_url, is_active)
VALUES 
  ('Education for All', 'Providing quality education to underserved communities worldwide', 'Education', 'https://images.pexels.com/photos/4145356/pexels-photo-4145356.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Clean Water Initiative', 'Bringing clean water access to communities in need', 'Water & Sanitation', 'https://images.pexels.com/photos/2990650/pexels-photo-2990650.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Global Health Fund', 'Supporting healthcare access and disease prevention', 'Health', 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Rainforest Conservation', 'Protecting endangered ecosystems and wildlife', 'Environment', 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=400', true)
ON CONFLICT DO NOTHING;