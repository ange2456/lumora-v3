import { createClient } from "@supabase/supabase-js";
import supabaseConfig, { supabaseConfigured } from "./supabaseConfig";

export const supabase = supabaseConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey)
  : null;
