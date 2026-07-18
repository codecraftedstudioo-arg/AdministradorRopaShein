# @shein/types

Tipos e interfaces de dominio compartidos por las tres aplicaciones.

## Relación con Prisma

`@shein/database` re-exporta los **tipos de modelo** generados por Prisma
(`Product`, `User`, `Sale`, enums, etc.). Este paquete contiene los tipos de
**aplicación** que los complementan: DTOs, filtros, respuestas de API,
tipos compuestos y contratos entre capas.

## Dominios previstos

`Product`, `Category`, `User`, `Sale`, `Inventory`, `History`, `Audit`,
`Image`, `Location`, `Role`.

## Estructura prevista

```
src/
├── product.ts
├── category.ts
├── user.ts
├── sale.ts
├── inventory.ts
├── audit.ts
├── image.ts
├── location.ts
├── role.ts
└── index.ts
```

> En esta etapa solo se prepara la estructura.
