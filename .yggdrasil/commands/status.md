# ygg:status

## Sin requisitos
Ejecuta `ygg status` y muestra el resultado al usuario.
Si no es un proyecto YGGDRASIL, di: "Este directorio no es un proyecto YGGDRASIL. Ejecuta ygg init para inicializarlo."

## Información mostrada
- Fase actual (currentPhase)
- Modo (currentMode)
- Gates: cuáles están passed, cuáles pending
- Progreso de build si está en fase build (completedTasks/totalTasks)
- Historial de fases completadas
