import { createClient } from '@supabase/supabase-js';

// La clave sb_publishable es una clave pública apta para el navegador.
// También se dejan como respaldo los datos entregados para que el sitio
// pueda conectarse aunque Vercel todavía no tenga las variables configuradas.
const url =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ivrvgsjyisieipvdvptk.supabase.co';

const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_RpSPhHrftPS2JyuaXzhbcQ_qJE1PtIb';

export const isSupabaseConfigured = Boolean(url && anonKey);
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
