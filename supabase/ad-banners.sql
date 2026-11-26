-- Módulo de banners publicitarios para el panel administrativo.
-- Ejecutar en Supabase > SQL Editor después de admin-panel.sql y cms.sql.

create table if not exists public.ad_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  start_date date,
  end_date date,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ad_banners_valid_dates check (start_date is null or end_date is null or end_date >= start_date)
);

alter table public.ad_banners enable row level security;
drop policy if exists "Public can read active banners" on public.ad_banners;
create policy "Public can read active banners" on public.ad_banners
  for select to anon, authenticated using (active = true);
drop policy if exists "Admins manage banners" on public.ad_banners;
create policy "Admins manage banners" on public.ad_banners
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.ad_banners to anon, authenticated;
grant insert, update, delete on public.ad_banners to authenticated;

-- Almacenamiento público de imágenes publicitarias.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-banners', 'public-banners', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public can view banner images" on storage.objects;
create policy "Public can view banner images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'public-banners');
drop policy if exists "Admins upload banner images" on storage.objects;
create policy "Admins upload banner images" on storage.objects
  for insert to authenticated with check (bucket_id = 'public-banners' and public.is_admin());
drop policy if exists "Admins update banner images" on storage.objects;
create policy "Admins update banner images" on storage.objects
  for update to authenticated using (bucket_id = 'public-banners' and public.is_admin())
  with check (bucket_id = 'public-banners' and public.is_admin());
drop policy if exists "Admins delete banner images" on storage.objects;
create policy "Admins delete banner images" on storage.objects
  for delete to authenticated using (bucket_id = 'public-banners' and public.is_admin());
