# ygg:research

## Al empezar
1. Ejecuta: `ygg phase:next research`
2. Lee .yggdrasil/docs/CONTEXT.md (fuente de verdad del brainstorm)

## Proceso
Spawna el subagente `research-agent` con Agent tool:
- Input: el contenido de CONTEXT.md
- El agente investiga el codebase, dependencias y docs
- Genera .yggdrasil/docs/RESEARCH.md

## Esperar resultado
1. Revisa el RESEARCH.md generado
2. Muéstralo al usuario para revisión
3. Espera aprobación explícita

## Al terminar
1. `ygg gate:pass researchComplete`
2. `ygg phase:complete "Research completado"`
