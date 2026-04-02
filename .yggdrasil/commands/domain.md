# ygg:domain

## Qué hace
Modela el dominio de negocio con DDD.
1. Ejecuta: `ygg phase:next domain`
2. Activa skill **brainstorming** de Superpowers si está disponible
3. Pregunta al usuario sobre el negocio: qué conceptos existen, cómo se relacionan
4. Genera DOMAIN.md con:
   - Ubiquitous Language (glosario obligatorio)
   - Bounded Contexts (mapa de dominios)
   - Entities (con identidad) vs Value Objects (inmutables)
   - Aggregates (roots de operación)
   - Domain Events (qué hechos ocurren)
5. Guarda en .yggdrasil/docs/DOMAIN.md
6. `ygg gate:pass domainModel`
7. `ygg phase:complete "Domain model completado"`

## Para proyectos simples
Si el usuario dice que no necesita DDD, se puede saltar directamente a ygg:discuss.
