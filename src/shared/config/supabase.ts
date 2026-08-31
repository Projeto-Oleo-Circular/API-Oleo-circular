import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseServiceRoleKey = 
  process.env.SUPABASE_SERVICE_ROLE || 
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('ERRO CRÍTICO SUPABASE: URL ou ANON_KEY não foram carregadas!');
}

if (!supabaseServiceRoleKey) {
  throw new Error('ERRO CRÍTICO: A variável SUPABASE_SERVICE_ROLE não foi encontrada no arquivo .env!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
    },
  }
);