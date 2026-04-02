# PLAN: Digital Loyalty Card System

> Generado desde escenarios BDD en .yggdrasil/docs/SCENARIOS.md
> Fecha: 2026-03-31

---

## Arquitectura

### Por qué construimos esto
Fidelización digital sin fricción para un shisha lounge. NFC/QR en mesa → registro mínimo → tarjeta web instantánea. Sin apps, sin contraseñas, sin instalaciones.

### Estructura de carpetas

```
app/
├── (onboarding)/
│   └── register/
│       ├── page.tsx          # Formulario registro Customer
│       └── actions.ts        # Server Action: crear Customer + LoyaltyCard
├── card/
│   └── [cardId]/
│       └── page.tsx          # Vista pública tarjeta (Server Component)
├── (staff)/
│   ├── login/
│   │   ├── page.tsx          # Magic link login
│   │   └── actions.ts        # Server Action: signInWithOtp
│   ├── scan/
│   │   ├── page.tsx          # Escáner QR + confirmación stamp
│   │   └── actions.ts        # Server Action: añadir stamp
│   └── redeem/
│       └── [cardId]/
│           ├── page.tsx      # Confirmación canje reward
│           └── actions.ts    # Server Action: canjear reward
├── (admin)/
│   ├── layout.tsx            # Layout admin con sidebar
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard 7 métricas
│   ├── customers/
│   │   └── page.tsx          # Gestión clientes
│   ├── rewards/
│   │   └── page.tsx          # Gestión rewards
│   ├── staff/
│   │   └── page.tsx          # Gestión staff
│   └── config/
│       └── page.tsx          # Configuración negocio
├── auth/
│   └── callback/
│       └── route.ts          # PKCE callback Supabase Auth
├── layout.tsx                # Root layout
└── manifest.ts               # PWA manifest
components/
├── ui/                       # shadcn/ui components
├── qr-scanner.tsx            # Client Component: escáner QR cámara
├── loyalty-card.tsx          # Componente visual tarjeta
└── stamp-grid.tsx            # Grid de sellos visual
lib/
├── supabase/
│   ├── server.ts             # createServerClient (service_role + anon)
│   ├── client.ts             # createBrowserClient
│   └── middleware.ts         # Helper refresh sesión
├── email/
│   └── resend.ts             # Cliente Resend singleton
└── validations/
    ├── env.ts                # Zod schema env vars
    ├── customer.ts           # Zod schema registro Customer
    └── stamp.ts              # Zod schema operaciones stamp/redeem
emails/
├── new-stamp.tsx             # Plantilla "Nuevo sello"
└── reward-ready.tsx          # Plantilla "Tu reward está listo"
middleware.ts                 # Protección rutas staff/admin
supabase/
└── migrations/
    ├── 001_tables.sql        # Tablas base
    ├── 002_rls.sql           # Políticas RLS
    ├── 003_functions.sql     # Funciones RPC (add_stamp, redeem_reward)
    └── 004_triggers.sql      # Trigger: solo un reward activo
```

### Schema de base de datos

```sql
-- Clientes registrados
CREATE TABLE customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  marketing_consent BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Cuentas de staff (incluye admin)
CREATE TABLE staff (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id),  -- vinculado a Supabase Auth
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('staff', 'admin')),
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rewards configurables
CREATE TABLE rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  stamps_required INT NOT NULL DEFAULT 10 CHECK (stamps_required > 0),
  is_active       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Tarjeta de fidelización (1 por customer)
CREATE TABLE loyalty_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  stamps_current    INT DEFAULT 0 CHECK (stamps_current >= 0),
  cycles_completed  INT DEFAULT 0,
  active_reward_id  UUID REFERENCES rewards(id),
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Historial de sellos
CREATE TABLE stamps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id    UUID REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  added_by   UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  notes      TEXT
);

-- Historial de canjes
CREATE TABLE redemptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id      UUID REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  reward_id    UUID REFERENCES rewards(id),
  redeemed_by  UUID REFERENCES staff(id),
  redeemed_at  TIMESTAMPTZ DEFAULT now(),
  cycle_number INT NOT NULL CHECK (cycle_number > 0)
);

-- Configuración global del negocio (singleton)
CREATE TABLE business_config (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name      TEXT NOT NULL,
  logo_url           TEXT,
  primary_color      TEXT DEFAULT '#000000',
  welcome_message    TEXT,
  pass_strip_message TEXT,
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_stamps_card_id_created ON stamps(card_id, created_at DESC);
CREATE INDEX idx_loyalty_cards_customer ON loyalty_cards(customer_id);
CREATE INDEX idx_redemptions_card ON redemptions(card_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
```

