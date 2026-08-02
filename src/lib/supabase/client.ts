"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseConfig } from "./config";

/** Supabase client for use in Client Components. */
export function createClient() {
  assertSupabaseConfig();
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
