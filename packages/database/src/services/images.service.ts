// Servicio de acceso a datos: Imágenes de prendas.
// El alta/edición de prenda gestiona sus imágenes de forma anidada; este
// servicio expone operaciones puntuales reutilizables.
import { prisma } from "../client";
import type { ImagenData } from "./products.service";

export const imagenesService = {
  listarDePrenda(prendaId: string) {
    return prisma.imagen.findMany({
      where: { prendaId },
      orderBy: { orden: "asc" },
    });
  },

  /** Reemplaza por completo el conjunto de imágenes de una prenda. */
  async reemplazar(prendaId: string, imagenes: ImagenData[]) {
    return prisma.$transaction(async (tx) => {
      await tx.imagen.deleteMany({ where: { prendaId } });
      if (imagenes.length) {
        await tx.imagen.createMany({
          data: imagenes.map((img, i) => ({
            prendaId,
            url: img.url,
            orden: img.orden ?? i,
            esPrincipal: img.esPrincipal,
          })),
        });
      }
    });
  },
};