### Funciones RPC (PostgreSQL)

```sql
-- Añadir stamp con cooldown atómico (previene race conditions)
CREATE OR REPLACE FUNCTION add_stamp(
  p_card_id UUID,
  p_staff_id UUID,
  p_cooldown_minutes INT DEFAULT 60
)
RETURNS JSON AS $$
DECLARE
  v_last_stamp TIMESTAMPTZ;
  v_card RECORD;
  v_minutes_remaining INT;
  v_new_count INT;
  v_reward RECORD;
  v_reward_unlocked BOOLEAN := false;
BEGIN
  -- Lock the card row to prevent concurrent stamps
  SELECT * INTO v_card FROM loyalty_cards
    WHERE id = p_card_id AND is_active = true
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'card_not_found');
  END IF;

  -- Check cooldown
  SELECT created_at INTO v_last_stamp FROM stamps
    WHERE card_id = p_card_id ORDER BY created_at DESC LIMIT 1;

  IF v_last_stamp IS NOT NULL AND
     v_last_stamp > now() - (p_cooldown_minutes || ' minutes')::interval THEN
    v_minutes_remaining := CEIL(EXTRACT(EPOCH FROM
      (v_last_stamp + (p_cooldown_minutes || ' minutes')::interval - now())) / 60);
    RETURN json_build_object('success', false, 'error', 'cooldown',
      'minutes_remaining', v_minutes_remaining);
  END IF;

  -- Insert stamp
  INSERT INTO stamps (card_id, added_by) VALUES (p_card_id, p_staff_id);

  -- Increment counter
  v_new_count := v_card.stamps_current + 1;
  UPDATE loyalty_cards SET stamps_current = v_new_count, updated_at = now()
    WHERE id = p_card_id;

  -- Check if reward unlocked (exactly at threshold)
  SELECT * INTO v_reward FROM rewards WHERE id = v_card.active_reward_id;
  IF v_reward.id IS NOT NULL AND v_new_count = v_reward.stamps_required THEN
    v_reward_unlocked := true;
  END IF;

  RETURN json_build_object(
    'success', true,
    'stamps_current', v_new_count,
    'reward_unlocked', v_reward_unlocked,
    'reward_name', v_reward.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Canjear reward con stamps sobrantes
CREATE OR REPLACE FUNCTION redeem_reward(
  p_card_id UUID,
  p_staff_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_card RECORD;
  v_reward RECORD;
  v_active_reward RECORD;
  v_new_stamps INT;
  v_cycle INT;
BEGIN
  SELECT * INTO v_card FROM loyalty_cards
    WHERE id = p_card_id AND is_active = true
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'card_not_found');
  END IF;

  -- Get the reward assigned to this cycle
  SELECT * INTO v_reward FROM rewards WHERE id = v_card.active_reward_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'no_reward_assigned');
  END IF;

  -- Check threshold reached
  IF v_card.stamps_current < v_reward.stamps_required THEN
    RETURN json_build_object('success', false, 'error', 'threshold_not_reached',
      'stamps_current', v_card.stamps_current,
      'stamps_required', v_reward.stamps_required);
  END IF;

  -- Calculate remaining stamps and new cycle
  v_new_stamps := v_card.stamps_current - v_reward.stamps_required;
  v_cycle := v_card.cycles_completed + 1;

  -- Get current active reward for next cycle
  SELECT * INTO v_active_reward FROM rewards WHERE is_active = true LIMIT 1;

  -- Create redemption
  INSERT INTO redemptions (card_id, reward_id, redeemed_by, cycle_number)
    VALUES (p_card_id, v_reward.id, p_staff_id, v_cycle);

  -- Update card: new cycle
  UPDATE loyalty_cards SET
    stamps_current = v_new_stamps,
    cycles_completed = v_cycle,
    active_reward_id = COALESCE(v_active_reward.id, v_reward.id),
    updated_at = now()
  WHERE id = p_card_id;

  RETURN json_build_object(
    'success', true,
    'stamps_remaining', v_new_stamps,
    'cycle_completed', v_cycle,
    'reward_redeemed', v_reward.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger: solo un reward activo

```sql
CREATE OR REPLACE FUNCTION enforce_single_active_reward()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE rewards SET is_active = false
      WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_active_reward
  BEFORE INSERT OR UPDATE OF is_active ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_active_reward();
