import { createClient } from '@supabase/supabase-js';

// Project Reference: qbaacaceenwoznmuravq
export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.SUPABASE_URL) ||
  'https://qbaacaceenwoznmuravq.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.SUPABASE_ANON_KEY) ||
  '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'public-anon-key-placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
