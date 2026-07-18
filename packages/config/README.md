# @shein/config

Configuraciones compartidas por todo el monorepo. Centraliza las reglas para
garantizar convenciones idénticas en las tres aplicaciones.

## Contenido

| Ruta | Uso |
| --- | --- |
| `tsconfig/base.json` | Base de TypeScript (strict) para cualquier paquete. |
| `tsconfig/nextjs.json` | Extiende la base para apps Next.js. |
| `tsconfig/react-library.json` | Para librerías React/React Native compilables. |
| `eslint/base.mjs` | Flat config base de ESLint. |
| `prettier/index.mjs` | Configuración de Prettier. |
| `tailwind/preset.css` | Tokens compartidos de Tailwind v4. |

## Ejemplos

```jsonc
// tsconfig.json de un paquete
{ "extends": "@shein/config/tsconfig/base" }
```

```js
// eslint.config.mjs
import base from "@shein/config/eslint";
export default [...base /* , ...reglas propias */];
```
