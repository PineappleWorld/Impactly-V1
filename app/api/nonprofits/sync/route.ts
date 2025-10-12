import { createClient } from '@supabase/supabase-js';

// Wrap environment variables and createClient in try-catch for error handling
try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
} catch (error) {
    console.error('Error creating Supabase client:', error);
    // Handle the error accordingly
}