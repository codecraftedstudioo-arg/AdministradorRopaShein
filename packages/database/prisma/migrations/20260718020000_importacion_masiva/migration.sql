-- Historial de importaciones masivas (Excel/CSV).

CREATE TABLE "Importacion" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "archivoNombre" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "cantidadTotal" INTEGER NOT NULL DEFAULT 0,
    "cantidadImportada" INTEGER NOT NULL DEFAULT 0,
    "cantidadRechazada" INTEGER NOT NULL DEFAULT 0,
    "duracionMs" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL,
    "detalle" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Importacion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Importacion_usuarioId_idx" ON "Importacion"("usuarioId");
CREATE INDEX "Importacion_createdAt_idx" ON "Importacion"("createdAt");
CREATE INDEX "Importacion_estado_idx" ON "Importacion"("estado");

ALTER TABLE "Importacion" ADD CONSTRAINT "Importacion_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
