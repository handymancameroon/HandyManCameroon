// HandyMan Cameroon V2 - REAL CONFIG - DO NOT COMMIT TO GITHUB PUBLICLY
// This file is gitignored, only for live site
const SUPABASE_CONFIG = {
  url: "https://evfaxaosquecbwefbfac.supabase.co",
  anonKey: "sb_publishable_0pKmTuoHdJQkduxQgu-nGg_Jw7uoAnC"
};

if (typeof window !== 'undefined') {
  window.SUPABASE_URL = SUPABASE_CONFIG.url;
  window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;
  window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_CONFIG.anonKey;
}
