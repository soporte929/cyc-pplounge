# CONTEXT — Digital Loyalty Card System

## Problem Statement
Los clientes de un shisha lounge no tienen una forma sencilla de acumular puntos de fidelización sin instalar una app. Las soluciones existentes (Stamp Me, Loyverse, Square Loyalty) requieren apps nativas, añaden fricción al onboarding y no permiten una experiencia personalizada. Este sistema ofrece fidelización digital sin fricción: NFC/QR en mesa → registro mínimo → tarjeta web instantánea, sin apps ni contraseñas.

## Decisions

| Decisión | Alternativas consideradas | Rationale |
|----------|--------------------------|-----------|
| Supabase client sin ORM | Prisma, Drizzle | Stack Rules prohíben ORMs. Supabase client + tipos generados cubre las necesidades sin complejidad extra |
| Single-tenant | Multi-tenant con tabla de negocios | Un solo local. Multi-tenant añade complejidad innecesaria al MVP |
| Un reward activo global | Múltiples rewards simultáneos | MVP simple. Un reward activo a la vez para todos los clientes. Ciclo vinculado a active_reward_id inmutable hasta fin de ciclo |
| PWA como tarjeta | Apple/Google Wallet desde el inicio | No hay cuentas de developer activas. PWA primero, wallets como mejora posterior |
| URL única para NFC/QR | URL por mesa con tracking | No aporta valor al sistema de fidelización. Se puede añadir parámetro `?mesa=N` en el futuro sin cambios en backend |
| Email como ID + marketing | Solo ID, o login con password | Email permite comunicación (GDPR consent). Sin passwords = sin fricción |
| Cooldown 1 hora entre stamps | Sin límite, cooldown 30min | 1 hora previene doble sellado accidental o malicioso sin ser restrictivo |
| Error genérico en email duplicado | Revelar datos existentes | Privacidad: no revelamos si un email está registrado ni datos asociados |
| Campo role en tabla staff | Tablas separadas staff/admin | Un solo flujo de auth, más simple. role: 'staff' \| 'admin' |
| anon key + RLS para cliente | service_role para todo | service_role bypasea RLS. Un endpoint mal protegido expone toda la DB. anon + RLS para cliente, service_role solo para admin/staff |
| Vista pública mínima | Mostrar todos los datos del customer | Nombre de pila + stamps + estado reward. Email nunca visible en frontend de cliente |
| active_reward_id en LoyaltyCard | Reward global sin vínculo al ciclo | Protege el progreso del cliente cuando el admin cambia el reward |
| Stamps siguen acumulando con reward pendiente | Bloquear stamps hasta canje | Mejor UX: el cliente no pierde visitas. Al canjear se descuentan stamps del umbral |
| 2 emails transaccionales vía Resend | Sin emails, o suite completa | "Nuevo sello" y "Reward listo". Resend gratis hasta 3k/mes. Mínimo viable para engagement |
| Onboarding dual NFC + QR estático | Solo NFC | QR como backup permanente y para fase de pruebas sin NFC |

## Scope

### IN
- Registro de Customer vía NFC tag o QR estático → formulario mínimo (nombre + email + GDPR consent)
- Tarjeta web (PWA) con nombre de pila, stamps actuales y estado de reward
- Staff panel: escanear QR de Customer → añadir Stamp (con cooldown 1h)
- Canje de Reward por Staff → reinicio de ciclo con stamps sobrantes
- Admin panel: dashboard con 7 métricas, gestión de Customers, Rewards, Staff y configuración del negocio
- RLS en todas las tablas. anon key para cliente, service_role para admin/staff
- 2 emails transaccionales vía Resend ("Nuevo sello", "Tu reward está listo")
- Verificación de Staff activo en cada operación
- active_reward_id vinculado al ciclo (inmutable hasta fin de ciclo)
- QR estático de onboarding como alternativa permanente al NFC

