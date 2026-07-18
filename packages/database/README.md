# @shein/database

Capa de datos **compartida** por las tres aplicaciones del ecosistema
(admin-web, mobile, store-web). Es la única fuente de verdad del modelo.

## Estructura

```
packages/database/
├── prisma/
│   ├── schema.prisma     # Modelo de datos definitivo (fuente de verdad)
│   ├── seed.ts           # Estructura de seed (sin datos por ahora)
│   └── migrations/       # Migraciones versionadas (SQL)
└── src/
    ├── client.ts         # Singleton de PrismaClient
    ├── index.ts          # API pública del paquete
    ├── services/         # Servicios de acceso a datos (estructura, sin lógica)
    ├── helpers/          # Utilidades de BD (preparado)
    └── queries/          # Consultas reutilizables (preparado)
```

## Modelo definitivo

Modelos: `Rol`, `Usuario`, `Prenda`, `Imagen`, `Venta`, `Auditoria`,
`Configuracion`. PK **UUID**, `createdAt`/`updatedAt`, borrado lógico
(`deletedAt`) en `Usuario` y `Prenda`. Enums: `Genero`, `Categoria`,
`Estado`, `CanalVenta`.

## Uso desde una app

```ts
import { prisma, type Prenda, Estado } from "@shein/database";

const prendas = await prisma.prenda.findMany({
  where: { estado: Estado.DISPONIBLE },
});
```

## Scripts (ejecutar desde la raíz del monorepo)

| Comando | Descripción |
| --- | --- |
| `npm run db:generate` | Genera el cliente Prisma |
| `npm run db:push` | Sincroniza el schema con la BD |
| `npm run db:migrate` | Crea/aplica migraciones (dev) |
| `npm run db:seed` | Carga datos iniciales |
| `npm run db:studio` | Abre Prisma Studio |

> Las variables de conexión (`DATABASE_URL`, `DIRECT_URL`) se leen desde
> `apps/admin-web/.env`. Cuando se centralice el entorno a nivel raíz,
> basta con ajustar los scripts de este paquete.
