-- Proveedor + Lote + observaciones en Prenda.
-- Migración aditiva: no elimina datos. Las prendas existentes
-- se vinculan al lote L001 del proveedor SHEIN.

-- CreateTable Proveedor
CREATE TABLE "Proveedor" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Proveedor_nombre_key" ON "Proveedor"("nombre");
CREATE INDEX "Proveedor_nombre_idx" ON "Proveedor"("nombre");
CREATE INDEX "Proveedor_activo_idx" ON "Proveedor"("activo");

-- CreateTable Lote
CREATE TABLE "Lote" (
    "id" UUID NOT NULL,
    "numero" TEXT NOT NULL,
    "proveedorId" UUID NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lote_numero_key" ON "Lote"("numero");
CREATE INDEX "Lote_numero_idx" ON "Lote"("numero");
CREATE INDEX "Lote_proveedorId_idx" ON "Lote"("proveedorId");
CREATE INDEX "Lote_fechaIngreso_idx" ON "Lote"("fechaIngreso");

ALTER TABLE "Lote" ADD CONSTRAINT "Lote_proveedorId_fkey"
  FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed mínimo para poder backfill (ids fijos y estables).
INSERT INTO "Proveedor" ("id", "nombre", "activo", "createdAt", "updatedAt")
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'SHEIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO "Lote" ("id", "numero", "proveedorId", "fechaIngreso", "observaciones", "createdAt", "updatedAt")
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'L001',
  'a0000000-0000-4000-8000-000000000001',
  CURRENT_TIMESTAMP,
  'Lote inicial (migración)',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- AlterTable Prenda: observaciones + loteId (nullable → backfill → NOT NULL)
ALTER TABLE "Prenda" ADD COLUMN "observaciones" TEXT;
ALTER TABLE "Prenda" ADD COLUMN "loteId" UUID;

UPDATE "Prenda"
SET "loteId" = 'b0000000-0000-4000-8000-000000000001'
WHERE "loteId" IS NULL;

ALTER TABLE "Prenda" ALTER COLUMN "loteId" SET NOT NULL;

CREATE INDEX "Prenda_loteId_idx" ON "Prenda"("loteId");

ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_loteId_fkey"
  FOREIGN KEY ("loteId") REFERENCES "Lote"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
