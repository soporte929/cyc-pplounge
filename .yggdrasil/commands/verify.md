# ygg:verify

## Al empezar
1. Ejecuta: `ygg phase:next verify`
2. Activa skill **verification-before-completion** de Superpowers si está disponible

## 4 niveles de verificación

### Nivel 1: Tests automatizados
Ejecuta: `npm test`
TODOS deben pasar. Si alguno falla, PARA.

### Nivel 2: TypeScript + Audit
\`\`\`bash
npx tsc --noEmit
npm audit --audit-level=high
\`\`\`
Si npm audit tiene vulnerabilidades high/critical, intenta `npm audit fix`.
Si persisten, documenta en REVIEW.md y avisa al usuario.

### Nivel 3: Escenarios BDD
Lee .yggdrasil/docs/SCENARIOS.md.

Si el proyecto tiene Playwright-BDD configurado:
\`\`\`bash
npx bddgen && npx playwright test
\`\`\`

Si NO tiene Playwright:
Para cada escenario BDD, genera un test manual verificable. Ejemplo:
Escenario: Reserva exitosa
Verifica: curl -X POST localhost:3000/api/reservations -H "Content-Type: application/json" -d '{"slotId":"...","date":"...","partySize":3}'
Respuesta esperada: 201 con campo "status": "confirmed"
Presenta al usuario y pide confirmación de cada escenario.

### Nivel 4: UAT conversacional
Pregunta al usuario:
- "¿Has verificado visualmente que [funcionalidad principal] funciona?"
- "¿Has probado el flujo de error más importante?"
- "¿Hay algo que no se vea bien o no funcione como esperabas?"

## Al terminar
1. `ygg gate:pass verified`
2. `ygg phase:complete "Verify completado: [N] tests, [M] escenarios BDD verificados"`
