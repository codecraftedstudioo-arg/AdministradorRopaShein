// Configuración de sesión compartida por todas las apps.

/** Nombre de la cookie de sesión. */
export const SESSION_COOKIE_NAME = "shein_session";

/**
 * Versión del formato del token de sesión. Al cambiarla se invalidan todas
 * las sesiones con formato anterior (fuerza re-login), sin romper nada.
 */
export const SESSION_VERSION = 5;

/** Duración de la sesión en días (configurable por entorno). */
export const SESSION_TTL_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS ?? 7);

/** Duración de la sesión en segundos. */
export const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;

/**
 * Umbral de renovación deslizante: si a un token le queda menos que esto,
 * se re-emite automáticamente (mantener sesión activa sin re-login).
 */
export const SESSION_RENEW_THRESHOLD_SECONDS = SESSION_TTL_SECONDS / 2;
