// Punto de entrada del paquete @shein/database.
// Las tres apps (admin-web, mobile, store-web) consumen la BD desde acá.

export { prisma } from "./client";

// Re-exporta tipos, enums y el namespace Prisma generados por el cliente,
// para que los consumidores no dependan directamente de "@prisma/client".
export * from "@prisma/client";

// Servicios de acceso a datos (estructura preparada, sin lógica aún).
export * from "./services";

// Estructura preparada para crecer (aún sin implementar):
// export * from "./helpers";
// export * from "./queries";
