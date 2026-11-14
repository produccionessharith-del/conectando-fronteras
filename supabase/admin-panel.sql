-- Panel administrativo seguro para Conectando Fronteras.
-- Ejecutar en Supabase > SQL Editor DESPUÉS del esquema inicial.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
grant select on public.admin_users to authenticated;
drop policy if exists "Admins can view own admin record" on public.admin_users;
create policy "Admins can view own admin record"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant select, insert, update, delete on public.plans to authenticated;
grant select, update on public.leads to authenticated;

-- Eliminar las políticas demasiado amplias del esquema inicial.
drop policy if exists "Authenticated users manage plans" on public.plans;
drop policy if exists "Authenticated users view leads" on public.leads;
drop policy if exists "Authenticated users update leads" on public.leads;

create policy "Only admins manage plans"
on public.plans for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Only admins view leads"
on public.leads for select to authenticated
using (public.is_admin());

create policy "Only admins update leads"
on public.leads for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Para autorizar una cuenta, primero créala en Authentication > Users.
-- Luego copia su UUID y ejecuta esta sentencia reemplazando el UUID:
-- insert into public.admin_users (user_id) values ('UUID-DEL-USUARIO');
