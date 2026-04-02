# ygg:plan

## Al empezar
1. Ejecuta: `ygg phase:next plan`
2. Lee .yggdrasil/docs/CONTEXT.md (fuente de verdad estructurada — ver mapping abajo)
3. Lee .yggdrasil/docs/RESEARCH.md (contexto técnico del codebase)
4. Lee .yggdrasil/docs/SCENARIOS.md (contrato BDD ejecutable)
5. Lee .yggdrasil/docs/DOMAIN.md si existe (nomenclatura)
6. Lee .yggdrasil/docs/AI_MISTAKES.md (errores a evitar en el plan)
7. Activa el skill **writing-plans** de Superpowers si está disponible

## Cómo usar CONTEXT.md en el plan

Cada sección de CONTEXT.md tiene un uso específico. NO re-discutir lo que ya está en Decisions:

| Sección de CONTEXT.md | Cómo usarla en el plan |
|----------------------|------------------------|
| Problem Statement | Preámbulo de la sección ARQUITECTURA — mantén el "por qué" visible |
| Decisions | Constraints arquitectónicos ya decididos — NO re-discutir en el plan |
| Scope IN/OUT | Límites del plan — los OUT se convierten en exclusiones explícitas |
| Acceptance Criteria | Fuente de verdad del mapeo BDD de cada tarea (`BDD: "nombre"`) |
| Technical Constraints | Constraints de implementación por tarea (stack, libs, límites) |
| Open Questions | Riesgos a documentar al inicio del plan; NO bloquean la generación |

## Cómo usar RESEARCH.md en el plan

| Sección de RESEARCH.md | Cómo usarla en el plan |
|------------------------|------------------------|
| Relevant Files | Paths exactos en cada tarea — usa los archivos que Research identificó |
| Existing Patterns | Constraints de estilo — las tareas deben seguir convenciones detectadas |
| Dependencies Available | No duplicar instalaciones — ya están en el proyecto |
| Dependencies Needed | Si hay, crear tarea de instalación ANTES de las tareas que las usen |
| Risks & Constraints | Ordenar tareas: lo riesgoso primero (fail fast). Documentar workarounds |

## Reglas del plan

### Estructura obligatoria
El plan empieza con una sección de ARQUITECTURA antes de las tareas:
- Decisiones arquitectónicas clave (qué patrón, qué estructura)
- Schema de base de datos (modelos, relaciones, constraints)
- Contratos de API (endpoint, método, request schema Zod, response schema, status codes)
- Estas decisiones NO son tareas. Son constraints que todas las tareas respetan.

### Reglas de tareas
- Ninguna tarea toca más de 2 archivos
- Si toca 3+, se divide en sub-tareas
- TODA tarea que crea un archivo .ts de implementación DEBE tener una tarea previa que crea el test
- Las tareas de API route tienen tarea previa de test del endpoint
- Las tareas de UI pueden no tener test unitario pero DEBEN mapear a un escenario BDD

### Mapeo BDD obligatorio
Cada tarea lleva entre paréntesis a qué escenario BDD corresponde:
Tarea 4: [RED] Test — checkAvailability (BDD: "Reserva exitosa", "Mesa ya ocupada")
Si una tarea no mapea a ningún escenario, necesita justificación explícita.

### Presupuesto de tests
Al final del plan, incluir:
Total tareas: N
Total tests esperados: M
Ratio tests/tareas: M/N (objetivo: >= 0.8)
Si el ratio es menor que 0.8, añadir tareas de test.

### Orden TDD obligatorio
Las tareas siguen este patrón estricto:
1. Setup (dependencias, config, schema)
2. Para cada feature: [RED] Test que falla → [GREEN] Implementación mínima
3. API routes: [RED] Test del endpoint → [GREEN] Implementación
4. Refactor final
5. NUNCA: implementación antes de su test

## Formato del plan

\`\`\`markdown
# PLAN: [nombre de la feature]

> Generado desde escenarios BDD en .yggdrasil/docs/SCENARIOS.md
> Fecha: [timestamp]

## Arquitectura
[Decisiones de diseño, schemas, contratos de API]

## Tareas

### Tarea 1: [Setup/Configuración]
- **Archivos**: [lista de archivos a crear/modificar]
- **Acción**: [qué hacer exactamente]
- **Verificación**: [comando para confirmar que está hecho]
- **BDD**: [escenario(s) que cubre]

### Tarea 2: [RED] Test — [nombre]
- **Archivos**: \`src/__tests__/[nombre].test.ts\`
- **Acción**: Escribir test que FALLA
- **Verificación**: test FALLA por razón correcta
- **BDD**: [escenario(s) que cubre]

### Tarea 3: [GREEN] Implementar [nombre]
- **Archivos**: \`src/[módulo].ts\`
- **Acción**: Implementación MÍNIMA
- **Verificación**: \`npm test\` pasa (nuevo + todos anteriores)
- **BDD**: [escenario(s) que cubre]

## Presupuesto de tests
Total tareas: N
Total tests esperados: M
Ratio tests/tareas: M/N
\`\`\`

## Al terminar
1. Muestra plan completo al usuario
2. Espera revisión con marcas [JOFRE] si hay cambios
3. 2-3 rondas de refinamiento
4. Ejecuta `ygg plan:check` para validar estructura
5. Spawna el subagente plan-checker-agent para validación semántica
6. Si el checker reporta errores: corrige el plan y repite desde paso 4
7. Al aprobar: `ygg gate:pass planApproved`
8. Cuenta tareas y actualiza totalTasks en state
9. `ygg phase:complete "Plan aprobado con [N] tareas"`
