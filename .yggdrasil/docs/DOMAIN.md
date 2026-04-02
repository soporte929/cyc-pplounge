# Domain Model — Ubiquitous Language

> Este documento define el lenguaje compartido del dominio.
> Claude Code debe usar SIEMPRE estos términos, nunca sinónimos genéricos.

## Bounded Contexts

### Onboarding Context
Responsable del registro de clientes y generación de su tarjeta de fidelización.
Punto de entrada: NFC tag o QR estático en mesa → URL de registro.

### Loyalty Context
Responsable de la acumulación de sellos (stamps), gestión de ciclos y canje de rewards.

### Admin Context
Responsable de la configuración del negocio, gestión de staff y rewards, y métricas del dashboard.

## Entities

### Customer
- id: UUID (generado automáticamente)
- email: string (unique, identificador principal)
- name: string
- marketing_consent: boolean (GDPR)
- created_at: timestamptz

### LoyaltyCard
- id: UUID
- customer_id: UUID (1:1 con Customer)
- stamps_current: int (puede superar el umbral si hay reward pendiente)
- cycles_completed: int
- active_reward_id: UUID (reward bajo el que se acumulan sellos en el ciclo actual, inmutable hasta fin de ciclo)
- is_active: boolean
- created_at: timestamptz
- updated_at: timestamptz

### Stamp
- id: UUID
- card_id: UUID
- added_by: UUID (Staff que lo añadió)
- created_at: timestamptz
- notes: text (opcional)

### Reward
- id: UUID
- name: string
- description: text
- stamps_required: int (umbral de sellos)
- is_active: boolean (solo uno activo a la vez, globalmente)
- created_at: timestamptz

### Redemption
- id: UUID
- card_id: UUID
- reward_id: UUID (el reward que se canjeó)
- redeemed_by: UUID (Staff que procesó el canje)
- redeemed_at: timestamptz
- cycle_number: int

### Staff
- id: UUID
- email: string (unique)
- name: string
- role: "staff" | "admin"
- is_active: boolean
- created_at: timestamptz

### BusinessConfig
- id: UUID (singleton, un solo registro)
- business_name: string
- logo_url: text
- primary_color: string (hex)
- welcome_message: text
- pass_strip_message: text
- updated_at: timestamptz

## Value Objects

### Email
- value: string
- Validación: formato email válido, unique en la tabla correspondiente

### StampCooldown
- Duración: 1 hora
- Regla: no se puede añadir otro stamp al mismo customer en menos de 1 hora

### CycleState
- Estados posibles del ciclo de una LoyaltyCard:
  - **accumulating**: acumulando stamps hacia el umbral
  - **reward_available**: alcanzó el umbral, reward pendiente de canje (sigue acumulando)
  - **redeeming**: staff procesando el canje

## Aggregates

### LoyaltyCardAggregate
- Root: LoyaltyCard
- Contains: Stamp[], Redemption[]
- Invariants:
  - stamps_current >= 0
  - Si is_active = false → no se pueden añadir stamps
  - Si Staff.is_active = false → no puede añadir stamps ni canjear
  - Cooldown de 1 hora entre stamps para el mismo card
  - active_reward_id se asigna al inicio del ciclo y no cambia hasta fin de ciclo
  - Al canjear: stamps_current -= reward.stamps_required, cycles_completed++, nuevo ciclo con reward activo actual

## Domain Events

### CustomerRegistered
- customerId: UUID
- email: string
- registeredAt: timestamptz

### StampAdded
- cardId: UUID
- staffId: UUID
- stampsNow: int
- addedAt: timestamptz
- Trigger: enviar email "Nuevo sello"

### RewardUnlocked
- cardId: UUID
- rewardId: UUID
- unlockedAt: timestamptz
- Trigger: enviar email "Tu reward está listo"

### RewardRedeemed
- cardId: UUID
- rewardId: UUID
- staffId: UUID
- cycleNumber: int
- redeemedAt: timestamptz

### CardDeactivated
- cardId: UUID
- deactivatedAt: timestamptz
- Effect: stamps_current se reinicia a 0
