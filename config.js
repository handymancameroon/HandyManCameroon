// HandyMan Cameroon - site configuration
// Only the PUBLIC (publishable) key belongs in this file. Never put a secret key here.

window.HANDYMAN_CONFIG = {
  SUPABASE_URL: "https://evfaxaosquecbwefbfac.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_0pKmTuoHdJQkduxQgu-nGg_Jw7uoAnC",
  ADMIN_EMAIL: "internationalpimerchant@gmail.com"
};

// Kept so any older page code that reads these still works
window.SUPABASE_URL = window.HANDYMAN_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = window.HANDYMAN_CONFIG.SUPABASE_ANON_KEY;
window.SUPABASE_PUBLISHABLE_KEY = window.HANDYMAN_CONFIG.SUPABASE_ANON_KEY;
