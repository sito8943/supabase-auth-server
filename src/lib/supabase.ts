import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

const authOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
};

export const supabasePublicClient = createClient(env.supabaseUrl, env.supabasePublishableKey, authOptions);

export const supabaseAdminClient = env.supabaseSecretKey
  ? createClient(env.supabaseUrl, env.supabaseSecretKey, authOptions)
  : null;
