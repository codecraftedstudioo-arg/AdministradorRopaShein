# @shein/admin-web · Panel de Administración

Sistema profesional de gestión de inventario para prendas únicas provenientes
de **Mystery Boxes de SHEIN**.

> **Principio central:** cada prenda es única, **no existe stock múltiple**.
> Cada prenda es un registro independiente. Nada se elimina jamás: se archiva
> y se audita.

Forma parte del monorepo `shein-platform`. Consume la base de datos compartida
`@shein/database`. Ver la documentación general en [`/docs`](../../docs).

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (sistema de diseño premium propio)
- **Prisma ORM** + **PostgreSQL** (vía `@shein/database`)
- **Autenticación** por sesiones JWT (cookies httpOnly) con `jose` + `bcryptjs`
- **Zod** + **React Hook Form**, **Recharts**, **lucide-react**
- **papaparse** / **xlsx** (importación CSV / Excel)

---

## Puesta en marcha (desde la raíz del monorepo)

```bash
npm install                         # instala el workspace + genera Prisma
cp apps/admin-web/.env.example apps/admin-web/.env   # y completar valores
npm run db:migrate                  # crea las tablas
npm run db:seed                     # datos iniciales
npm run dev                         # levanta admin-web (http://localhost:3000)
```

Variables mínimas en `apps/admin-web/.env`:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/db?sslmode=require"
DIRECT_URL="postgresql://usuario:password@host:5432/db?sslmode=require"
AUTH_SECRET="generar-con: openssl rand -base64 32"
```

### Credenciales de demostración

| Rol           | Email                  | Contraseña    |
| ------------- | ---------------------- | ------------- |
| Administrador | `admin@shein.local`    | `admin123`    |
| Empleado      | `empleado@shein.local` | `empleado123` |

---

## Estructura

```
apps/admin-web/src/
├── app/
│   ├── (auth)/login/            # Login (público) + server actions
│   ├── (dashboard)/             # Layout protegido (sidebar + topbar)
│   │   ├── dashboard/           # Tarjetas de métricas + actividad
│   │   ├── products/            # Listado, ficha [id], nuevo, [id]/edit
│   │   ├── archive/             # Prendas vendidas / archivadas
│   │   ├── statistics/          # Gráficos
│   │   ├── audit/               # Registro de auditoría (solo admin)
│   │   └── users/               # Gestión de usuarios (solo admin)
│   └── api/upload/              # Subida de imágenes
├── components/                  # ui, layout, products, dashboard, charts, …
├── services/                    # Lógica de negocio (product, sale, audit, …)
├── lib/                         # prisma (re-export @shein/database), auth, validations
├── hooks/  types/  utils/
└── proxy.ts                     # Protección de rutas (ex-middleware)
```

> El **modelo de datos** vive en `packages/database` (`@shein/database`), no
> dentro de esta app.

---

## Modelo de datos (resumen)

- **User** — empleados/administradores. Toda acción queda vinculada a un usuario.
- **Category / Subcategory** — Mujer/Hombre/Niño → Remeras, Buzos, Camisas, …
- **Product** — la prenda única (código, precio en centavos, género, talle, estado).
- **ProductImage** — múltiples imágenes por prenda (orden + principal).
- **Tag / ProductTag** — etiquetas N:M (Oversize, Vintage, Y2K, …).
- **Sale** — 1:1 con la prenda vendida (canal, vendedor, precio final).
- **AuditLog** — registro **inmutable y polimórfico** de todas las acciones.

**Estados:** `AVAILABLE`, `RESERVED`, `SOLD`, `ARCHIVED`.

## Almacenamiento de imágenes

En desarrollo se guardan en `public/uploads`. Para producción, reemplazar
`src/app/api/upload/route.ts` por un proveedor externo (S3, UploadThing,
Cloudinary) manteniendo el mismo contrato (`POST` → `{ urls: string[] }`).
