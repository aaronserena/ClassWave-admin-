/**
 * ClassWave — Global Configuration (NEW DATABASE)
 */
const SUPABASE_URL = 'https://hukiftsvugmokstsavoz.supabase.co/rest/v1';

// Using the NEW Service Role Key to bypass RLS blocks
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2lmdHN2dWdtb2tzdHNhdm96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcxNzEwNiwiZXhwIjoyMDkzMjkzMTA2fQ.wfLKy7zAF4B1obUi_fWhNUVfV07woAKkBDaMV59rW7c';

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};
