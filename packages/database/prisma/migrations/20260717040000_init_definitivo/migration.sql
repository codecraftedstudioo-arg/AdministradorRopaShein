-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MUJER', 'HOMBRE', 'NINO');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('REMERA', 'BUZO', 'CAMISA', 'PANTALON', 'CAMPERA', 'ZAPATILLA');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('DISPONIBLE', 'RESERVADA', 'VENDIDA', 'ARCHIVADA');

-- CreateEnum
CREATE TYPE "CanalVenta" AS ENUM ('LOCAL', 'ONLINE', 'PARTICULAR');

-- CreateTable
CREATE TABLE "Rol" (
    "id" UUID NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "permisos" JSONB NOT NULL DEFAULT '[]',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rolId" UUID NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prenda" (
    "id" UUID NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "genero" "Genero" NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "subcategoria" TEXT,
    "talle" TEXT NOT NULL,
    "precioVenta" INTEGER NOT NULL,
    "costo" INTEGER NOT NULL DEFAULT 6000,
    "estado" "Estado" NOT NULL DEFAULT 'DISPONIBLE',
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioCargaId" UUID NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imagen" (
    "id" UUID NOT NULL,
    "prendaId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" UUID NOT NULL,
    "prendaId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "canalVenta" "CanalVenta" NOT NULL,
    "precioFinal" INTEGER NOT NULL,
    "observaciones" TEXT,
    "fechaVenta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "valorAnterior" JSONB,
    "valorNuevo" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" UUID NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_clave_key" ON "Rol"("clave");

-- CreateIndex
CREATE INDEX "Rol_clave_idx" ON "Rol"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rolId_idx" ON "Usuario"("rolId");

-- CreateIndex
CREATE INDEX "Usuario_activo_idx" ON "Usuario"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Prenda_codigoInterno_key" ON "Prenda"("codigoInterno");

-- CreateIndex
CREATE INDEX "Prenda_codigoInterno_idx" ON "Prenda"("codigoInterno");

-- CreateIndex
CREATE INDEX "Prenda_nombre_idx" ON "Prenda"("nombre");

-- CreateIndex
CREATE INDEX "Prenda_categoria_idx" ON "Prenda"("categoria");

-- CreateIndex
CREATE INDEX "Prenda_subcategoria_idx" ON "Prenda"("subcategoria");

-- CreateIndex
CREATE INDEX "Prenda_genero_idx" ON "Prenda"("genero");

-- CreateIndex
CREATE INDEX "Prenda_talle_idx" ON "Prenda"("talle");

-- CreateIndex
CREATE INDEX "Prenda_estado_idx" ON "Prenda"("estado");

-- CreateIndex
CREATE INDEX "Prenda_fechaIngreso_idx" ON "Prenda"("fechaIngreso");

-- CreateIndex
CREATE INDEX "Prenda_precioVenta_idx" ON "Prenda"("precioVenta");

-- CreateIndex
CREATE INDEX "Prenda_usuarioCargaId_idx" ON "Prenda"("usuarioCargaId");

-- CreateIndex
CREATE INDEX "Imagen_prendaId_idx" ON "Imagen"("prendaId");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_prendaId_key" ON "Venta"("prendaId");

-- CreateIndex
CREATE INDEX "Venta_usuarioId_idx" ON "Venta"("usuarioId");

-- CreateIndex
CREATE INDEX "Venta_canalVenta_idx" ON "Venta"("canalVenta");

-- CreateIndex
CREATE INDEX "Venta_fechaVenta_idx" ON "Venta"("fechaVenta");

-- CreateIndex
CREATE INDEX "Auditoria_usuarioId_idx" ON "Auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "Auditoria_entidad_entidadId_idx" ON "Auditoria"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "Auditoria_accion_idx" ON "Auditoria"("accion");

-- CreateIndex
CREATE INDEX "Auditoria_fecha_idx" ON "Auditoria"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_clave_key" ON "Configuracion"("clave");

-- CreateIndex
CREATE INDEX "Configuracion_clave_idx" ON "Configuracion"("clave");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_usuarioCargaId_fkey" FOREIGN KEY ("usuarioCargaId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "Prenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "Prenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

