# ygg:ship

## Al empezar
1. Activa skill **finishing-a-development-branch** de Superpowers si está disponible

## Checklist ejecutado (cada check se ejecuta realmente)

### Tests y tipos
\`\`\`bash
npm test                    # Captura output, todos deben pasar
npx tsc --noEmit            # Captura output, cero errores
\`\`\`

### Seguridad
\`\`\`bash
npm audit --audit-level=high
grep -rn "console.log" src/ --include="*.ts" --include="*.tsx"
grep -rn "any" src/ --include="*.ts" --include="*.tsx"
\`\`\`

### Secretos
\`\`\`bash
grep -rn "sk_\\|pk_\\|secret\\|password\\|api_key" src/ --include="*.ts" --include="*.tsx" -i
\`\`\`

### .env.example actualizado
Verifica que todas las env vars usadas en código están documentadas:
\`\`\`bash
grep -rn "process.env\\." src/ --include="*.ts" -h | sort -u
\`\`\`
Compara contra .env.example — si hay vars sin documentar, añádelas.

## Si algún check falla
NO proceder. Arreglar y re-ejecutar.

## Si todo pasa
1. Archiva PLAN.md → `.yggdrasil/archive/PLAN-[fecha]-[descripcion].md`
2. Archiva REVIEW.md → `.yggdrasil/archive/REVIEW-[fecha]-[descripcion].md`
3. Commit final: `git add -A && git commit -m "chore: ship [feature] — all gates passed"`
4. Si hay remote: crea PR con descripción auto-generada desde PLAN.md y SCENARIOS.md
5. `ygg phase:complete "Ship: [feature] desplegada"`
6. Muestra resumen: "Feature shipped! Estado reseteado. Listo para la siguiente feature."
