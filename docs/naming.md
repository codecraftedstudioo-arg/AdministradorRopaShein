# Nombres

## Paquetes

- Scope `@shein/*` (p. ej. `@shein/database`, `@shein/ui`).
- Apps: `@shein/admin-web`, `@shein/mobile`.

## Archivos y carpetas

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Carpetas | `kebab-case` | `product-detail/` |
| Componentes React | `PascalCase.tsx` | `ProductCard.tsx` |
| Hooks | `useX.ts` (camelCase) | `useProducts.ts` |
| Utilidades / servicios | `camelCase.ts` | `productService.ts` |
| Tipos sueltos | `camelCase.ts` | `product.ts` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_IMAGES` |

## Símbolos

- Componentes, tipos e interfaces: `PascalCase`.
- Variables y funciones: `camelCase`.
- Enums: `PascalCase` para el nombre, `SCREAMING_SNAKE_CASE` para los valores.
- Booleanos con prefijo `is/has/can` (`isActive`, `hasStock`).

## Base de datos (Prisma)

- Modelos en `PascalCase` singular (`Product`, `Sale`).
- Campos en `camelCase`.
- Enums de dominio en `PascalCase`.
