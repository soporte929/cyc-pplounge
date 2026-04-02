# ygg:quick

## Sin requisitos de fase
Este comando funciona en cualquier momento. No cambia la fase actual.

## Qué hace
Ejecuta una tarea rápida con TDD mínimo:
1. Activa skill **test-driven-development** de Superpowers si está disponible
2. Si la tarea modifica lógica: escribe test primero, implementa, verifica
3. Si la tarea es cosmética (typo, color, texto): implementa directamente
4. Commit atómico: `git add -A && git commit -m "fix: [descripción]"`

Si el cambio afecta más de 2 archivos o toca dominios críticos (billing, auth, payments), no uses quick — usa ygg:discuss para una feature completa.
