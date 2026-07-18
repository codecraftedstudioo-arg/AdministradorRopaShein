# Estructura de carpetas

```
shein-platform/
├── apps/
│   ├── admin-web/          # Panel administrativo (Next.js, App Router, TS, Tailwind)
│   │   ├── src/
│   │   │   ├── app/        # Rutas (App Router)
│   │   │   ├── components/ # Componentes de la app
│   │   │   ├── hooks/
│   │   │   ├── lib/        # infra (auth, prisma re-export, validaciones)
│   │   │   ├── services/   # casos de uso / acceso a datos
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── public/
│   │   ├── .env            # variables de entorno (runtime Next + Prisma CLI)
│   │   ├── next.config.ts
│   │   └── tsconfig.json
│   ├── mobile/             # React Native + Expo (estructura preparada)
│   └── store-web/          # Tienda online (reservado)
│
├── packages/
│   ├── database/           # @shein/database — Prisma (schema, seed, migrations, client)
│   ├── ui/                 # @shein/ui — design system compartido
│   ├── types/              # @shein/types — tipos de dominio
│   ├── utils/              # @shein/utils — utilidades puras
│   ├── shared/             # @shein/shared — constantes, enums, permisos
│   └── config/             # @shein/config — tsconfig, eslint, prettier, tailwind
│
├── docs/                   # Documentación
├── scripts/                # Automatizaciones del monorepo
├── package.json            # workspaces + scripts orquestados
├── turbo.json              # pipeline de Turborepo
├── tsconfig.json           # base para tooling
└── .prettierrc.json
```

## Dónde va cada cosa

- **Código específico de una app** → dentro de `apps/<app>`.
- **Código compartido por 2+ apps** → en el paquete `packages/*` correspondiente.
- **Modelo de datos** → siempre en `packages/database` (fuente de verdad).
- **Configuración común** → `packages/config`.
