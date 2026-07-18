/**
 * Configuración de Prettier compartida por el monorepo.
 *
 * @example
 *   // .prettierrc.mjs
 *   export { default } from "@shein/config/prettier";
 *
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 80,
  tabWidth: 2,
};

export default config;
