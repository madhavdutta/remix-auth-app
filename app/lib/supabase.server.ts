import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';

const supabaseUrl = 'https://fitqdmfnubqcdwwedxum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdHFkbWZudWJxY2R3d2VkeHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNDY0MjksImV4cCI6MjA2NjgyMjQyOX0.x8XIC2njToj7eMqjzfp6UwvGRJP3YlN73nkVXJC_WDU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
