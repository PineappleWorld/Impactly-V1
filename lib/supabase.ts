import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  impact_tickets: number;
  total_impact: number;
  created_at: string;
  updated_at: string;
};

export type Charity = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  every_org_id: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  stripe_payment_id: string | null;
  reloadly_order_id: string | null;
  product_name: string;
  product_amount: number;
  purchase_price: number;
  cost_price: number;
  profit_amount: number;
  company_share: number;
  charity_share: number;
  impact_tickets_earned: number;
  status: string;
  created_at: string;
};

export type Donation = {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  impact_tickets_used: number;
  every_org_donation_id: string | null;
  status: string;
  created_at: string;
};
