/**
 * Configuración base de ESLint (flat config) compartida por el monorepo.
 *
 * Los proyectos la extienden y añaden sus propios presets. Por ejemplo,
 * `apps/admin-web` combina esta base con `eslint-config-next`.
 *
 * @example
 *   import base from "@shein/config/eslint";
 *   export default [...base, ...tusReglas];
 */

/** @type {import("eslint").Linter.Config[]} */
const base = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/generated/**",
    ],
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
    },
  },
];

export default base;
