// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uarppwphjcqkfdiaepum.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcnBwd3BoamNxa2ZkaWFlcHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNzMwMjUsImV4cCI6MjA1NDg0OTAyNX0.CyYbt1E8pe2M9McDhs7fa1M9ZEj3QEIFpvtDgNcEVrk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);