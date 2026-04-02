# Design System — Phi Phi Lounge

> Extraído de los mockups HTML de Stitch. Referencia obligatoria para todas las tareas de UI.

## Brand

- **Nombre**: PHI PHI LOUNGE
- **Estilo**: Dark luxury, editorial, high-end
- **Estética**: Oro sobre negro, minimalista, tipografía bold

## Tipografía

| Uso | Fuente | Peso | Estilo |
|-----|--------|------|--------|
| Headlines (h1-h3) | Manrope | 700-800 (bold/extrabold) | uppercase, tracking-tighter |
| Body text | Inter | 400-500 | Normal |
| Labels | Inter | 500-600 | uppercase, tracking-widest, text-[10px] |
| Brand name | Manrope | 900 (black) | uppercase, tracking-widest |

## Paleta de colores (Material Design 3 tokens)

### Core
| Token | Hex | Uso |
|-------|-----|-----|
| primary | #e6c364 | Acciones principales, iconos activos, borders de acento |
| on-primary | #3d2e00 | Texto sobre primary (botones) |
| primary-container | #c9a84c | Badges, containers de acento |
| background | #131313 | Fondo principal |
| surface | #131313 | Fondo de página |
| on-surface | #e5e2e1 | Texto principal |
| on-surface-variant | #d0c5b2 | Texto secundario, labels |

### Surfaces (de más oscuro a más claro)
| Token | Hex | Uso |
|-------|-----|-----|
| surface-container-lowest | #0e0e0e | Sidebar, app bar, stamps vacíos |
| surface-container-low | #1c1b1b | Cards de fondo, inputs |
| surface-container | #201f1f | Containers intermedios |
| surface-container-high | #2a2a2a | — |
| surface-container-highest | #353534 | Cards principales, loyalty card surface |

### Otros
| Token | Hex | Uso |
|-------|-----|-----|
| outline | #99907e | Borders visibles |
| outline-variant | #4d4637 | Borders sutiles (border-white/5 en práctica) |
| error | #ffb4ab | Mensajes de error |
| secondary | #d8c598 | Texto nav inactivo |

## Componentes clave

### TopAppBar (header)
- Fixed top, h-16, bg-[#0e0e0e]
- Border inferior: `border-b border-[#e6c364]/10`
- Shadow: `shadow-[0_4px_40px_rgba(230,195,100,0.04)]`
- Logo "PHI PHI LOUNGE" en primary, font-black, tracking-widest, uppercase
- Avatar circular 32px con border primary/20

### Sidebar (admin)
- Fixed left, w-72, bg-[#0e0e0e]
- Nav items: Manrope font-semibold, tracking-tight
- Active: `bg-primary/10 text-primary border-l-4 border-primary`
- Inactive: `text-on-surface-variant opacity-80 hover:bg-white/5`
- Iconos: Material Symbols Outlined 20px

### Cards (admin dashboard metrics)
- bg-[#1A1A1A] (surface-card custom)
- `p-8 rounded-xl border-l-4 border-primary`
- Shadow: `shadow-[0_4px_40px_rgba(230,195,100,0.02)]`
- Label: 10px uppercase tracking-widest
- Value: text-4xl font-headline font-black

### Reward Cards (bento grid)
- bg-surface-container-low rounded-xl p-6
- `border border-white/5 hover:border-primary/20`
- Icon container: `p-3 bg-surface-container-highest rounded-lg text-primary`
- Toggle active: `w-8 h-4 bg-primary rounded-full`
- Toggle inactive: `w-8 h-4 bg-surface-container-highest rounded-full`
- Inactive card: `opacity-60 grayscale hover:grayscale-0 hover:opacity-100`

### Stamp Grid (loyalty card)
- Grid 5 columnas: `grid grid-cols-5 gap-4`
- Stamp lleno: `aspect-square rounded-full bg-primary` con icon mode_fan filled
- Stamp vacío: `aspect-square rounded-full bg-surface-container-lowest border border-outline-variant/30`
- Último stamp (reward): icon `redeem` en primary/40
- Shadow en stamps llenos: `shadow-[0_0_15px_rgba(230,195,100,0.3)]`

### QR Scanner (staff panel)
- Container: `aspect-square bg-surface-container-low rounded-[2rem]`
- Esquinas de escáner: borders 4px primary, 40x40px en cada esquina
- Indicador: barra animada primary con pulse

### Formulario de onboarding
- Inputs: `bg-[#1c1b1b] border-0 px-5 py-4 rounded-xl`
- Focus: `focus:ring-1 focus:ring-primary/40 focus:bg-[#353534]`
- Labels: `text-[10px] uppercase tracking-widest text-on-surface-variant`
- CTA: `bg-primary text-on-primary font-headline font-bold uppercase tracking-widest py-5 rounded-md`

### Bottom Nav (mobile)
- Fixed bottom, backdrop-blur-xl
- `bg-[#131313]/80 border-t border-white/5`
- `shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`
- Active tab: text-primary, scale-110, font-bold, icon FILL 1
- Inactive: text-[#d0c5b2] opacity-60
- Labels: 10px uppercase tracking-widest

### Edit Modal/Drawer
- Slide from right: `max-w-lg bg-[#0e0e0e] h-full`
- Overlay: `bg-black/80 backdrop-blur-sm`
- Border: `border-l border-primary/10`
- Actions grid: `grid grid-cols-2 gap-4` (Discard / Save)

### Table (admin)
- Header: `bg-surface-container-low/50`, text 10px uppercase tracking-widest
- Rows: `hover:bg-white/[0.02]`, divide-y divide-outline-variant/5
- Avatar initials: `w-8 h-8 rounded bg-surface-container-highest text-[10px] font-bold text-primary`
- Status badges: `px-2 py-1 rounded-md bg-green-500/10 text-green-400` o equivalente

## Iconos
- Material Symbols Outlined (no Filled por defecto)
- Filled solo para: iconos activos en nav, stamps llenos, brand icons
- Tamaño por defecto: 24px (text-xl para nav, text-3xl para feature icons)

## Patrones de layout
- Admin: sidebar fijo + main scrollable con max-w-6xl
- Staff: mobile-first, max-w-md centered
- Customer card: mobile-first, max-w-md centered
- Onboarding: mobile-first, max-w-md centered, sin bottom nav

## Screens documentados
1. **Onboarding Form** — `/register`
2. **Welcome Screen** — post-registro (con wallet buttons placeholder)
3. **Web Loyalty Card** — `/card/[cardId]`
4. **Staff Panel** — `/scan` (QR scanner)
5. **Admin Dashboard** — `/dashboard`
6. **Rewards Configuration** — `/rewards` (con edit drawer)
