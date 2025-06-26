
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ftgxvpzvbhwamwomhjlh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Z3h2cHp2Ymh3YW13b21oamxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzYyNjIsImV4cCI6MjA2NjUxMjI2Mn0.f55WJYcITpnaxdtCxn9yG6s5tsUcusMY0xRU_2nZsD8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
