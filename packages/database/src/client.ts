import { PrismaClient } from "@prisma/client";

// Versión del singleton: subirla cuando se agreguen modelos al schema
// para invalidar instancias cacheadas por hot-reload de Next.js.
const PRISMA_SINGLETON_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: number | undefined;
};

function crearCliente() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function obtenerCliente(): PrismaClient {
  const cacheado = globalForPrisma.prisma;
  const versionOk = globalForPrisma.prismaVersion === PRISMA_SINGLETON_VERSION;

  // Si el singleton es viejo (p. ej. sin modelo Lote), descartarlo.
  if (cacheado && versionOk && "lote" in cacheado && cacheado.lote) {
    return cacheado;
  }

  if (cacheado) {
    void cacheado.$disconnect().catch(() => undefined);
  }

  const cliente = crearCliente();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = cliente;
    globalForPrisma.prismaVersion = PRISMA_SINGLETON_VERSION;
  }
  return cliente;
}

export const prisma = obtenerCliente();
