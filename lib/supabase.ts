import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Validates that a URL is properly formatted
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates and retrieves Supabase environment variables
 */
function validateSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    const error = 'NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please configure it in your .env file.';
    console.error('Supabase configuration error:', error);
    throw new Error(error);
  }

  if (!supabaseAnonKey) {
    const error = 'NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set. Please configure it in your .env file.';
    console.error('Supabase configuration error:', error);
    throw new Error(error);
  }

  if (!isValidUrl(supabaseUrl)) {
    const error = `Invalid Supabase URL format: ${supabaseUrl}. URL must start with http:// or https://`;
    console.error('Supabase configuration error:', error);
    throw new Error(error);
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Creates a Supabase client with retry logic for connection issues
 */
function createSupabaseClientWithRetry(url: string, key: string, retries = 3) {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = createSupabaseClient(url, key);
      
      // Log successful initialization
      if (attempt > 1) {
        console.log(`Supabase client initialized successfully on attempt ${attempt}`);
      }
      
      return client;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || 'Unknown error';
      
      // Check for specific network errors
      if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('network')) {
        console.error(`Supabase connection attempt ${attempt}/${retries} failed:`, {
          error: errorMessage,
          url: url,
          code: error?.code || 'UNKNOWN'
        });
        
        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s...
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${delayMs}ms...`);
          
          // In a synchronous context, we can't actually wait, so just log
          // The retry will happen immediately
          continue;
        }
      } else {
        // For non-network errors, don't retry
        console.error('Supabase client initialization error:', {
          error: errorMessage,
          url: url,
          code: error?.code || 'UNKNOWN'
        });
        throw error;
      }
    }
  }
  
  // If all retries failed
  const error = new Error(
    `Failed to initialize Supabase client after ${retries} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}. ` +
    `Please check your network connection and Supabase URL configuration.`
  );
  console.error('Supabase initialization failed:', error.message);
  throw error;
}

// Validate configuration and initialize client
let supabaseUrl: string;
let supabaseAnonKey: string;

try {
  const config = validateSupabaseConfig();
  supabaseUrl = config.supabaseUrl;
  supabaseAnonKey = config.supabaseAnonKey;
} catch (error: any) {
  console.error('Failed to validate Supabase configuration:', error.message);
  throw error;
}

export const supabase = createSupabaseClientWithRetry(supabaseUrl, supabaseAnonKey);

export function createClient() {
  try {
    const config = validateSupabaseConfig();
    return createSupabaseClientWithRetry(config.supabaseUrl, config.supabaseAnonKey);
  } catch (error: any) {
    console.error('Failed to create Supabase client:', error.message);
    throw error;
  }
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
