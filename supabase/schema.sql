-- Ejecuta este archivo en Supabase > SQL Editor.
-- Las políticas permiten lectura pública de planes activos y envío público de solicitudes.
-- La administración de planes y leads queda reservada a usuarios autenticados.

create extension if not exists pgcrypto;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Internet',
  description text,
  speed text,
  price numeric(12,2),
  price_label text,
  billing_period text default '/ mes',
  active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  neighborhood text,
  service text not null default 'Internet',
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Anyone can view active plans" on public.plans;
create policy "Anyone can view active plans"
on public.plans for select
to anon, authenticated
using (active = true);

drop policy if exists "Authenticated users manage plans" on public.plans;
create policy "Authenticated users manage plans"
on public.plans for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can submit a lead" on public.leads;
create policy "Anyone can submit a lead"
on public.leads for insert
to anon, authenticated
with check (
  char_length(trim(name)) between 2 and 120
  and char_length(trim(phone)) between 7 and 30
  and char_length(coalesce(message, '')) <= 2000
);

drop policy if exists "Authenticated users view leads" on public.leads;
create policy "Authenticated users view leads"
on public.leads for select
to authenticated
using (true);

drop policy if exists "Authenticated users update leads" on public.leads;
create policy "Authenticated users update leads"
on public.leads for update
to authenticated
using (true)
with check (true);

-- IMPORTANTE:
-- 1. No pongas la service_role key en el frontend.
-- 2. Crea usuarios administradores desde Supabase Authentication.
-- 3. Antes de abrir el panel administrativo, limita las políticas de administración
--    a usuarios autorizados mediante una tabla de perfiles/roles y políticas específicas.
-- 4. Agrega protección anti-spam (por ejemplo CAPTCHA/rate limit) al formulario antes de producción.
