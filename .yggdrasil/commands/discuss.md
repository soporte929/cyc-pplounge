# ygg:discuss

## Al empezar
1. Ejecuta: `ygg phase:next discuss`
2. Si existe .yggdrasil/docs/DOMAIN.md → léelo, usa su terminología
3. Si existe .yggdrasil/docs/AI_MISTAKES.md → léelo, ten en cuenta errores pasados
4. Activa el skill de **brainstorming** de Superpowers si está disponible

## 5 Rondas obligatorias (NO saltar ninguna)

### Ronda 1 — Alcance y usuarios
- ¿Quién usa esto? ¿Qué problema resuelve?
- ¿Qué alternativas existen? ¿Por qué construir en vez de comprar?
- ¿Cuál es el alcance mínimo viable?

### Ronda 2 — Edge cases y riesgos
- ¿Qué pasa si falla? ¿Qué pasa con datos concurrentes?
- ¿Qué pasa con volumen? ¿10 usuarios vs 10.000?
- ¿Qué dependencias externas son críticas?

### Ronda 3 — Seguridad y datos (OBLIGATORIA — previene bugs antes de que existan)
- ¿Qué datos vienen del cliente? ¿Cuáles se calculan en backend?
- ¿Qué inputs puede manipular un usuario malicioso?
- ¿Qué datos son sensibles? ¿Dónde se almacenan?
- ¿Qué superficie de ataque existe?
- ¿Hay montos/precios? → SIEMPRE server-side, NUNCA del cliente

### Ronda 4 — Criterios de éxito
- ¿Cómo sabemos que funciona? ¿Qué es "done"?
- ¿Qué métricas importan?

### Ronda 5 — Abogado del diablo
Spawna el subagente `brainstorm-challenger` (Opus) con Agent tool:
Analiza esta feature: [descripción + decisiones de rondas 1-4]
Encuentra razones por las que va a fallar.
Presenta los riesgos al usuario. Discute mitigaciones.

## Generar escenarios BDD
Después de las 5 rondas, genera escenarios en Gherkin (Given/When/Then).

Escenarios OBLIGATORIOS (mínimo 6):
- 1+ happy path
- 1+ error de negocio (ej: recurso no disponible)
- 1+ error de pago/infraestructura (ej: API caída, pago rechazado)
- 1+ escenario de seguridad (ej: usuario malicioso manipula input)
- 1+ escenario de datos inválidos (ej: input basura, campos vacíos)
- 1+ escenario de concurrencia (ej: dos usuarios al mismo tiempo)

Usa SOLO terminología de DOMAIN.md si existe.

Formato:
\`\`\`gherkin
Feature: [nombre de la feature]

  Scenario: [happy path - descripción]
    Given [contexto inicial]
    When [acción del usuario]
    Then [resultado esperado]
\`\`\`

## Generar CONTEXT.md (OBLIGATORIO antes de SCENARIOS.md)
Después de las 5 rondas y los escenarios BDD, genera .yggdrasil/docs/CONTEXT.md con estas 6 secciones:

\`\`\`markdown
## Problem Statement
[Qué problema resolvemos y para quién — 2-4 oraciones]

## Decisions
| Decisión | Alternativas consideradas | Rationale |
|----------|--------------------------|-----------|
[Una fila por decisión clave de las rondas 1-4]

## Scope
### IN
[Lista de qué SÍ entra en esta feature]
### OUT
[Lista de qué NO entra — explícito es obligatorio]

## Acceptance Criteria
[Escenarios BDD Given/When/Then — copia los de SCENARIOS.md]

## Technical Constraints
[Stack, límites, dependencias — usa terminología de DOMAIN.md si existe]

## Open Questions
- [ ] [Lo que quedó sin resolver]
\`\`\`

## Al terminar
1. Guarda CONTEXT.md en .yggdrasil/docs/CONTEXT.md (con las 6 secciones completas)
2. Guarda escenarios en .yggdrasil/docs/SCENARIOS.md
3. Guarda .feature files en features/ si el proyecto usa Playwright-BDD
4. Muestra CONTEXT.md al usuario para revisión
5. Espera aprobación EXPLÍCITA
6. Al aprobar:
   - `ygg gate:pass brainstorm`
   - `ygg gate:pass contextReady`
7. `ygg phase:complete "Brainstorm completado con [N] escenarios BDD y CONTEXT.md"`
