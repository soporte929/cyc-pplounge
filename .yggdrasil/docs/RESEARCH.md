# RESEARCH — Digital Loyalty Card System

## Relevant Files

> El proyecto es greenfield: no existe aún ningún archivo Next.js. Los archivos a continuación son los que se crearán y serán relevantes para el plan.

- `app/layout.tsx` — Root layout con metadata, ThemeProvider y fuentes. Punto de entrada de la PWA.
- `app/manifest.ts` — Web App Manifest para PWA (Next.js 15 soporta esto nativamente sin plugins externos).
- `public/sw.js` — Service Worker básico para PWA (sin offline-first por ahora, solo para installability).
- `app/(onboarding)/register/page.tsx` — Formulario de registro de Customer (nombre + email + GDPR). Server Component wrapper + Client Component para el form.
- `app/(onboarding)/register/actions.ts` — Server Action: crear Customer + LoyaltyCard en Supabase.
- `app/card/[cardId]/page.tsx` — Vista pública de la LoyaltyCard. Server Component, datos mínimos (nombre, stamps, estado reward). Sin auth.
- `app/(staff)/login/page.tsx` — Magic link login para Staff/Admin.
- `app/(staff)/login/actions.ts` — Server Action: signInWithOtp via Supabase Auth.
- `app/auth/callback/route.ts` — Route Handler para PKCE callback de Supabase Auth (obligatorio para magic link con App Router).
- `app/(staff)/scan/page.tsx` — Panel Staff: escáner QR de cámara (Client Component con "use client") + confirmación de stamp.
- `app/(staff)/scan/actions.ts` — Server Action: añadir Stamp con cooldown check, RLS via service_role.
- `app/(staff)/redeem/[cardId]/page.tsx` — Confirmación de canje de Reward por Staff.
- `app/(staff)/redeem/[cardId]/actions.ts` — Server Action: crear Redemption, resetear stamps_current, incrementar cycles_completed.
- `app/(admin)/dashboard/page.tsx` — Dashboard admin con 7 métricas (Server Component).
- `app/(admin)/customers/page.tsx` — Listado y gestión de Customers.
- `app/(admin)/rewards/page.tsx` — Gestión de Rewards (CRUD, activar/desactivar).
- `app/(admin)/staff/page.tsx` — Gestión de Staff (CRUD, activar/desactivar).
- `app/(admin)/config/page.tsx` — Configuración de BusinessConfig (nombre, logo, colores, mensaje).
- `app/api/admin/[...route]/route.ts` — Route Handlers admin (service_role, validación role = 'admin').
- `app/api/stamps/add/route.ts` — Route Handler para añadir Stamp (service_role, validación Staff activo + cooldown).
- `lib/supabase/server.ts` — `createServerClient()` para Server Components / Server Actions / Route Handlers.
- `lib/supabase/client.ts` — `createBrowserClient()` para Client Components.
- `lib/supabase/middleware.ts` — Helper para refrescar sesión en middleware.
- `middleware.ts` — Middleware Next.js: protege rutas /staff/* y /admin/*, redirige si no autenticado.
- `lib/email/resend.ts` — Cliente Resend singleton con `process.env.RESEND_API_KEY`.
- `emails/new-stamp.tsx` — Plantilla React Email para "Nuevo sello".
- `emails/reward-ready.tsx` — Plantilla React Email para "Tu reward está listo".
- `lib/validations/customer.ts` — Schema Zod para validar inputs de Customer (nombre, email, GDPR).
- `lib/validations/stamp.ts` — Schema Zod para validar request de Stamp (cardId, staffId).
- `lib/validations/env.ts` — Schema Zod para validar variables de entorno al arrancar.
- `types/database.ts` — Tipos generados por `supabase gen types typescript` (no editar a mano).
- `supabase/migrations/` — Migraciones SQL versionadas: tablas, RLS policies, índices.
- `components/qr-scanner.tsx` — Client Component que encapsula `qr-scanner` (nimiq) para escanear QR de cámara.
- `components/loyalty-card.tsx` — Componente visual de la tarjeta (stamps, estado, reward).
- `components/stamp-grid.tsx` — Grid de sellos visual (rellenos / vacíos).

## Existing Patterns

> El proyecto es greenfield. Los patrones vienen del CLAUDE.md, DOMAIN.md y stack rules definidos.

- **Naming**: kebab-case para archivos y carpetas. PascalCase para componentes React. camelCase para funciones y variables. Nombres de dominio del DOMAIN.md (Customer, LoyaltyCard, Stamp, Reward, Redemption, Staff, BusinessConfig).
- **Estructura**: App Router con route groups `(onboarding)`, `(staff)`, `(admin)` para separar contextos. Server Components por defecto; "use client" solo en formularios interactivos y escáner QR.
- **Mutaciones**: Server Actions en archivos `actions.ts` colocalizados con la página. Nunca mutaciones en Client Components directamente.
- **API endpoints**: Route Handlers en `app/api/` solo para operaciones que requieren lógica de negocio fuera del ciclo React (webhooks futuros, etc.). Las mutaciones de staff van por Server Actions.
- **Error handling**: `{ data, error }` destructuring del Supabase client. Server Actions devuelven `{ success: boolean, error?: string }`. No usar `throw` en Server Actions expuestas a UI.
- **Auth**: `@supabase/ssr` (paquete nuevo, no el deprecated `auth-helpers`). `createServerClient` en Server Side, `createBrowserClient` en Client Side. Middleware refresca tokens en cada request.
- **Validación**: Zod en la entrada de toda acción del servidor. Validar env vars al arrancar en `lib/validations/env.ts`.
- **Estilos**: Tailwind CSS únicamente. Mobile-first. Theme tokens para colores del negocio (primary_color de BusinessConfig). Sin CSS custom salvo excepcionales.
- **Testing**: No hay suite de tests aún. El proyecto seguirá TDD (test rojo → verde → refactor) según reglas del workflow.

## Dependencies Available

> Ningún `package.json` de la app existe aún. Estas son las dependencias que se instalarán al crear el proyecto Next.js y que el plan debe contemplar.

- `next@15.x` — Framework principal. App Router, Server Components, Server Actions.
- `react@19.x` — Runtime React. Compatible con shadcn/ui en su última versión.
- `typescript@5.x` — Strict mode. CERO any.
- `tailwindcss@4.x` — Utility-first CSS. Compatible con shadcn/ui y Next.js 15.
- `@supabase/supabase-js` — Cliente oficial Supabase para queries y auth.
- `@supabase/ssr` — Paquete SSR de Supabase (reemplaza el deprecated `@supabase/auth-helpers-nextjs`). Provee `createServerClient` y `createBrowserClient`.
- `resend` — SDK oficial Resend para envío de emails transaccionales.
- `@react-email/components` — Componentes para construir plantillas HTML de email con React.
- `zod` — Validación de schemas para inputs, forms y env vars.
- `shadcn/ui` (componentes copiados, no paquete npm) — Componentes UI accesibles sobre Radix primitives + Tailwind. Se instala con CLI `npx shadcn@latest init`.
- `qr-scanner` (nimiq) — Escáner QR ligero (~16kB gzip) basado en ZXing. Activamente mantenido, funciona en iOS/Android/Desktop con cámara. Requiere "use client".

## Dependencies Needed

- `qr-scanner` — Librería para escanear QR con cámara en el panel Staff. html5-qrcode está **sin mantenimiento activo**; qr-scanner (nimiq) es la alternativa ligera y mantenida. Necesita importación dinámica (`next/dynamic` con `ssr: false`) al usarse en Next.js.
- `@react-email/components` — Para construir las 2 plantillas de email (Nuevo sello, Reward listo) como componentes React. React Email solo soporta inline styles o Tailwind CSS (no módulos CSS).
- `react-qr-code` — Generador de QR estático para mostrar el QR de la LoyaltyCard en la tarjeta web (`/card/[cardId]`). Librería ligera, bien mantenida, compatible con SSR.

> `@yudiel/react-qr-scanner` es una alternativa con UI integrada pero añade más peso. Se prefiere nimiq/qr-scanner por control total de la UI con shadcn.

## Risks & Constraints

- **PWA en iOS Safari**: El manifiesto y service worker funcionan para installability (Add to Home Screen) en iOS 16.4+. El prompt de instalación automático (`beforeinstallprompt`) **no funciona en Safari iOS** — hay que guiar al usuario manualmente. El CONTEXT.md asume PWA sin offline-first; no se necesita Serwist en el MVP.
- **PKCE + magic link en mismo browser**: Supabase PKCE requiere que el usuario abra el link del email en el **mismo navegador** que inició el flujo. En mobile, si el cliente de email abre en una WebView diferente, la autenticación falla. Mitigación: instrucciones claras en la UI de login staff. Se puede mitigar también usando `flowType: 'implicit'` para magic link (no PKCE) aunque PKCE es más seguro.
- **QR scanner requiere HTTPS**: La API de cámara (`getUserMedia`) solo funciona en HTTPS o localhost. En desarrollo local usar `next dev --experimental-https`. En producción Vercel garantiza HTTPS automáticamente.
- **qr-scanner worker file**: nimiq/qr-scanner carga un Web Worker (`qr-scanner-worker.min.js`) via dynamic import. Con Next.js/webpack el worker se resuelve automáticamente, pero hay que verificar que el archivo quede en `/public` o sea servido correctamente. Alternativamente usar `next/dynamic` con `ssr: false` para todo el componente.
- **Cooldown concurrente (race condition)**: Dos Staff pueden añadir un Stamp al mismo Customer simultáneamente. Mitigación: check de cooldown en una sola transacción SQL (función RPC en Postgres) o con un `SELECT FOR UPDATE` en la RLS policy / función. Implementarlo como función PostgreSQL llamada via `.rpc()` es la solución correcta.
- **service_role key en servidor**: La `SUPABASE_SERVICE_ROLE_KEY` **nunca** debe exponerse al browser. Solo usarla en Server Actions y Route Handlers con `SUPABASE_SERVICE_ROLE_KEY` sin prefijo `NEXT_PUBLIC_`. Validar en `lib/validations/env.ts`.
- **Un solo Reward activo a la vez**: La constraint de "solo un reward activo" debe implementarse en la DB (trigger o check constraint), no solo en el código, para evitar inconsistencias si se escribe directamente en Supabase dashboard.
- **Email scanning de magic links**: Los email scanners corporativos pueden consumir el magic link antes de que el usuario lo abra (links de un solo uso). Para staff, mitigar con template de email que redirige a una URL intermedia en el dominio propio que luego hace el redirect al callback de Supabase.
- **Resend free tier**: Límite de 3.000 emails/mes. Suficiente para MVP. Con alto volumen de stamps puede saturarse (cada stamp genera 1 email). Monitorizar desde el dashboard de Resend.
- **Tipos generados por Supabase**: El archivo `types/database.ts` se genera con `npx supabase gen types typescript --project-id <id>`. Debe regenerarse cada vez que se modifique el schema. Añadir al script `package.json` para facilitar.
- **RLS anon key para vista pública**: La ruta `/card/[cardId]` usa el cliente anon sin auth. La policy RLS de `loyalty_cards` debe permitir SELECT de campos mínimos (no email) por UUID, sin revelar datos de Customer. Diseñar la policy con cuidado: JOIN de `loyalty_cards` con `customers` solo expone `first_name` y `stamps_current`.
