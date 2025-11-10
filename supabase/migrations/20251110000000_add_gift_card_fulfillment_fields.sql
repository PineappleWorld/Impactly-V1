/*
  # Add Gift Card Fulfillment Fields

  ## Changes
  - Add gift card code field to transactions table
  - Add user email field for gift card delivery
  - Add fulfillment status tracking
*/

-- Add gift card fulfillment fields to transactions table
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS gift_card_code text,
  ADD COLUMN IF NOT EXISTS recipient_email text,
  ADD COLUMN IF NOT EXISTS fulfillment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz;

-- Add index for fulfillment status
CREATE INDEX IF NOT EXISTS idx_transactions_fulfillment_status ON transactions(fulfillment_status);

-- Add similar fields to user_purchases for consistency
ALTER TABLE user_purchases
  ADD COLUMN IF NOT EXISTS gift_card_code text,
  ADD COLUMN IF NOT EXISTS recipient_email text;
