# AI Mistakes Log

> Registro de errores cometidos por la IA durante el desarrollo.
> Consulta este archivo ANTES de implementar para evitar repetir errores.

## Formato

| Fecha | Dominio | Error | Severidad | Lección |
|-------|---------|-------|-----------|---------|
| 2026-04-02 | auth | Admin server actions sin auth/role check | CRITICAL | Toda server action con mutación DEBE tener auth check independiente del layout |
| 2026-04-02 | database | Customer RLS USING(true) expone PII vía anon key | CRITICAL | Nunca RLS USING(true) en tablas con PII. Restringir siempre a nivel de fila |
| 2026-04-02 | database | RPC SECURITY DEFINER ejecutable por anon | CRITICAL | Toda función SECURITY DEFINER necesita REVOKE public + GRANT service_role |
| 2026-04-02 | auth | Auth callback no puede leer staff por RLS | HIGH | Si usuario autenticado necesita leer su registro, añadir policy auth.uid() = user_id |
| 2026-04-02 | database | Card reactivation no asigna active_reward_id | HIGH | Al implementar un toggle, implementar AMBAS ramas con sus invariantes |
| 2026-04-02 | ui | Material Symbols Outlined no cargada | MEDIUM | Verificar que fuentes externas (CDN) estén importadas en layout.tsx |
| 2026-04-02 | auth | Magic link rate limited en Supabase free (3/hora) | MEDIUM | Para dev/testing, email+password es más práctico que magic link |
| 2026-04-02 | build | Seed data en Wave 6 pero necesario desde Wave 1 | MEDIUM | Seed con config base debe ir en Wave 0 |
| 2026-04-02 | ui | Textos donde deberían ir iconos | MEDIUM | Preferir SIEMPRE iconos sobre texto en botones y navegación. Texto solo como label secundario |

## Patrones de error recurrentes

### Server Actions sin auth
Las server actions de Next.js son invocables directamente via POST, independientemente del layout guard.
**Regla**: SIEMPRE verificar auth+role al inicio de cada server action con mutación.

### RLS demasiado permisiva
USING(true) en tablas con datos personales expone todo via anon key + REST API.
**Regla**: diseñar RLS pensando en qué puede hacer alguien con SOLO el anon key desde curl.

### UI con texto en vez de iconos
El usuario prefiere iconos con labels mínimos. No usar texto largo en botones ni navegación.
**Regla**: Material Symbols Outlined como primera opción. Texto solo como micro-label de 10px bajo el icono.