```

### Políticas RLS

```sql
-- Clientes: anon puede SELECT solo su propio registro via card view
-- (acceso controlado por Server Component, no directo)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_own" ON customers FOR SELECT
  USING (true);  -- filtrado por Server Component, no por RLS directo
-- Staff/admin accede via service_role (bypasea RLS)

-- LoyaltyCards: anon puede leer por UUID (vista pública)
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_by_id" ON loyalty_cards FOR SELECT
  USING (true);  -- Server Component filtra campos visibles

-- Stamps: solo lectura para queries de dashboard
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON stamps FOR ALL
  USING (false);  -- Solo accesible via service_role o RPC SECURITY DEFINER

-- Rewards: anon puede leer rewards activos
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_active" ON rewards FOR SELECT
  USING (is_active = true);

-- Redemptions: solo service_role
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON redemptions FOR ALL
  USING (false);

-- Staff: solo service_role
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON staff FOR ALL
  USING (false);

-- BusinessConfig: anon puede leer (datos públicos del negocio)
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read" ON business_config FOR SELECT
  USING (true);
```

### Contratos de API (Server Actions)

```
registerCustomer(formData: FormData)
  Input Zod: { name: string min(2), email: string email(), marketing_consent: boolean }
  Success: redirect → /card/[cardId]
  Errors: { success: false, error: "email_exists" | "validation_error", fields?: Record }

addStamp(cardId: string)
  Input Zod: { cardId: string uuid() }
  Auth: Staff autenticado + is_active check
  Success: { success: true, stamps_current: number, reward_unlocked: boolean, reward_name?: string }
  Errors: { success: false, error: "card_not_found" | "cooldown" | "staff_inactive" | "card_inactive", minutes_remaining?: number }

redeemReward(cardId: string)
  Input Zod: { cardId: string uuid() }
  Auth: Staff autenticado + is_active check
  Success: { success: true, stamps_remaining: number, cycle_completed: number, reward_redeemed: string }
  Errors: { success: false, error: "card_not_found" | "no_reward" | "threshold_not_reached" }

signInWithMagicLink(formData: FormData)
  Input Zod: { email: string email() }
  Success: { success: true, message: "Check your email" }
  Errors: { success: false, error: "invalid_email" }
```

### Open Questions (no bloquean)
- Proveedor NFC tags resistentes a humedad/calor
- Dominio definitivo para URLs
- ~~Assets de branding (logo, colores, tipografía)~~ RESUELTO: ver Design System
- Soporte offline PWA (no en MVP)

### Design System
Referencia completa: `.yggdrasil/design/DESIGN_SYSTEM.md`

Extraído de mockups HTML (Stitch). 6 pantallas documentadas:
1. Onboarding Form (`/register`)
2. Welcome Screen (post-registro)
3. Web Loyalty Card (`/card/[cardId]`)
4. Staff Panel (`/scan`)
5. Admin Dashboard (`/dashboard`)
6. Rewards Configuration (`/rewards` con edit drawer)

**Constraints de diseño obligatorios para todas las tareas de UI:**
- **Tema**: Dark luxury. Fondo #131313, primary #e6c364 (oro), texto #e5e2e1
- **Tipografía**: Manrope (headlines, bold/extrabold, uppercase) + Inter (body/labels)
- **Iconos**: Material Symbols Outlined (Google Fonts), FILL 1 solo para activos
- **Surfaces**: Material Design 3 tokens (surface-container-lowest → highest)
- **Labels**: siempre 10px, uppercase, tracking-widest, on-surface-variant
- **Inputs**: bg-[#1c1b1b], border-0, rounded-xl, focus:ring-primary/40
- **CTAs**: bg-primary, text-on-primary, font-headline, font-bold, uppercase, tracking-widest
- **Cards**: border-l-4 border-primary (dashboard), border border-white/5 hover:border-primary/20 (rewards)
- **Nav**: sidebar w-72 en desktop (admin), bottom nav blur en mobile
- **Stamps**: grid 5 cols, rounded-full, primary para llenos, shadow glow

Mockups HTML originales guardados en: `.yggdrasil/design/` (consultar para detalle pixel-level).

---

## Tareas

### Wave 0 — Setup

#### Tarea 1: Inicializar proyecto Next.js 15 + dependencias
- **Archivos**: `package.json`, `tsconfig.json`
- **Acción**: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`. Instalar: `@supabase/supabase-js @supabase/ssr resend @react-email/components zod qr-scanner react-qr-code`. Inicializar shadcn: `npx shadcn@latest init`.
- **Verificación**: `npm run build` pasa sin errores
- **BDD**: Infraestructura (sin mapeo BDD directo — prerequisito de todas las tareas)

