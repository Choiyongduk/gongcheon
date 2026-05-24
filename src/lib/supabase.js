import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anon);

// When env vars are missing the app falls back to bundled demo data,
// so it still runs locally before you connect a real Supabase project.
export const supabase = hasSupabase ? createClient(url, anon) : null;
