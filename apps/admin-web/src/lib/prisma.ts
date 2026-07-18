// El cliente Prisma vive en el paquete compartido @shein/database, único
// punto de acceso a la base de datos para todo el ecosistema.
//
// Se re-exporta aquí para no romper los imports existentes de la app
// (`import { prisma } from "@/lib/prisma"`).
export { prisma } from "@shein/database";
