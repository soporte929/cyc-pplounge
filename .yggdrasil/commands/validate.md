# ygg:validate

## Al empezar
1. Ejecuta: `ygg phase:next validate`

## Verificación de cobertura de specs
Ejecuta: `ygg validate`

### Si hay gaps (escenarios sin test):
1. Para cada escenario sin cobertura, crea el test faltante siguiendo TDD:
   - Escribe el test que falla (red)
   - Implementa el mínimo código para que pase (green)
   - Refactoriza si es necesario
2. Re-ejecuta: `ygg validate`
3. Repite hasta que todos los escenarios estén cubiertos

### Si todo cubierto:
`ygg phase:next retro` para avanzar a retrospectiva.

## Reglas
- NO hacer cambios funcionales en esta fase — solo tests nuevos si faltan
- Cada test nuevo debe seguir el patrón: `it("should [scenario title lowercased]", ...)`
- Los tests deben vivir en `src/__tests__/`

## Al terminar
`ygg validate` marca el gate validated automáticamente. Solo necesitas:
`ygg phase:complete "Validate completado: [N]/[N] escenarios cubiertos"`
