import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xmsfwmuqgzigkisjzhaw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_3NF_4XeMFsW_200A6Aaiww_Ku6fYOxO';

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing in browser:', { supabaseUrl, supabaseKey });
  }
  return createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
};
