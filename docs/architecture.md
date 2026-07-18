# Arquitectura

## Objetivo

Un **monorepo** que soporta tres aplicaciones sobre una base tecnológica
compartida, sin duplicar código. Las tres consumen los mismos paquetes:
base de datos, tipos, utilidades, constantes y configuración.

## Herramientas

- **npm workspaces** — gestión de paquetes del monorepo (un único lockfile).
- **Turborepo** — orquestación y caché de tareas (`dev`, `build`, `lint`).
- **TypeScript** — tipado en todo el ecosistema.
- **Prisma + PostgreSQL (Supabase)** — capa de datos compartida.

## Mapa de dependencias

```
apps/admin-web ─┐
apps/mobile     ├─▶ @shein/database  (Prisma: acceso a datos)
apps/store-web ─┤   @shein/types     (tipos de dominio)
                ├─▶ @shein/utils     (utilidades puras)
                ├─▶ @shein/shared    (constantes, enums, permisos)
                ├─▶ @shein/ui        (design system — apps web)
                └─▶ @shein/config    (tsconfig, eslint, prettier, tailwind)
```

Regla de oro: **las apps dependen de los paquetes; los paquetes no dependen
de las apps**. Entre paquetes, las dependencias van de lo genérico
(`config`, `utils`, `types`, `shared`) hacia lo específico (`ui`, `database`).

## Capas (Clean Architecture)

1. **Dominio** — `@shein/types`, `@shein/shared` (tipos, enums, reglas).
2. **Datos** — `@shein/database` (Prisma, queries, helpers).
3. **Aplicación** — servicios/casos de uso dentro de cada app.
4. **Presentación** — UI de cada app (`@shein/ui` para web; RN para mobile).

## Estado actual

- `admin-web`: Panel funcional (auth, dashboard, productos, ventas, archivo,
  estadísticas, auditoría, usuarios). Su código de dominio/UI se irá
  extrayendo a los paquetes compartidos de forma incremental.
- `mobile` / `store-web`: estructura reservada, sin desarrollo.
- Paquetes `ui`, `types`, `utils`, `shared`: estructura preparada para recibir
  el código compartido sin duplicación.
