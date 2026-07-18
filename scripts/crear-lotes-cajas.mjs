/**
 * Crea lotes Caja 1 … Caja 9 (proveedor SHEIN) para la importación Mystery Box.
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../apps/admin-web/.env") });

const prisma = new PrismaClient();

async function main() {
  const shein = await prisma.proveedor.upsert({
    where: { nombre: "SHEIN" },
    update: { activo: true },
    create: { nombre: "SHEIN", activo: true },
  });

  for (let i = 1; i <= 9; i++) {
    const numero = `Caja ${i}`;
    const existente = await prisma.lote.findFirst({
      where: { numero },
      select: { id: true, deletedAt: true },
    });
    if (existente) {
      if (existente.deletedAt) {
        await prisma.lote.update({
          where: { id: existente.id },
          data: { deletedAt: null, proveedorId: shein.id },
        });
        console.log(`Restaurado: ${numero}`);
      } else {
        console.log(`Ya existe: ${numero}`);
      }
      continue;
    }
    await prisma.lote.create({
      data: {
        numero,
        proveedorId: shein.id,
        observaciones: `Mystery Box SHEIN — ${numero}`,
      },
    });
    console.log(`Creado: ${numero}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
