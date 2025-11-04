import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "../../env";

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = (): SupabaseClient => {
  supabaseInstance ??= createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return supabaseInstance;
};
