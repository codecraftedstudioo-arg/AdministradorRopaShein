# Documentación · Plataforma SHEIN

Documentación del ecosistema. El monorepo aloja tres aplicaciones que
comparten una única base tecnológica.

## Índice

| Documento | Contenido |
| --- | --- |
| [architecture.md](./architecture.md) | Visión general, apps, paquetes y flujo de dependencias. |
| [structure.md](./structure.md) | Estructura de carpetas del monorepo. |
| [conventions.md](./conventions.md) | Convenciones de código, imports y alias. |
| [naming.md](./naming.md) | Reglas de nombres (archivos, símbolos, paquetes). |
| [best-practices.md](./best-practices.md) | Principios: SOLID, DRY, KISS, SoC, Clean Architecture. |

## Aplicaciones

1. **admin-web** — Panel administrativo (Next.js). _En desarrollo._
2. **mobile** — App para empleados (React Native + Expo). _Estructura preparada._
3. **store-web** — Tienda online. _Solo reservado._

## Puesta en marcha

```bash
npm install          # instala todo el workspace y genera el cliente Prisma
npm run dev          # levanta las apps en modo desarrollo (via Turborepo)
npm run build        # build de todas las apps
npm run db:studio    # explora la base de datos
```
