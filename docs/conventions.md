# Convenciones

## Alias de importación

Cada app define estos alias en su `tsconfig.json`:

| Alias | Apunta a |
| --- | --- |
| `@/*` | `src/*` de la propia app (interno) |
| `@ui` | `@shein/ui` |
| `@types` | `@shein/types` |
| `@utils` | `@shein/utils` |
| `@shared` | `@shein/shared` |
| `@database` | `@shein/database` |
| `@config` | `@shein/config` |

> El acceso a la base de datos se hace **siempre** vía el paquete
> `@shein/database` (o el re-export `@/lib/prisma` en admin-web) para
> garantizar una única instancia del cliente Prisma.

## Orden de imports

1. Librerías externas (`react`, `next`, `zod`, …).
2. Paquetes internos (`@shein/*` / alias `@ui`, `@utils`, …).
3. Imports relativos de la app (`@/…`, `./…`).

Separar cada grupo con una línea en blanco.

## Estilo

- **Prettier** (config en `@shein/config/prettier`): comillas dobles, `;`,
  `trailingComma: all`, ancho 80.
- **ESLint** flat config; cada app extiende la base de `@shein/config`.
- TypeScript en modo `strict` en todo el monorepo.
- Sin código muerto ni duplicado (DRY).

## Commits

Convención tipo _Conventional Commits_: `tipo(scope): descripción`
(p. ej. `feat(admin-web): …`, `chore(database): …`).
