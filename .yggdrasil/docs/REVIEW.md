# REVIEW — Digital Loyalty Card System

> Fecha: 2026-04-02
> Veredicto: **PASS** (tras resolver 8 CRITICALs)

## Resumen ejecutivo

3 pasadas de review completadas:
1. **Code Quality** (Opus) — 5 CRITICAL, 8 WARNING, 5 INFO
2. **Security Audit** (Opus) — 2 CRITICAL, 3 HIGH, 4 MEDIUM, 1 LOW
3. **Checks automáticos** — TypeScript limpio, 0 vulnerabilidades, 912 tests pasan

Tras consolidar y deduplicar, **8 issues CRITICAL** resueltos.

## CRITICALs resueltos

| # | Issue | Fix aplicado |
|---|-------|-------------|
| C1 | Admin server actions sin auth/role verification | `verifyAdmin()` helper añadido a las 8 server actions admin |
| C2 | Customer PII expuesta via anon key (RLS USING true) | Policy restringida: solo lee customers referenciados por loyalty_cards |
| C3 | Auth callback no puede leer staff table (RLS) | Nueva policy `auth_read_own_staff` permite leer propio registro |
| C4 | Rewards RLS bloquea rewards desactivados referenciados por cards | Policy ampliada: incluye rewards referenciados por active_reward_id |
| C5 | Card reactivation no asigna active_reward_id | Fix: fetch active reward y asignar al reactivar |
| C6 | RPC functions (add_stamp, redeem_reward) ejecutables por anon | REVOKE public/anon, GRANT solo service_role |
| C7 | getCardInfo sin auth check | Auth guard añadido |
| C8 | Dead code en addStamp (stampsRequired = 10 : 10) | Eliminado |

## WARNINGs pendientes (no bloquean)

| # | Issue | Prioridad |
|---|-------|-----------|
| W1 | Admin server actions sin validación Zod | Media — DB CHECK constraints atrapan lo peor |
| W2 | validateEnv() nunca se llama | Media — falla en runtime si falta env var |
| W3 | NEXT_PUBLIC_SITE_URL no validada | Baja — fallback a localhost en dev |
| W4 | Dashboard metrics: 8+ queries secuenciales | Baja — optimizar con Promise.all o RPC |
| W5 | QR scanner re-init en cada cambio de estado | Baja — usar ref para callbacks |
| W6 | Rewards stamps_required editable mid-cycle | Media — DB inmutable por active_reward_id |
| W7 | Registration sin transacción atómica | Media — riesgo bajo de orphan customers |
| W8 | Middleware no chequea role para rutas admin | Media — layout guard + verifyAdmin cubren |

## INFOs (futuro)

- Hardcoded "10 shishas → 1 free" en register page
- Bottom nav links a rutas inexistentes (/wallet, /insights)
- Idioma mezclado (EN/ES) en la UI
- avgCycleTime mide desde creación de card, no desde inicio de ciclo
- Resend client inicializado a nivel de módulo sin validación

## Checks automáticos

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | 0 errores |
| `npm test` | 912 tests pasan |
| `npm audit --audit-level=high` | 0 vulnerabilidades |

## Migración aplicada

`supabase/migrations/004_security_fixes.sql` — 4 fixes de RLS + RPC.
