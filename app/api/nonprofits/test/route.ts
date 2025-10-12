import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function someFunction() {
    try {
        const results = await someAsyncOperation();
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        // Use supabase here with results
    } catch (error) {
        console.error('Error:', error);
    }
}