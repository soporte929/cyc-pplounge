# ygg:build

## Al empezar
1. Ejecuta: `ygg phase:next build`
2. Lee PLAN.md completo
3. Lee .yggdrasil/docs/DOMAIN.md (terminología)
4. Lee .yggdrasil/docs/AI_MISTAKES.md (errores a evitar)
5. Ejecuta `ygg build:waves` para obtener el plan de ejecución por waves
6. Lee el output: identifica qué tareas están en wave 1 y su estado
7. Activa el skill **test-driven-development** de Superpowers si está disponible

## Ejecución por waves

Para CADA wave del plan (en orden):

### Wave con 1 tarea → ejecución directa
1. `ygg build:task-start <id>` — marca la tarea como in_progress y setea YGG_TASK_ID
2. Ciclo TDD (ver abajo)
3. `ygg build:task-done <id>` — marca como done y desbloquea dependientes

### Wave con 2+ tareas → subagentes en paralelo
1. Para cada tarea de la wave, lanza un subagente con Agent tool
2. Cada subagente ejecuta: `ygg build:task-start <id>` → Ciclo TDD → `ygg build:task-done <id>`
3. Espera a que TODOS los subagentes terminen antes de pasar a la siguiente wave
4. Commit al completar la wave (ver reglas abajo)

## Ciclo TDD por tarea (OBLIGATORIO, sin excepciones)

### 1. Leer
Lee la descripción de la tarea en PLAN.md. Identifica archivos y criterios.

### 2. Test (RED)
Si la tarea es [RED]: escribe el test. Ejecútalo. DEBE FALLAR.
Si el test pasa inmediatamente → BORRA el test, algo está mal.
Verifica que falla por la razón correcta (no por error de sintaxis).

### 3. Implementar (GREEN)
Si la tarea es [GREEN]: escribe el MÍNIMO código para que el test pase.
YAGNI: no anticipes, no mejores, no añadas extras.
Ejecuta `npm test` → DEBE PASAR (el nuevo + todos los anteriores).

### 4. Verificar
Ejecuta `npm test` (todos los tests, no solo el nuevo).
Si algún test que antes pasaba ahora falla → PARA. Es regresión. Arréglalo antes de continuar.

### 5. Marcar
Ejecuta: `ygg build:task-done <id>`

## Reglas inquebrantables

### Subagentes NO hacen commit
Los subagentes solo escriben código y ejecutan tests. El agente principal es el único que hace commits.

### Commit por wave
Al completar una wave, el agente principal hace UN commit con todas las tareas de esa wave:
`git add -A && git commit -m "feat: wave N — tareas [lista de IDs]"`

### NUNCA código sin test
Si una tarea de implementación no tiene tarea [RED] previa en el plan, PARA y avisa al usuario: "Esta tarea no tiene test previo. ¿Añado un test primero?"

REGLA NUCLEAR: NUNCA escribas código de implementación sin un test fallando primero. Si te descubres escribiendo código sin test, PARA inmediatamente.

### Regresión = STOP
Si un test que antes pasaba ahora falla, NO continues con la siguiente tarea. Arregla la regresión primero.

### Control de contexto
Si notas que el contexto se degrada (respuestas menos precisas, olvidos), sugiere al usuario hacer /compact antes de continuar. El estado de build persiste en state.json, no se pierde.

## Continuación entre sesiones
Si el build se interrumpe (terminal cerrada, sesión nueva):
1. Ejecuta `ygg build:waves` — es idempotente, recalcula el estado actual
2. Identifica waves completadas y tareas pendientes
3. Informa: "Build interrumpido. Wave [N] en progreso. Continúo desde las tareas pendientes."
4. Continúa desde la wave/tarea no completada

## Al terminar todas las tareas
1. Ejecuta `npm test` una última vez — TODO debe pasar
2. Ejecuta `npx tsc --noEmit` — CERO errores
3. Cuenta tests totales. Si ratio tests/archivos-de-implementación < 0.8, escribe los tests que faltan
4. `ygg gate:pass testsRed`
5. `ygg gate:pass testsGreen`
6. `ygg gate:pass refactored`
7. `ygg phase:complete "Build completado: [N] tareas, [M] tests"`
