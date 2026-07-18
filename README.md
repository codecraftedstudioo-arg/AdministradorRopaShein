# SHEIN Platform · Monorepo

Ecosistema de software para la gestión y venta de prendas únicas provenientes
de **Mystery Boxes de SHEIN**. Un único repositorio, una única base
tecnológica, tres aplicaciones.

## Aplicaciones

| App | Descripción | Estado |
| --- | --- | --- |
| [`apps/admin-web`](./apps/admin-web) | Panel administrativo (Next.js) | En desarrollo |
| [`apps/mobile`](./apps/mobile) | App para empleados (React Native + Expo) | Estructura preparada |
| [`apps/store-web`](./apps/store-web) | Tienda online | Reservado |

## Paquetes compartidos

| Paquete | Responsabilidad |
| --- | --- |
| [`@shein/database`](./packages/database) | Prisma: schema, migraciones, seed, cliente |
| [`@shein/ui`](./packages/ui) | Design system / componentes reutilizables |
| [`@shein/types`](./packages/types) | Tipos de dominio compartidos |
| [`@shein/utils`](./packages/utils) | Utilidades puras (formatters, validators, …) |
| [`@shein/shared`](./packages/shared) | Constantes, enums, permisos, config global |
| [`@shein/config`](./packages/config) | tsconfig, eslint, prettier, tailwind |

## Requisitos

- Node.js **18.18+**
- npm **9+** (workspaces)
- Una base de datos **PostgreSQL** (p. ej. Supabase)

## Puesta en marcha

```bash
npm install                     # instala el workspace y genera el cliente Prisma
# configurar apps/admin-web/.env (ver apps/admin-web/README.md)
npm run db:migrate              # aplica migraciones
npm run db:seed                 # datos iniciales
npm run dev                     # levanta las apps (Turborepo)
```

## Scripts raíz

| Script | Descripción |
| --- | --- |
| `npm run dev` | Modo desarrollo (todas las apps) |
| `npm run build` | Build de todo el monorepo |
| `npm run lint` | Lint de todo el monorepo |
| `npm run typecheck` | Chequeo de tipos |
| `npm run db:generate` | Genera el cliente Prisma |
| `npm run db:migrate` | Migraciones (dev) |
| `npm run db:seed` | Carga datos iniciales |
| `npm run db:studio` | Prisma Studio |

## Herramientas

**npm workspaces** + **Turborepo** · **TypeScript** · **Prisma + PostgreSQL**

## Documentación

Ver [`/docs`](./docs): arquitectura, estructura, convenciones, nombres y
buenas prácticas.
