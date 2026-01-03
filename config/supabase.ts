import { createClient } from '@supabase/supabase-js';

// Define your Supabase URL and API key
const supabaseUrl = "https://rnvngxfpbxvnajownetj.supabase.co";
const supabaseKey = "sb_secret_XYHq-ulXe7NL6pj5toauFw_460v3G0J"; // API key

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);