# ygg:retro

## Al empezar
1. Ejecuta: `ygg phase:next retro`

## 5 secciones obligatorias

### 1. Análisis de causa raíz
Para CADA error encontrado en review:
- ¿Qué error fue?
- ¿En qué fase DEBERÍA haberse detectado?
- ¿Por qué no se detectó antes?
- ¿Qué cambio en el proceso lo prevendría?

Ejemplo: "totalEstimateInCents del cliente → debería detectarse en discuss (ronda seguridad) → no existía ronda de seguridad → AÑADIR ronda de seguridad al discuss"

### 2. Métricas del ciclo
Tareas completadas: N
Tests escritos: M
Ratio tests/tareas: M/N
Criticals en review: X
Warnings en review: Y
Escenarios BDD: Z

### 3. Qué funcionó / Qué mejorar
Pregunta al usuario:
- "¿Qué fase fue más útil?"
- "¿Qué fase sintió como overhead innecesario?"
- "¿La IA cometió algún error que debería recordar?"

### 4. Actualizar AI_MISTAKES.md
Para cada error nuevo, añadir entrada con formato:
\`\`\`markdown
## [Título corto del error]
- **Severidad:** CRITICAL / HIGH / MEDIUM / LOW
- **Dominio:** payments / auth / api / ui / database / general
- **Síntoma:** Qué pasó
- **Causa:** Por qué pasó
- **Fix:** Cómo se arregló
- **Regla:** Qué hacer siempre para evitarlo
- **Detectado en:** review / verify / producción
- **Debería detectarse en:** discuss / plan / build
\`\`\`

Si un error aparece 3+ veces en AI_MISTAKES.md → sugiere crear un hook o regla.

### 5. Actualizar memory.md
Para cada patrón reutilizable:
\`\`\`markdown
## [Nombre del patrón]
- **Dominio:** payments / auth / api / database / general
- **Problema:** Qué resuelve
- **Solución:** Código o patrón (snippet corto)
- **Usado en:** [proyecto/feature]
\`\`\`

Si un patrón aparece 3+ veces en memory.md → sugiere crear un template.

## Al terminar
1. `ygg gate:pass retroDone`
2. `ygg phase:complete "Retro completada: [N] errores documentados, [M] patrones guardados"`
3. `ygg retro:push-global` — sincroniza errores nuevos al archivo global (~/.yggdrasil/global-mistakes.md) para que estén disponibles en todos los proyectos futuros.
