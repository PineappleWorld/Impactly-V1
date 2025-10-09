/*
  # Create Nonprofits Cache System

  ## Overview
  This migration creates a caching system for nonprofits from Every.org API to improve performance
  by storing data locally instead of making expensive API calls on every page load.

  ## New Tables
    - `nonprofits_cache`
      - `id` (uuid, primary key) - Unique identifier
      - `nonprofit_slug` (text, unique) - Every.org nonprofit slug
      - `name` (text) - Organization name
      - `description` (text) - Organization description
      - `logo_url` (text) - Logo image URL
      - `cover_image_url` (text) - Cover image URL
      - `website_url` (text) - Organization website
      - `ein` (text) - Tax ID number
      - `primary_slug` (text) - Primary slug
      - `location_address` (text) - Physical address
      - `category` (text) - Category/cause (animals, arts, education, etc.)
      - `created_at` (timestamptz) - When record was created
      - `updated_at` (timestamptz) - When record was last updated
      - `data_source` (text) - Source of data (everyorg)

    - `sync_status`
      - `id` (uuid, primary key) - Unique identifier
      - `sync_type` (text) - Type of sync (nonprofits_full, nonprofits_category)
      - `category` (text) - Category being synced (nullable)
      - `status` (text) - Status (in_progress, completed, failed)
      - `total_records` (integer) - Total records synced
      - `started_at` (timestamptz) - When sync started
      - `completed_at` (timestamptz) - When sync completed
      - `error_message` (text) - Error if sync failed

  ## Security
    - Enable RLS on both tables
    - Public read access (anyone can view nonprofits)
    - Admin-only write access for syncing data

  ## Indexes
    - Index on category for fast filtering
    - Index on nonprofit_slug for lookups
    - Index on name for search functionality
*/

-- Create nonprofits_cache table
CREATE TABLE IF NOT EXISTS nonprofits_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonprofit_slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  cover_image_url text DEFAULT '',
  website_url text DEFAULT '',
  ein text DEFAULT '',
  primary_slug text DEFAULT '',
  location_address text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  data_source text DEFAULT 'everyorg'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nonprofits_cache_category ON nonprofits_cache(category);
CREATE INDEX IF NOT EXISTS idx_nonprofits_cache_slug ON nonprofits_cache(nonprofit_slug);
CREATE INDEX IF NOT EXISTS idx_nonprofits_cache_name ON nonprofits_cache(name);

-- Create sync_status table
CREATE TABLE IF NOT EXISTS sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL,
  category text,
  status text DEFAULT 'in_progress',
  total_records integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

-- Create index for sync status queries
CREATE INDEX IF NOT EXISTS idx_sync_status_type ON sync_status(sync_type, started_at DESC);

-- Enable RLS
ALTER TABLE nonprofits_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- Public read access for nonprofits
CREATE POLICY "Anyone can read nonprofits"
  ON nonprofits_cache FOR SELECT
  USING (true);

-- Admin write access for nonprofits
CREATE POLICY "Admins can insert nonprofits"
  ON nonprofits_cache FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update nonprofits"
  ON nonprofits_cache FOR UPDATE
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

CREATE POLICY "Admins can delete nonprofits"
  ON nonprofits_cache FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Public read access for sync status
CREATE POLICY "Anyone can read sync status"
  ON sync_status FOR SELECT
  USING (true);

-- Admin write access for sync status
CREATE POLICY "Admins can manage sync status"
  ON sync_status FOR ALL
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
