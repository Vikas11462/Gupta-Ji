
import { supabase } from '@/lib/supabase';

async function checkSchema() {
    console.log("Checking 'categories' table...");
    const { data: categories, error: catError } = await supabase.from('categories').select('*').limit(1);

    if (catError) {
        console.log("Categories table likely does not exist or error:", catError.message);
    } else {
        console.log("Categories table exists. Sample:", categories);
    }

    console.log("Checking 'products' table...");
    const { data: products, error: prodError } = await supabase.from('products').select('*').limit(1);

    if (prodError) {
        console.log("Products table error:", prodError.message);
    } else {
        console.log("Products table exists. Sample:", products);
    }
}

checkSchema();
