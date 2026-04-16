import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mihqafnkzjoiziwegmih.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paHFhZm5rempvaXppd2VnbWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzQ3MzUsImV4cCI6MjA5MTc1MDczNX0.a6Wfi9htWgE7g2-1p7R5HznPSryfFVV5XTt0bAxD8Gg";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration. Build/Runtime will likely fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'apikey': supabaseAnonKey
    }
  }
});
