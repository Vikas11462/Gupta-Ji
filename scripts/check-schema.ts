import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking orders table schema...');
    // We can't easily query schema with supabase-js directly without admin rights or specific functions,
    // but we can try to insert a dummy row with these fields and see if it errors, 
    // OR just try to select them (which might not fail if they don't exist, just return null? No, select * works).
    // Better: Try to insert a row that will definitely fail constraint (like invalid user_id) but see if it complains about column names first.
    // Actually, let's just try to select one row and look at the keys.

    const { data, error } = await supabase.from('orders').select('*').limit(1);

    if (error) {
        console.error('Error selecting from orders:', error.message);
    } else if (data && data.length > 0) {
        console.log('Existing columns:', Object.keys(data[0]));
    } else {
        console.log('No orders found to check columns. Table might be empty.');
    }
}

checkSchema();
