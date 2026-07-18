# @shein/ui

Design system compartido: componentes de UI reutilizables por las apps web
(admin-web y store-web). La app móvil usará su propia capa de presentación
(React Native), pudiendo compartir tokens y lógica.

## Estructura prevista

```
src/
├── components/
│   ├── button/
│   ├── input/
│   ├── card/
│   ├── dialog/
│   ├── table/
│   ├── modal/
│   ├── loading/
│   ├── skeleton/
│   ├── badge/
│   └── avatar/
├── hooks/
└── index.ts        # API pública
```

> En esta etapa solo se prepara la estructura. Los componentes actuales de
> `apps/admin-web/src/components/ui` se migrarán aquí progresivamente, sin
> duplicar código.
