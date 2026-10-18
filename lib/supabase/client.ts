import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validates whether genuine Supabase credentials are provided
export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your_public_anon_key');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseAdmin =
  isSupabaseConfigured && supabaseServiceKey && !supabaseServiceKey.includes('your_service_role_key')
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : supabase;
