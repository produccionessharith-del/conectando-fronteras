-- Actualiza el logo y el WhatsApp de Grupo Empresarial Conectando Fronteras.
-- Ejecutar este archivo en Supabase > SQL Editor.
insert into public.site_settings (key, value, updated_at) values
  ('logo_url', 'https://cdn.phototourl.com/member/2026-11-26-264324ed-f326-40f1-a9c6-d9e2984dd936.png', now()),
  ('whatsapp', '573172437825', now())
on conflict (key) do update set value = excluded.value, updated_at = now();
