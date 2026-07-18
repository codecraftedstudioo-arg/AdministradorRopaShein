# @shein/mobile

App móvil para empleados, basada en **React Native + Expo**.

> Estado: **estructura preparada, sin desarrollo**. No hay pantallas,
> componentes ni navegación en esta etapa (por decisión explícita).

## Estructura prevista (Expo Router)

```
apps/mobile/
├── app/                # rutas/pantallas (expo-router) — a futuro
├── src/
│   ├── components/     # UI específica de mobile
│   ├── features/       # lógica por feature
│   └── lib/            # integración con paquetes compartidos
├── assets/             # imágenes, fuentes
├── app.json            # configuración de Expo
└── package.json
```

## Base tecnológica compartida

Consumirá los mismos paquetes que el resto del ecosistema:

- `@shein/database` — acceso a datos (vía API/capa de servicios)
- `@shein/types` — tipos de dominio
- `@shein/utils` — utilidades puras
- `@shein/shared` — constantes, enums y permisos

## Inicialización (cuando comience el desarrollo)

```bash
cd apps/mobile
npx create-expo-app@latest . --template
# luego añadir las dependencias de @shein/* como workspace deps
```
