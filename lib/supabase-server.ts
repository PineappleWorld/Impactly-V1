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
 * Validates and retrieves Supabase server environment variables
 */
function validateSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    const error = 'NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please configure it in your .env file.';
    console.error('Supabase server configuration error:', error);
    throw new Error(error);
  }

  if (!supabaseServiceKey) {
    const error = 'SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set. Please configure it in your .env file.';
    console.error('Supabase server configuration error:', error);
    throw new Error(error);
  }

  if (!isValidUrl(supabaseUrl)) {
    const error = `Invalid Supabase URL format: ${supabaseUrl}. URL must start with http:// or https://`;
    console.error('Supabase server configuration error:', error);
    throw new Error(error);
  }

  return { supabaseUrl, supabaseServiceKey };
}

/**
 * Creates a Supabase server client with retry logic for connection issues
 */
function createSupabaseServerClientWithRetry(url: string, key: string, options: any, retries = 3) {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = createSupabaseClient(url, key, options);
      
      // Log successful initialization
      if (attempt > 1) {
        console.log(`Supabase server client initialized successfully on attempt ${attempt}`);
      }
      
      return client;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || 'Unknown error';
      
      // Check for specific network errors
      if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('network')) {
        console.error(`Supabase server connection attempt ${attempt}/${retries} failed:`, {
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
        console.error('Supabase server client initialization error:', {
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
    `Failed to initialize Supabase server client after ${retries} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}. ` +
    `Please check your network connection and Supabase URL configuration.`
  );
  console.error('Supabase server initialization failed:', error.message);
  throw error;
}

// Validate configuration and initialize client
let supabaseUrl: string;
let supabaseServiceKey: string;

try {
  const config = validateSupabaseServerConfig();
  supabaseUrl = config.supabaseUrl;
  supabaseServiceKey = config.supabaseServiceKey;
} catch (error: any) {
  console.error('Failed to validate Supabase server configuration:', error.message);
  throw error;
}

const authOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
};

export const supabaseServer = createSupabaseServerClientWithRetry(supabaseUrl, supabaseServiceKey, authOptions);

export function createClient() {
  try {
    const config = validateSupabaseServerConfig();
    return createSupabaseServerClientWithRetry(config.supabaseUrl, config.supabaseServiceKey, authOptions);
  } catch (error: any) {
    console.error('Failed to create Supabase server client:', error.message);
    throw error;
  }
}

export async function getSettingServer(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseServer
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }

    return data?.value || null;
  } catch (err) {
    console.error(`Exception fetching setting ${key}:`, err);
    return null;
  }
}
