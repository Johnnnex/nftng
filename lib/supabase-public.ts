// Client-side only — uses ANON key. Never put service role here.
// Requires NEXT_PUBLIC_SUPABASE_URL to be set in .env (alongside SUPABASE_URL).
import { createClient } from "@supabase/supabase-js";

export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
);
