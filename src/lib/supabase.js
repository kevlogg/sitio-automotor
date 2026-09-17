import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oetagnusdhbqrznugwuo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_5M-Ivho089HyL1LF-5V3oA_hpv6d54V';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
