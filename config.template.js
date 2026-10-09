// HandyMan Cameroon - TEMPLATE - Copy to config.js and fill keys
const SUPABASE_CONFIG = {
  url: "https://evfaxaosquecbwefbfac.supabase.co",
  anonKey: "PUT_YOUR_PUBLISHABLE_KEY_HERE"
};

if (typeof window !== 'undefined') {
  window.SUPABASE_URL = SUPABASE_CONFIG.url;
  window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;
  window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_CONFIG.anonKey;
}
