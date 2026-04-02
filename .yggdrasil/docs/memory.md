# Memory — Patrones Reutilizables

> Patrones probados que funcionaron en este proyecto.
> Reutiliza estos patrones en lugar de reinventar soluciones.

## Patrones de arquitectura

### verifyAdmin() helper
- **Dominio:** auth
- **Problema:** Server actions necesitan auth+role check independiente del layout
- **Solución:** `lib/auth/verify-admin.ts` — retorna `{ authorized, staffId, supabase }` o error
- **Usado en:** Todas las admin server actions (customers, rewards, staff, config)

### Supabase dual client (anon + service_role)
- **Dominio:** database
- **Problema:** Separar acceso público (RLS) de acceso privilegiado
- **Solución:** `createAnonClient()` para cliente/auth, `createServiceClient()` para staff/admin mutations
- **Usado en:** card view (anon), login (anon), scan/redeem/admin (service)

### RPC atómico con FOR UPDATE
- **Dominio:** database
- **Problema:** Race conditions en stamps concurrentes + cooldown
- **Solución:** Función PostgreSQL con `SELECT FOR UPDATE` lock + cooldown check en una transacción
- **Usado en:** `add_stamp()`, `redeem_reward()`

### Reward cycle con active_reward_id
- **Dominio:** database
- **Problema:** Admin cambia reward mid-cycle, clientes pierden progreso
- **Solución:** `active_reward_id` en loyalty_cards, inmutable durante el ciclo, se actualiza al canjear
- **Usado en:** loyalty_cards table, redeem_reward RPC

## Snippets probados

### Chainable Supabase mock (vitest)
```typescript
function createChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);
  return chain;
}
```
- **Usado en:** Todos los tests de server actions

### Material Symbols Outlined setup
```html
<!-- layout.tsx <head> -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```
```css
/* globals.css */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
}
```
- **Usado en:** Todos los componentes UI

## Decisiones técnicas

### Email+password en vez de magic link
- **Decidido en:** verify (cambio mid-cycle)
- **Razón:** Magic link tiene rate limit de 3/hora en Supabase free. Imposible para dev/testing
- **Trade-off:** Menos seguro que magic link, pero funcional desde día 1

### PWA sin Apple/Google Wallet (MVP)
- **Decidido en:** discuss
- **Razón:** No hay developer accounts activas. PWA primero, wallets post-MVP
- **Trade-off:** Menor engagement pasivo (no recordatorio en wallet nativo)

### Single-tenant, un solo reward activo
- **Decidido en:** discuss
- **Razón:** Un solo lounge, MVP simple
- **Trade-off:** Limita escalabilidad futura, pero simplifica enormemente el modelo
