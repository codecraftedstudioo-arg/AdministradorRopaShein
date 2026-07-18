import "server-only";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ============================================================
//  Storage abstraído
//
//  Punto único para cambiar el proveedor de almacenamiento de
//  imágenes (local -> Supabase Storage / S3) sin tocar el resto
//  del código. Hoy: disco local en public/uploads.
// ============================================================

export interface ArchivoGuardado {
  url: string;
}

export interface StorageProvider {
  guardar(file: File): Promise<ArchivoGuardado>;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_BASE = "/uploads";

const EXTENSIONES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const localProvider: StorageProvider = {
  async guardar(file) {
    const ext = EXTENSIONES[file.type];
    if (!ext) throw new Error("TIPO_NO_PERMITIDO");
    await mkdir(UPLOAD_DIR, { recursive: true });
    const nombre = `${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, nombre), bytes);
    return { url: `${PUBLIC_BASE}/${nombre}` };
  },
};

/** Proveedor activo. Cambiar acá para migrar a la nube. */
export const storage: StorageProvider = localProvider;

export const TIPOS_IMAGEN_PERMITIDOS = Object.keys(EXTENSIONES);
export const TAMANO_MAX_IMAGEN = 8 * 1024 * 1024; // 8 MB
