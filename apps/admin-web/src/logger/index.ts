// Logger interno de eventos y errores.
// No se exponen detalles técnicos al usuario final; acá se registran para
// depuración. En el futuro puede enviarse a un servicio externo.

type Nivel = "info" | "warn" | "error" | "event";

function emit(nivel: Nivel, mensaje: string, meta?: unknown): void {
  const entrada = {
    ts: new Date().toISOString(),
    nivel,
    mensaje,
    ...(meta !== undefined ? { meta } : {}),
  };
  const linea = JSON.stringify(entrada);
  if (nivel === "error") console.error(linea);
  else if (nivel === "warn") console.warn(linea);
  else console.log(linea);
}

function normalizarError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return error;
}

export const logger = {
  info: (mensaje: string, meta?: unknown) => emit("info", mensaje, meta),
  warn: (mensaje: string, meta?: unknown) => emit("warn", mensaje, meta),
  error: (mensaje: string, error?: unknown) =>
    emit("error", mensaje, normalizarError(error)),
  /** Evento de negocio relevante (login, cambios, etc.). */
  event: (mensaje: string, meta?: unknown) => emit("event", mensaje, meta),
};
