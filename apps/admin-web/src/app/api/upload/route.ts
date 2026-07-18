import { NextResponse, type NextRequest } from "next/server";
import { obtenerSesion } from "@/auth/session";
import {
  storage,
  TIPOS_IMAGEN_PERMITIDOS,
  TAMANO_MAX_IMAGEN,
} from "@/lib/storage";
import { logger } from "@/logger";

export async function POST(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron archivos" },
        { status: 400 },
      );
    }

    const urls: string[] = [];
    for (const file of files) {
      if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type)) {
        return NextResponse.json(
          { error: "Formato no permitido (usá JPG, PNG, WEBP, GIF o AVIF)" },
          { status: 400 },
        );
      }
      if (file.size > TAMANO_MAX_IMAGEN) {
        return NextResponse.json(
          { error: "Cada imagen debe pesar menos de 8 MB" },
          { status: 400 },
        );
      }
      const { url } = await storage.guardar(file);
      urls.push(url);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    logger.error("Error al subir imágenes", error);
    return NextResponse.json(
      { error: "No se pudieron subir las imágenes" },
      { status: 500 },
    );
  }
}
