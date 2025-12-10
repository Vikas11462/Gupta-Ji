
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking 'categories' table...");
    // Try to select one category
    const { data, error } = await supabase.from('categories').select('*').limit(1);

    if (error) {
        console.error("Error accessing categories table:", error.message);
        console.error("Error details:", error);
    } else {
        console.log("Success! Categories table exists.");
        console.log("Data sample:", data);
    }
}

checkSchema();
