# Conectando Fronteras — sitio web

Proyecto inicial desde cero para Grupo Empresarial Conectando Fronteras S.A.S.

## Tecnologías
- React + Vite
- Supabase (base de datos y solicitudes de clientes)
- Vercel (despliegue)
- GitHub (repositorio)

## Requisitos
Node.js 20 o superior y una cuenta en GitHub, Vercel y Supabase.

## Ejecutar localmente
```bash
npm install
cp .env.example .env
npm run dev
```
Abre la dirección local que indique Vite.

## Configurar Supabase
1. Crea un proyecto en Supabase.
2. Abre SQL Editor y ejecuta `supabase/schema.sql`.
3. En Project Settings > API copia Project URL y la clave pública anon/publishable.
4. Pega esos valores en `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Reinicia `npm run dev`.

El formulario guarda solicitudes en `public.leads`. Los planes activos se leen desde `public.plans`. No se han inventado precios ni velocidades: hasta que la empresa suministre sus planes, la web muestra un mensaje para consultar.

## Publicar en GitHub y Vercel
1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta.
3. En Vercel importa el repositorio.
4. Vercel detectará Vite. Build command: `npm run build`; output directory: `dist`.
5. En Vercel > Settings > Environment Variables agrega las dos variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. Haz Deploy.

## Pendiente antes de producción
- Confirmar teléfono oficial de WhatsApp y correo de atención.
- Confirmar catálogo de planes, velocidades, precios y paquetes de TV.
- Confirmar cobertura geográfica real.
- Confirmar redes sociales y dirección oficial.
- Configurar usuarios administradores y políticas de acceso restringido.
- Añadir CAPTCHA/rate limit al formulario y aviso de privacidad aprobado por la empresa.
- Verificar autorización de uso del logo e imágenes.

## Seguridad
La clave `anon`/publicable está diseñada para uso en navegador junto con RLS. Nunca incluyas `service_role` ni secretos privados en variables `VITE_*` ni en el código del frontend.
