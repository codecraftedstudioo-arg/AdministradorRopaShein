# SHEIN Inventory · Panel de Administración

Sistema profesional de gestión de inventario para prendas únicas provenientes de **Mystery Boxes de SHEIN**.

> **Principio central:** cada prenda es única, **no existe stock múltiple**. Cada prenda es un registro independiente. Nada se elimina jamás: se archiva y se audita.

Esta es la **primera etapa** del proyecto (panel de administración). La arquitectura y la base de datos quedan preparadas para que en una segunda etapa se construya un e-commerce **sobre exactamente la misma base de datos**.

---

## Stack tecnológico

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** (sistema de diseño premium propio)
- **Prisma ORM** + **PostgreSQL**
- **Autenticación** por sesiones JWT (cookies httpOnly) con `jose` + `bcryptjs`
- **Zod** + **React Hook Form** (validación y formularios)
- **Recharts** (gráficos), **lucide-react** (iconos)
- **papaparse** / **xlsx** (importación CSV / Excel)

---

## Puesta en marcha

### 1. Requisitos

- Node.js 18.18+
- Una base de datos **PostgreSQL** en ejecución

### 2. Variables de entorno

Copiá el ejemplo y ajustá los valores:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/shein_admin?schema=public"
AUTH_SECRET="generar-con: openssl rand -base64 32"
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Base de datos (migraciones + datos de ejemplo)

```bash
npm run db:migrate   # crea las tablas
npm run db:seed      # carga categorías, tags, usuarios y 24 prendas de ejemplo
```

> Si preferís no usar migraciones versionadas en desarrollo: `npm run db:push`.

### 5. Ejecutar

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Credenciales de demostración

| Rol           | Email                  | Contraseña     |
| ------------- | ---------------------- | -------------- |
| Administrador | `admin@shein.local`    | `admin123`     |
| Empleado      | `empleado@shein.local` | `empleado123`  |

---

## Scripts

| Script               | Descripción                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo                       |
| `npm run build`      | Build de producción (`prisma generate` + build) |
| `npm run start`      | Servidor de producción                       |
| `npm run db:migrate` | Crea/aplica migraciones                      |
| `npm run db:push`    | Sincroniza el schema sin migraciones         |
| `npm run db:seed`    | Carga datos de ejemplo                       |
| `npm run db:studio`  | Prisma Studio (explorar la BD)               |

---

## Arquitectura de carpetas

```
src/
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
├── components/
│   ├── ui/                      # Sistema de diseño (Button, Card, Modal, …)
│   ├── layout/                  # Sidebar, Topbar, AppShell, PageHeader
│   ├── products/                # Tabla, formularios, galería, venta, import
│   ├── dashboard/ charts/ audit/ users/
├── services/                    # Lógica de negocio (product, sale, audit, …)
├── lib/                         # prisma, auth (session/password), utils, validations
├── hooks/                       # useDebounce, …
├── types/                       # Tipos e interfaces del dominio
├── utils/                       # constantes (labels, categorías, tags)
├── proxy.ts                     # Protección de rutas (ex-middleware)
prisma/
├── schema.prisma                # Modelo de datos
└── seed.ts                      # Datos iniciales
```

---

## Modelo de datos (resumen)

- **User** — empleados/administradores. Toda acción queda vinculada a un usuario.
- **Category / Subcategory** — Mujer/Hombre/Niño → Remeras, Buzos, Camisas, Pantalones, Camperas, Zapatillas.
- **Product** — la prenda única (código interno, precio en centavos, género, talle, estado).
- **ProductImage** — múltiples imágenes por prenda (orden + principal).
- **Tag / ProductTag** — etiquetas N:M (Oversize, Vintage, Y2K, …) pensadas para la futura tienda.
- **Sale** — 1:1 con la prenda vendida (canal, vendedor, precio final, observaciones).
- **AuditLog** — registro **inmutable y polimórfico** de todas las acciones (quién, qué, cuándo, diff).

**Estados:** `AVAILABLE`, `RESERVED` (preparado para el futuro), `SOLD`, `ARCHIVED`.

---

## Notas de escalabilidad (etapa 2: e-commerce)

- Los precios se guardan **en centavos** (`Int`) para evitar errores de coma flotante.
- El modelo de estados y etiquetas ya contempla la vidriera pública (tags, `RESERVED`).
- La capa de **servicios** aísla la lógica de negocio: una futura API/tienda reutiliza los mismos servicios y modelos sin duplicar reglas.
- La **auditoría** es transversal y no depende de la UI del panel.

## Almacenamiento de imágenes

En desarrollo las imágenes se guardan en `public/uploads`. Para producción, reemplazar la ruta `src/app/api/upload/route.ts` por un proveedor externo (S3, UploadThing, Cloudinary) manteniendo el mismo contrato (`POST` → `{ urls: string[] }`).
