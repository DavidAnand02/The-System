import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL');
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY');
  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Auth features will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const setSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('VITE_SUPABASE_URL', url);
  localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
  window.location.reload();
};
