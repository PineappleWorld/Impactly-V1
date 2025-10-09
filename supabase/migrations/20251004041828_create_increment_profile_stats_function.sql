/*
  # Create increment_profile_stats Function
  
  1. New Functions
    - `increment_profile_stats` - Safely increments impact tickets and total impact for a user profile
  
  2. Purpose
    - Used by Stripe webhook to update user stats after successful payment
    - Atomically increments both impact_tickets and total_impact columns
  
  3. Parameters
    - p_user_id: UUID of the user to update
    - p_tickets: Number of impact tickets to add
    - p_impact: Amount of impact value to add
*/

CREATE OR REPLACE FUNCTION increment_profile_stats(
  p_user_id uuid,
  p_tickets integer,
  p_impact numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    impact_tickets = COALESCE(impact_tickets, 0) + p_tickets,
    total_impact = COALESCE(total_impact, 0) + p_impact,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;
