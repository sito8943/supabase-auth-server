import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

const authOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
};

export const supabasePublicClient = createClient(env.supabaseUrl, env.supabaseAnonKey, authOptions);

export const supabaseAdminClient = env.supabaseServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, authOptions)
  : null;