### OUT
- Apple Wallet / Google Wallet (post-MVP)
- Push notifications (post-MVP)
- Múltiples rewards simultáneos (post-MVP)
- Multi-tenancy / múltiples locales
- Tracking por mesa (cada NFC/QR apunta a misma URL)
- Sellos por mesa / integración con TPV
- Email marketing más allá de los 2 transaccionales
- App nativa
- Pagos / integración con pasarela de pago
- Programa de referidos
- QR dinámico / HMAC en QR del cliente

## Acceptance Criteria

```gherkin
Feature: Customer Onboarding

  Scenario: Happy path - nuevo Customer se registra y obtiene LoyaltyCard
    Given un Customer escanea el NFC tag o QR estático de la mesa
    When introduce nombre, email y acepta marketing_consent
    And el email no existe en la base de datos
    Then se crea un Customer y LoyaltyCard con stamps_current = 0
    And se muestra la tarjeta web con nombre de pila y 0 sellos

  Scenario: Email ya registrado
    When introduce un email que ya existe
    Then se muestra "Este email ya está registrado" sin revelar datos

Feature: Stamp Addition

  Scenario: Happy path - Staff añade Stamp
    Given Staff autenticado y activo, Customer con LoyaltyCard activa, cooldown pasado
    When Staff escanea QR → confirma tras ver nombre y stamps
    Then se crea Stamp, stamps_current se incrementa, email "Nuevo sello" enviado

  Scenario: Cooldown activo
    Given último Stamp hace menos de 1 hora
    When Staff intenta añadir Stamp
    Then se rechaza con mensaje de tiempo restante

Feature: Reward Cycle

  Scenario: Customer alcanza umbral
    Given stamps_current = umbral - 1
    When Staff añade Stamp
    Then reward_available, email "Tu reward está listo"

  Scenario: Stamps siguen con reward pendiente
    Given stamps_current >= umbral
    When Staff añade Stamp
    Then stamps_current sigue incrementando, reward sigue disponible

  Scenario: Staff canjea Reward
    Given Customer con reward disponible y stamps_current = 12, umbral = 10
    When Staff canjea
    Then Redemption creada, stamps_current = 2, cycles_completed++, nuevo ciclo

Feature: Security

  Scenario: Vista pública solo muestra datos mínimos
    Given UUID de una LoyaltyCard
    When se accede a la vista pública
    Then solo nombre de pila + stamps + estado reward. Sin email.

  Scenario: Staff no puede acceder a rutas Admin
    Given Staff con role = "staff"
    When accede a /api/admin/*
    Then error 403
```

## Technical Constraints

- **Stack**: Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui
- **DB**: Supabase PostgreSQL. Sin ORM. Supabase client + generated types
- **Auth**: Supabase Auth con magic link para Staff/Admin. Clientes sin auth
- **Email**: Resend (2 templates: "Nuevo sello", "Reward listo")
- **Deploy**: Vercel. Node runtime por defecto
- **Security**: RLS en todas las tablas. anon key para endpoints de cliente, service_role solo para /api/admin/* y /api/stamps/add
- **Validación**: Zod para todos los inputs externos (formularios, API requests, env vars)
- **Server Components** por defecto. "use client" solo cuando se necesiten hooks/eventos
- **Server Actions** para mutaciones. Route Handlers para API endpoints
- **Mobile-first**: Tailwind clases base para móvil, breakpoints para desktop

## Open Questions

- [ ] ¿Qué proveedor de NFC tags se usará? ¿Resistentes a humedad/calor?
- [ ] ¿Dominio definitivo del lounge para configurar las URLs de NFC/QR?
- [ ] ¿Diseño/branding del lounge disponible (logo, colores, tipografía)?
- [ ] ¿Se necesita soporte offline en la PWA de la tarjeta del cliente?
- [ ] ¿Frecuencia esperada de cambio de reward por parte del admin?
