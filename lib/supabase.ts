import { createClient } from '@supabase/supabase-js';

// These pull your secure keys from the .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This creates the bridge we will use to fetch data
export const supabase = createClient(supabaseUrl, supabaseAnonKey);