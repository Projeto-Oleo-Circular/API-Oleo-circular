import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO SUPABASE: Variáveis de ambiente não foram carregadas!');
  console.error(`SUPABASE_URL: ${supabaseUrl ? 'OK' : 'AUSENTE'}`);
  console.error(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'OK' : 'AUSENTE'}`);
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);

export const supabaseAdmin = createClient(
  supabaseUrl || '', 
  supabaseServiceRoleKey || supabaseAnonKey || ''
);