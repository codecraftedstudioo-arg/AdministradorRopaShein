# Buenas prácticas

## Principios

- **SOLID** — responsabilidades únicas, dependencias hacia abstracciones.
- **DRY** — el código compartido vive una sola vez, en `packages/*`.
- **KISS** — la solución más simple que resuelve el problema.
- **Separation of Concerns** — dominio, datos, aplicación y presentación
  separados (ver `architecture.md`).
- **Clean Architecture** — las dependencias apuntan hacia el dominio; la UI
  y la infraestructura son intercambiables.

## Reglas del monorepo

1. **Sin duplicación entre apps.** Si algo lo usan 2+ apps, va a un paquete.
2. **La BD es única.** Todo acceso pasa por `@shein/database`.
3. **Las apps no se importan entre sí.** Solo consumen `packages/*`.
4. **Paquetes desacoplados de frameworks** cuando sea posible (`utils`,
   `types`, `shared` no deben depender de Next o RN).
5. **Añadir una app no modifica las existentes** (escalabilidad).
6. **Tipos primero.** El contrato (tipos) antes que la implementación.

## Flujo para extraer código a un paquete

1. Identificar código usado (o reutilizable) por más de una app.
2. Moverlo al paquete adecuado y exportarlo desde su `index.ts`.
3. Reemplazar los usos por el import del paquete (`@shein/…`).
4. Verificar `build` y `typecheck` de las apps afectadas.

## Seguridad

- Nunca commitear `.env` (está en `.gitignore`). Usar `.env.example`.
- Rotar credenciales expuestas.
- Validar entrada con Zod en los límites (formularios, API, server actions).