#### Tarea 2: Validación de env vars con Zod
- **Archivos**: `lib/validations/env.ts`
- **Acción**: Schema Zod que valida `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (sin NEXT_PUBLIC_), `RESEND_API_KEY`. Exportar función `validateEnv()` que lanza al arrancar si falta alguna.
- **Verificación**: import en `app/layout.tsx`, falla si falta variable
- **BDD**: Infraestructura (prerequisito de seguridad — Research Risk: service_role key exposure)

#### Tarea 3: Clientes Supabase (server + browser)
- **Archivos**: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- **Acción**: `server.ts` exporta `createServiceClient()` (service_role) y `createAnonClient()` (anon key). `client.ts` exporta `createBrowserClient()`. Usar `@supabase/ssr`.
- **Verificación**: ambos clientes se instancian sin error
- **BDD**: Infraestructura (prerequisito — Research: usar @supabase/ssr, no auth-helpers)

#### Tarea 4: Migración SQL — tablas base
- **Archivos**: `supabase/migrations/001_tables.sql`
- **Acción**: Crear todas las tablas según schema de Arquitectura. Incluir CHECK constraints e índices.
- **Verificación**: `supabase db push` o aplicar en Supabase dashboard sin errores
- **BDD**: Infraestructura (schema base para todas las features)

#### Tarea 5: Migración SQL — RLS policies
- **Archivos**: `supabase/migrations/002_rls.sql`
- **Acción**: Habilitar RLS en todas las tablas + crear policies según Arquitectura.
- **Verificación**: queries con anon key solo devuelven lo permitido
- **BDD**: "Request malicioso a endpoint de cliente", "Staff intenta acceder a rutas de Admin"

#### Tarea 6: Migración SQL — funciones RPC + trigger
- **Archivos**: `supabase/migrations/003_functions.sql`
- **Acción**: Crear funciones `add_stamp()` y `redeem_reward()` con `SECURITY DEFINER`. Crear trigger `enforce_single_active_reward`.
- **Verificación**: llamar funciones desde SQL console con datos de prueba
- **BDD**: "Cooldown activo", "Concurrencia", "Staff canjea Reward", "Admin cambia Reward"

#### Tarea 7: Generar tipos TypeScript de Supabase
- **Archivos**: `types/database.ts`, `package.json` (script)
- **Acción**: Ejecutar `npx supabase gen types typescript --project-id <id> > types/database.ts`. Añadir script `"db:types"` en package.json.
- **Verificación**: archivo generado con tipos de todas las tablas
- **BDD**: Infraestructura (tipado para todas las tareas)

#### Tarea 8: Schemas de validación Zod
- **Archivos**: `lib/validations/customer.ts`, `lib/validations/stamp.ts`
- **Acción**: `customer.ts`: schema para registro (name min 2, email, marketing_consent boolean). `stamp.ts`: schemas para addStamp (cardId uuid) y redeemReward (cardId uuid).
- **Verificación**: validación rechaza inputs inválidos
- **BDD**: "Datos inválidos - campos vacíos o email malformado"

#### Tarea 9: Root layout + PWA manifest
- **Archivos**: `app/layout.tsx`, `app/manifest.ts`
- **Acción**: Root layout con metadata SEO, fuente Inter, ThemeProvider. Manifest con name, icons, theme_color, display: standalone.
- **Verificación**: `npm run dev` muestra página base, manifest accesible en `/manifest.webmanifest`
- **BDD**: Infraestructura (PWA installability)

#### Tarea 10: Middleware de auth + refresh sesión
- **Archivos**: `middleware.ts`, `lib/supabase/middleware.ts`
- **Acción**: `middleware.ts` protege rutas `/scan/*`, `/redeem/*`, `/dashboard/*`, `/customers/*`, `/rewards/*`, `/staff/*`, `/config/*`. Redirige a `/login` si no autenticado. `lib/supabase/middleware.ts` helper para refrescar token en cada request.
- **Verificación**: acceso a ruta protegida sin sesión → redirect a `/login`
- **BDD**: "Staff intenta acceder a rutas de Admin"

---

### Wave 1 — Onboarding (Customer Registration)

#### Tarea 11: [RED] Test — registerCustomer action
- **Archivos**: `__tests__/actions/register-customer.test.ts`
- **Acción**: Tests que fallan para: (1) registro exitoso crea Customer + LoyaltyCard con active_reward_id, (2) email duplicado devuelve error genérico, (3) nombre vacío devuelve error validación, (4) email malformado devuelve error validación, (5) marketing_consent false se acepta.
- **Verificación**: 5 tests FALLAN (no existe la implementación)
- **BDD**: "Happy path - nuevo Customer se registra", "Email ya registrado", "Datos inválidos"

#### Tarea 12: [GREEN] Implementar registerCustomer action
- **Archivos**: `app/(onboarding)/register/actions.ts`
- **Acción**: Server Action: validar con Zod → check email existente (error genérico si existe) → insert Customer → insert LoyaltyCard con active_reward_id del reward activo → redirect a `/card/[cardId]`. Usar `createServiceClient()`.
- **Verificación**: los 5 tests de Tarea 11 pasan
- **BDD**: "Happy path - nuevo Customer se registra", "Email ya registrado", "Datos inválidos"

#### Tarea 13: UI — Formulario de registro
- **Archivos**: `app/(onboarding)/register/page.tsx`
- **Acción**: Server Component con formulario Client Component embebido. Campos: nombre, email, checkbox marketing_consent (opcional), botón submit. Mobile-first. Usa shadcn/ui (Input, Button, Checkbox, Label). Validación client-side con Zod. Llama a registerCustomer action.
- **Verificación**: formulario visible en `/register`, submit funciona
- **BDD**: "Happy path - nuevo Customer se registra", "Datos inválidos"

#### Tarea 14: UI — Vista pública tarjeta web
- **Archivos**: `app/card/[cardId]/page.tsx`, `components/loyalty-card.tsx`
- **Acción**: Server Component que carga LoyaltyCard + Customer (solo nombre) + Reward vía `createAnonClient()`. Muestra: nombre de pila, stamp-grid visual, estado reward (accumulating/available), nombre del reward. Si card no existe o desactivada → mensaje apropiado. NUNCA mostrar email.
- **Verificación**: `/card/[uuid]` muestra tarjeta con datos correctos
- **BDD**: "Happy path - nuevo Customer se registra", "Vista pública solo muestra datos mínimos", "LoyaltyCard desactivada"

#### Tarea 15: Componente stamp-grid visual
- **Archivos**: `components/stamp-grid.tsx`
- **Acción**: Componente que recibe `stampsCurrent`, `stampsRequired` y renderiza grid de sellos (rellenos/vacíos). Si `stampsCurrent > stampsRequired`, muestra los extras en color diferente. Mobile-first, Tailwind.
- **Verificación**: grid renderiza correctamente para 0, 5, 10, 12 sellos con umbral 10
- **BDD**: "Happy path - nuevo Customer se registra", "Customer sigue acumulando stamps con Reward pendiente"

---

### Wave 2 — Auth (Staff/Admin)

#### Tarea 16: [RED] Test — signInWithMagicLink action
- **Archivos**: `__tests__/actions/sign-in.test.ts`
- **Acción**: Tests que fallan para: (1) email válido → success, (2) email inválido → error validación.
- **Verificación**: 2 tests FALLAN
- **BDD**: Infraestructura auth (prerequisito de "Staff añade Stamp")

#### Tarea 17: [GREEN] Implementar signInWithMagicLink + callback
- **Archivos**: `app/(staff)/login/actions.ts`, `app/auth/callback/route.ts`
- **Acción**: Server Action: validar email con Zod → `supabase.auth.signInWithOtp({ email })`. Route Handler callback: intercambia code por sesión (PKCE). Redirect a `/scan` si staff, `/dashboard` si admin.
- **Verificación**: los 2 tests de Tarea 16 pasan
- **BDD**: Infraestructura auth

#### Tarea 18: UI — Página de login staff
- **Archivos**: `app/(staff)/login/page.tsx`
- **Acción**: Formulario de email + botón "Enviar magic link". Mensaje de confirmación post-envío. shadcn/ui components. Mobile-first.
- **Verificación**: `/login` muestra formulario, submit envía magic link
- **BDD**: Infraestructura auth

---

### Wave 3 — Email transaccional (prerequisito de Stamps)

#### Tarea 19: Cliente Resend + plantilla "Nuevo sello"
- **Archivos**: `lib/email/resend.ts`, `emails/new-stamp.tsx`
- **Acción**: `resend.ts`: cliente singleton `new Resend(process.env.RESEND_API_KEY)` + función `sendStampEmail(to, name, stampsCurrent, stampsRequired)`. `new-stamp.tsx`: plantilla React Email con nombre, stamps actuales, stamps para reward.
- **Verificación**: email se envía correctamente en dev (Resend test mode)
- **BDD**: "Happy path - Staff añade Stamp" (email "Nuevo sello")

#### Tarea 20: Plantilla email "Tu reward está listo"
- **Archivos**: `emails/reward-ready.tsx`
- **Acción**: Plantilla React Email "Tu reward está listo" con nombre del cliente y nombre del reward. Añadir función `sendRewardReadyEmail(to, name, rewardName)` a `lib/email/resend.ts`.
- **Verificación**: email se envía correctamente en dev
- **BDD**: "Customer alcanza umbral y desbloquea Reward" (email "Tu reward está listo")

---

### Wave 4 — Stamps (Core Loop)

#### Tarea 21: [RED] Test — addStamp action
- **Archivos**: `__tests__/actions/add-stamp.test.ts`
- **Acción**: Tests que fallan para: (1) stamp exitoso incrementa counter + envía email "Nuevo sello", (2) cooldown activo rechaza con minutos restantes, (3) card inexistente → error, (4) card desactivada → error, (5) staff desactivado → error, (6) stamp que alcanza umbral → reward_unlocked = true + envía email "Reward listo" además de "Nuevo sello".
- **Verificación**: 6 tests FALLAN
- **BDD**: "Happy path - Staff añade Stamp", "Cooldown activo", "QR con UUID inexistente", "LoyaltyCard desactivada", "Staff desactivado", "Customer alcanza umbral"

#### Tarea 22: [GREEN] Implementar addStamp action
- **Archivos**: `app/(staff)/scan/actions.ts`
- **Acción**: Server Action: verificar auth → verificar staff is_active → validar cardId con Zod → llamar RPC `add_stamp()` → enviar email "Nuevo sello" siempre en stamp exitoso → si además reward_unlocked, enviar email "Reward listo" → devolver resultado. Usa `createServiceClient()`.
- **Verificación**: los 6 tests de Tarea 21 pasan
- **BDD**: "Happy path - Staff añade Stamp", "Cooldown activo", "QR con UUID inexistente", "LoyaltyCard desactivada", "Staff desactivado", "Customer alcanza umbral"

#### Tarea 23: [RED] Test — redeemReward action
- **Archivos**: `__tests__/actions/redeem-reward.test.ts`
- **Acción**: Tests que fallan para: (1) canje exitoso: stamps se reducen, cycle incrementa, (2) stamps insuficientes → error, (3) card inexistente → error, (4) stamps sobrantes se mantienen (12 - 10 = 2), (5) staff desactivado → error.
- **Verificación**: 5 tests FALLAN
- **BDD**: "Staff canjea Reward del Customer", "Customer sigue acumulando stamps con Reward pendiente", "Staff desactivado intenta canjear"

#### Tarea 24: [GREEN] Implementar redeemReward action
- **Archivos**: `app/(staff)/redeem/[cardId]/actions.ts`
- **Acción**: Server Action: verificar auth → verificar staff is_active → validar cardId → llamar RPC `redeem_reward()` → devolver resultado. Usa `createServiceClient()`.
- **Verificación**: los 5 tests de Tarea 23 pasan
- **BDD**: "Staff canjea Reward del Customer", "Customer sigue acumulando stamps con Reward pendiente"

#### Tarea 25: Componente QR scanner
- **Archivos**: `components/qr-scanner.tsx`
- **Acción**: Client Component ("use client") que encapsula `qr-scanner` (nimiq). Import dinámico con `next/dynamic` + `ssr: false`. Pide permiso de cámara, escanea, devuelve UUID via callback `onScan(uuid: string)`. Manejo de error si cámara no disponible.
- **Verificación**: componente renderiza, solicita cámara, detecta QR en dev
- **BDD**: "Happy path - Staff añade Stamp" (UI del escáner)

#### Tarea 26: UI — Panel staff: escanear + confirmar stamp
- **Archivos**: `app/(staff)/scan/page.tsx`
- **Acción**: Página con QR scanner. Al escanear UUID → fetch datos del Customer (nombre de pila + stamps) → mostrar confirmación con botón "Añadir sello". Al confirmar → llamar addStamp action → mostrar resultado (éxito con nuevo count, o error). Si reward_unlocked → banner destacado con link a canjear. Si cooldown → mostrar minutos restantes.
- **Verificación**: flujo completo escáner → confirmación → resultado
- **BDD**: "Happy path - Staff añade Stamp", "Cooldown activo", "Customer alcanza umbral"

#### Tarea 27: UI — Página de canje de reward
- **Archivos**: `app/(staff)/redeem/[cardId]/page.tsx`
- **Acción**: Server Component que carga datos de LoyaltyCard + Reward. Muestra: nombre cliente, reward a canjear, stamps actuales, stamps que quedarán tras canje. Botón "Canjear reward". Al confirmar → llamar redeemReward action → mostrar resultado.
- **Verificación**: flujo canje funciona end-to-end
- **BDD**: "Staff canjea Reward del Customer"

---

### Wave 5 — Admin Panel

#### Tarea 28: Layout admin + verificación role
- **Archivos**: `app/(admin)/layout.tsx`
- **Acción**: Layout con sidebar (Dashboard, Clientes, Rewards, Staff, Configuración). Verificar en servidor que el usuario autenticado tiene role = 'admin'. Si no → redirect a `/scan` (staff) o `/login`. shadcn/ui Sidebar.
- **Verificación**: staff con role='staff' no puede acceder a rutas admin
- **BDD**: "Staff intenta acceder a rutas de Admin"

#### Tarea 29: [RED] Test — dashboard métricas
- **Archivos**: `__tests__/admin/dashboard.test.ts`
- **Acción**: Tests que fallan para: (1) devuelve total clientes, (2) stamps por periodo, (3) rewards canjeados, (4) clientes activos, (5) tasa conversión onboarding, (6) tiempo medio ciclo, (7) clientes inactivos.
- **Verificación**: 7 tests FALLAN
- **BDD**: Infraestructura admin (métricas definidas en CONTEXT.md Scope IN)

#### Tarea 30: [GREEN] Dashboard métricas + UI
- **Archivos**: `app/(admin)/dashboard/page.tsx`
- **Acción**: Server Component. Queries a Supabase con `createServiceClient()` para las 7 métricas. Cards con shadcn/ui mostrando cada métrica. Filtro de periodo (hoy/semana/mes) para stamps.
- **Verificación**: los 7 tests de Tarea 29 pasan + UI muestra métricas
- **BDD**: Infraestructura admin (métricas)

#### Tarea 31: Admin — Gestión de Customers
- **Archivos**: `app/(admin)/customers/page.tsx`
- **Acción**: Tabla paginada (shadcn/ui DataTable): nombre, email, stamps actuales, ciclos completados, última visita. Acciones: ver detalle, activar/desactivar tarjeta. Al desactivar → stamps se reinician a 0. Server Actions para las mutaciones.
- **Verificación**: tabla muestra datos, desactivar/reactivar funciona
- **BDD**: "Admin desactiva LoyaltyCard", "Admin reactiva LoyaltyCard"

#### Tarea 32: Admin — Gestión de Rewards
- **Archivos**: `app/(admin)/rewards/page.tsx`
- **Acción**: Lista de rewards. Crear nuevo (nombre, descripción, stamps_required). Activar/desactivar (trigger DB garantiza solo uno activo). Mostrar cuántos clientes tienen ciclo activo bajo cada reward antes de desactivar. Server Actions.
- **Verificación**: CRUD funciona, solo un reward activo a la vez
- **BDD**: "Admin cambia Reward mientras hay clientes en ciclo activo"

#### Tarea 33: Admin — Gestión de Staff
- **Archivos**: `app/(admin)/staff/page.tsx`
- **Acción**: Lista de staff. Crear nuevo (email + nombre → envía magic link invite). Activar/desactivar. Mostrar role. Server Actions.
- **Verificación**: crear staff funciona, desactivar impide login
- **BDD**: "Staff desactivado intenta añadir Stamp"

#### Tarea 34: Admin — Configuración del negocio
- **Archivos**: `app/(admin)/config/page.tsx`
- **Acción**: Formulario para editar BusinessConfig: nombre, logo (upload URL), color primario (color picker), mensaje de bienvenida, texto del pass. Server Action para guardar. Validación Zod.
- **Verificación**: cambios se guardan y reflejan en la tarjeta web del cliente
- **BDD**: Infraestructura admin (configuración)

---

### Wave 6 — Hardening

#### Tarea 35: [RED] Test — seguridad RLS y roles
- **Archivos**: `__tests__/security/rls.test.ts`
- **Acción**: Tests que fallan para: (1) anon key no puede leer stamps directamente, (2) anon key no puede leer staff, (3) anon key no puede leer redemptions, (4) anon key puede leer loyalty_cards y rewards activos, (5) staff role no puede acceder a admin routes.
- **Verificación**: 5 tests FALLAN
- **BDD**: "Request malicioso a endpoint de cliente", "Staff intenta acceder a rutas de Admin", "Cliente malicioso intenta acceder a datos"

#### Tarea 36: [GREEN] Verificar y ajustar RLS + middleware
- **Archivos**: `supabase/migrations/002_rls.sql`, `middleware.ts`
- **Acción**: Ajustar policies RLS si algún test falla. Verificar que middleware bloquea acceso a rutas admin para role='staff'. Ajustar redirect logic.
- **Verificación**: los 5 tests de Tarea 35 pasan
- **BDD**: "Request malicioso a endpoint de cliente", "Staff intenta acceder a rutas de Admin"

#### Tarea 37: Seed data + QR de onboarding
- **Archivos**: `supabase/seed.sql`
- **Acción**: Script de seed: 1 registro BusinessConfig, 1 Reward activo ("Shisha gratis", 10 stamps), 1 Admin user. Generar QR estático de onboarding (URL de `/register`) para imprimir/mostrar en mesas.
- **Verificación**: seed aplicado, QR apunta a URL de registro
- **BDD**: Infraestructura (datos iniciales para producción)

### Riesgos aceptados en MVP
- **Email scanning de magic links**: los email scanners corporativos pueden consumir el magic link antes que el usuario. Mitigación post-MVP: URL intermedia que redirige al callback. Para MVP, instrucciones claras en UI de login.

---

## Presupuesto de tests

```
Total tareas:           37
Tareas de test [RED]:    6  (T11, T16, T21, T23, T29, T35)
Total tests esperados:  30  (5 + 2 + 6 + 5 + 7 + 5)
Ratio tests/tareas:     30/37 = 0.81

Tareas de UI sin test unitario pero con mapeo BDD: 9
(T13, T14, T15, T18, T25, T26, T27, T31, T32)

Ratio efectivo (tests + UI con BDD): (30 + 9) / 37 = 1.05 ✓
```
