// HandyMan Cameroon V2 - Supabase Client - Works with sb_publishable_ keys
// Babbel Model - Single source of truth

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const url = window.SUPABASE_URL || "https://evfaxaosquecbwefbfac.supabase.co";
  const key = window.SUPABASE_ANON_KEY || window.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_0pKmTuoHdJQkduxQgu-nGg_Jw7uoAnC";
  
  if (!window.supabase) {
    console.error("Supabase JS not loaded. Add <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> before this file");
    return null;
  }
  
  supabaseClient = window.supabase.createClient(url, key);
  return supabaseClient;
}

// Visitor tracking - Fix visitors=0 bug
async function trackVisit(page = "home") {
  try {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from('visitors').insert({
      page: page,
      user_agent: navigator.userAgent
    });
  } catch (e) {
    console.log("Visit track skipped", e.message);
  }
}

// Auto-track home page
document.addEventListener('DOMContentLoaded', () => {
  trackVisit(window.location.pathname);
});
