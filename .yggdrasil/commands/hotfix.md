# ygg:hotfix

## Sin requisitos de fase
Emergencia. Se ejecuta inmediatamente.

## Flujo de emergencia
1. Diagnostica: ¿qué está roto y por qué?
2. Si existe AI_MISTAKES.md, busca si es un error conocido → fix directo
3. Activa skill **systematic-debugging** de Superpowers si está disponible
4. Escribe UN test que reproduce el bug
5. Implementa el fix mínimo
6. Verifica: `npm test` — el test nuevo pasa, los demás siguen pasando
7. Commit: `git add -A && git commit -m "hotfix: [descripción del bug]"`
8. Documenta en AI_MISTAKES.md con formato de retro

## Después del hotfix
Sugiere al usuario: "Hotfix aplicado. Recomiendo hacer un retro rápido para documentar el error y prevenir que se repita."
