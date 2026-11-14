-- Ejecutar DESPUÉS de schema.sql y admin-panel.sql.
-- CMS: páginas, navegación e información general editable desde /admin.
create table if not exists public.site_pages (
  slug text primary key,
  label text not null,
  nav_visible boolean not null default false,
  nav_order integer not null default 0,
  hero_kicker text,
  hero_title text,
  hero_text text,
  section_title text,
  section_text text,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
alter table public.site_pages enable row level security;
alter table public.site_settings enable row level security;
drop policy if exists "Public can read published pages" on public.site_pages;
create policy "Public can read published pages" on public.site_pages for select to anon, authenticated using (published = true);
drop policy if exists "Admins manage pages" on public.site_pages;
create policy "Admins manage pages" on public.site_pages for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.site_pages, public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_pages, public.site_settings to authenticated;
-- Contenido inicial: puedes modificarlo luego desde el panel.
insert into public.site_pages (slug,label,nav_visible,nav_order,hero_kicker,hero_title,hero_text,section_title,section_text,published) values
('/', 'Inicio', true, 0, 'CONECTIVIDAD PARA TU HOGAR Y NEGOCIO', 'El mundo más cerca. Conectados contigo.', 'Internet y entretenimiento para que disfrutes, trabajes, aprendas y compartas sin fronteras.', 'Planes pensados para ti', 'Conoce nuestras opciones y encuentra el servicio ideal para tu hogar o negocio.', true),
('/internet','Internet',true,1,'INTERNET PARA TU DÍA A DÍA','Internet que te conecta con lo que importa.','Conectividad para estudiar, trabajar, emprender y disfrutar tus contenidos favoritos.','Conexión para tus actividades','Consulta disponibilidad y alternativas según tu sector.',true),
('/television','Televisión',true,2,'ENTRETENIMIENTO PARA COMPARTIR','Televisión para disfrutar en familia.','Una opción de entretenimiento para acompañar los momentos de tu hogar.','Disfruta tus contenidos','Conoce las alternativas de televisión disponibles en tu zona.',true),
('/planes','Planes',true,3,'ENCUENTRA TU CONEXIÓN','Planes para tu hogar y negocio.','Consulta las opciones disponibles y encuentra el servicio que mejor se adapte a tus necesidades.','Nuestros planes','Elige el plan que mejor se adapte a ti.',true),
('/cobertura','Cobertura',true,4,'ESTAMOS CERCA DE TI','Consulta nuestra cobertura.','Queremos llevar conectividad a más hogares y negocios de nuestra región.','¿Llegamos hasta tu hogar?','Cuéntanos dónde necesitas el servicio.',true),
('/nosotros','Nosotros',true,5,'NUESTRA EMPRESA','Conectamos personas. Acercamos oportunidades.','Somos Grupo Empresarial Conectando Fronteras S.A.S., una empresa orientada a acercar soluciones de conectividad y entretenimiento a nuestra comunidad.','Conectividad con sentido de región.','Trabajamos para acercar soluciones de conectividad y entretenimiento a la comunidad.',true),
('/contacto','Contacto',true,6,'HABLEMOS','Tu próxima conexión comienza aquí.','Déjanos tus datos y cuéntanos qué servicio necesitas.','Estamos para ayudarte.','Escríbenos para consultar planes, cobertura o resolver tus inquietudes.',true),
('/servicios','Servicios',false,7,'NUESTROS SERVICIOS','Soluciones para estar conectados.','Conoce nuestras opciones de Internet y televisión.','Nuestros servicios','Conectividad y entretenimiento para tu hogar y negocio.',true)
on conflict (slug) do nothing;
