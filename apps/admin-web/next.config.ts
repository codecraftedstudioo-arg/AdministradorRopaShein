import type { NextConfig } from "next";
import path from "path";

// Raíz del monorepo (dos niveles arriba de apps/admin-web).
const monorepoRoot = path.join(__dirname, "..", "..");

const nextConfig: NextConfig = {
  // Transpila los paquetes internos del workspace consumidos por la app.
  transpilePackages: [
    "@shein/database",
    "@shein/auth",
    "@shein/ui",
    "@shein/types",
    "@shein/utils",
    "@shein/shared",
  ],
  // Fija la raíz al monorepo para resolver los paquetes @shein/* y evitar
  // que Next tome un lockfile superior (p. ej. el del home) como raíz.
  turbopack: {
    root: monorepoRoot,
  },
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
