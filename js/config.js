/**
 * ClassWave — Global Configuration
 */
const SUPABASE_URL = 'https://oxrypntbjpjlanbdvbpm.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cnlwbnRianBqbGFuYmR2YnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTgwNTYsImV4cCI6MjA5MzE5NDA1Nn0._H9adRTZpB4n6TfUzfqzMF03_YIMU4EKgM8I-orPZBk';

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};
