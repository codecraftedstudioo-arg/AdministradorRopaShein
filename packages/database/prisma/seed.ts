// ============================================================
//  Seed · Plataforma SHEIN
//
//  Crea los roles base, el admin inicial, el proveedor SHEIN
//  y el lote L001. Idempotente.
// ============================================================

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@shein/auth/password";
import { ROLES_BASE, CLAVE_ROL } from "@shein/shared";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@shein.local";
const ADMIN_PASSWORD = "Admin1234!";

async function main() {
  // 1) Roles base
  for (const rol of ROLES_BASE) {
    await prisma.rol.upsert({
      where: { clave: rol.clave },
      update: {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
      },
      create: {
        clave: rol.clave,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
      },
    });
  }
  console.log(`Roles base listos: ${ROLES_BASE.map((r) => r.clave).join(", ")}`);

  // 2) Admin inicial
  const rolAdmin = await prisma.rol.findUnique({
    where: { clave: CLAVE_ROL.ADMIN },
  });
  if (!rolAdmin) throw new Error("No se encontró el rol ADMIN.");

  const existente = await prisma.usuario.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!existente) {
    await prisma.usuario.create({
      data: {
        nombre: "Administrador",
        apellido: "General",
        email: ADMIN_EMAIL,
        passwordHash: await hashPassword(ADMIN_PASSWORD),
        rolId: rolAdmin.id,
      },
    });
    console.log(`Admin creado -> ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`Admin ya existe (${ADMIN_EMAIL}), no se modifica.`);
  }

  // 3) Proveedor SHEIN + lote L001
  const shein = await prisma.proveedor.upsert({
    where: { nombre: "SHEIN" },
    update: { activo: true },
    create: { nombre: "SHEIN", activo: true },
  });
  console.log(`Proveedor listo: ${shein.nombre}`);

  const lote = await prisma.lote.upsert({
    where: { numero: "L001" },
    update: {},
    create: {
      numero: "L001",
      proveedorId: shein.id,
      observaciones: "Lote inicial",
    },
  });
  console.log(`Lote listo: ${lote.numero}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
