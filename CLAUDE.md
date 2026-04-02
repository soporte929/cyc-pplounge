# YGGDRASIL - The World Tree Protocol v2

## Estado
Al inicio de cada sesión, lee .yggdrasil/state.json para saber
en qué fase estás y qué gates están completados.

## Regla fundamental
NUNCA ejecutes un comando ygg:* si sus requisitos de estado
no se cumplen. Lee state.json, verifica los gates, y si falta
algo, dile al usuario qué debe hacer primero.

IMPORTANTE: Los comandos ygg:* NO llevan barra inicial. Si usas
/ygg:discuss, Claude Code lo interpreta como un skill registrado
y falla. Usa siempre ygg:discuss (sin barra).

## Comandos disponibles
Cuando el usuario pida uno de estos comandos, lee el archivo
de instrucciones correspondiente y síguelo al pie de la letra:

| Comando | Instrucciones | Requisito |
| ygg:status | .yggdrasil/commands/status.md | Ninguno |
| ygg:domain "..." | .yggdrasil/commands/domain.md | phase = idle |
| ygg:discuss "..." | .yggdrasil/commands/discuss.md | phase = idle |
| ygg:research | .yggdrasil/commands/research.md | contextReady = passed |
| ygg:plan | .yggdrasil/commands/plan.md | brainstorm = passed |
| ygg:spec | .yggdrasil/commands/spec.md | planApproved = passed |
| ygg:build | .yggdrasil/commands/build.md | planApproved = passed |
| ygg:review | .yggdrasil/commands/review.md | testsGreen = passed |
| ygg:verify | .yggdrasil/commands/verify.md | reviewed = passed |
| ygg:retro | .yggdrasil/commands/retro.md | verified = passed |
| ygg:ship | .yggdrasil/commands/ship.md | TODOS gates = passed |
| ygg:quick "..." | .yggdrasil/commands/quick.md | Ninguno |
| ygg:hotfix "..." | .yggdrasil/commands/hotfix.md | Ninguno |

## Subagentes disponibles
Para tareas específicas, spawna estos agentes con Agent tool:
- .claude/agents/code-reviewer.md — Review de calidad (Opus)
- .claude/agents/security-reviewer.md — Auditoría de seguridad 3 fases con evidencia (Opus)
- .claude/agents/brainstorm-challenger.md — Abogado del diablo (Opus)
- .claude/agents/research-agent.md — Research pre-plan (Sonnet)
- .claude/agents/plan-checker-agent.md — Validación semántica de PLAN.md (Sonnet)

## Archivos de contexto
- .yggdrasil/docs/DOMAIN.md -> Ubiquitous Language. Usa SIEMPRE
- .yggdrasil/docs/AI_MISTAKES.md -> Consulta ANTES de implementar
- .yggdrasil/docs/memory.md -> Patrones probados. Reutiliza

## Reglas de oro
1. NUNCA escribas código sin test fallando primero
2. NUNCA saltes una fase sin completar la anterior
3. Usa el Ubiquitous Language de DOMAIN.md
4. Commit atómico por cambio funcional: 1 tarea → 1 tick → 1 commit
5. Si llevas 3 intentos fallidos: PARA y diagnostica

## Stack Rules — Next.js 15 + Supabase + Tailwind

### Next.js App Router
- Server Components por defecto. Marcar "use client" SOLO cuando se necesiten hooks o eventos del browser.
- NUNCA usar Pages Router. Todo en App Router.
- File-system routing: page.tsx, layout.tsx, loading.tsx, error.tsx.
- Server Actions para mutaciones de datos.
- Next.js Image para TODAS las imágenes (optimización automática).
- Metadata API (generateMetadata) para SEO. No usar <Head>.
- Route Handlers (route.ts) para API endpoints. No usar pages/api/.

### Supabase
- DOS clientes distintos: createServerClient (Server Components/Actions) y createBrowserClient (Client Components).
- NUNCA exponer service_role key en el cliente. Solo anon key en el browser.
- Row Level Security (RLS) en TODAS las tablas, sin excepciones.
- Testear RLS con un usuario diferente al que creó el dato.
- NUNCA hacer select sin filtro en tablas con RLS — siempre usar .eq() o equivalente.
- Supabase Auth con PKCE flow.
- Migraciones en supabase/migrations/, versionadas en git.

### Tailwind CSS
- No escribir CSS custom salvo casos excepcionales.
- Theme config para colores, tipografía y spacing.
- Mobile-first: clases base para móvil, sm/md/lg para desktop.
- No abusar de @apply.

### TypeScript
- Strict mode siempre. CERO any.
- Tipar todos los props de componentes.
- Zod para validar datos del exterior (formularios, API responses, env vars).

### Vercel
- Variables de entorno en .env.local (desarrollo), Vercel dashboard (producción).
- NUNCA commitear .env.local.
- Node runtime por defecto. Edge runtime solo cuando sea necesario.

### General
- No instalar dependencias sin justificación.
- Preferir APIs nativas del framework.
- No usar ORMs — Supabase client es suficiente.
- No usar state management global (Zustand, Redux) salvo necesidad real demostrada.

## HANDOFF.md — Session handoff
Cuando el hook `post-tool-use-context.sh` indique nivel crítico de contexto, lee .yggdrasil/templates/handoff-template.md y genera `.yggdrasil/HANDOFF.md` con ese formato.
