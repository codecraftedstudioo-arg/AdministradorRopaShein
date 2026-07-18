# @shein/auth

Núcleo de autenticación **compartido y agnóstico de framework**. Lo usan
admin-web hoy, y mobile / store-web en el futuro (misma lógica de sesión).

## Contenido

| Módulo | Responsabilidad |
| --- | --- |
| `password` | Hash/verify de contraseñas con bcrypt (12 rounds). |
| `tokens` | Firma/verificación de JWT de sesión (jose, HS256). Edge-safe. |
| `session` | Tipo `SesionUsuario` (lo que viaja firmado en el token). |
| `config` | Nombre de cookie, TTL y umbral de renovación. |

## Subpaths

```ts
import { verificarSesion } from "@shein/auth/tokens"; // edge (sin bcrypt)
import { hashPassword } from "@shein/auth/password";   // servidor Node
import type { SesionUsuario } from "@shein/auth";
```

> El middleware edge debe importar **solo** desde `@shein/auth/tokens` para no
> arrastrar bcrypt al bundle del edge.

## Requiere

Variable de entorno `AUTH_SECRET` (mín. 32 bytes). `SESSION_MAX_AGE_DAYS`
opcional (default 7).
