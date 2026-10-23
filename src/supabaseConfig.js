const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
};

export const supabaseConfigured = [
  supabaseConfig.url,
  supabaseConfig.publishableKey,
].every((value) => typeof value === "string" && value.length > 0);

export default supabaseConfig;
