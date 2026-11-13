# OpenF

Frontend con Angular 22, renderizado en cliente (CSR), pnpm y Tailwind CSS. Incluye login, registro y sidebar; el área principal queda vacía.

## Requisitos

- Node.js 24.15 o posterior dentro de la versión 24.
- pnpm 11.25.

## Instalación

Desde la carpeta del frontend:

```sh
pnpm install --frozen-lockfile
```

## Modos de ejecución

| Comando | Modo | Salida |
| --- | --- | --- |
| `pnpm dev:api` | Backend local con cookies y CSRF | http://localhost:4200 |
| `pnpm dev:mock` | Demo en memoria, sin backend ni llamadas API | http://localhost:4200 |
| `pnpm build` | Producción con API | `dist/open-f/browser` |

Ejecuta un modo de desarrollo a la vez, o cambia su puerto con `--port 4300`. `pnpm start` equivale a `pnpm dev:api`.

### Demo

Acceso: **demo@openf.local / OpenF1234!**. También puedes registrar una cuenta. Las cuentas y la sesión de la demo se reinician al recargar la página.

### Backend local

Ejecuta el backend y su base de datos por separado. `proxy.conf.mjs` dirige `/api/**` a `http://localhost:8080/open_f/api/**` y permite usar las cookies bajo el mismo origen del frontend. Esta configuración se comparte en GitHub para reproducir el entorno de desarrollo.

Puedes cambiar el destino mediante `OPENF_API_TARGET` y `OPENF_API_CONTEXT`. Ejemplo en PowerShell:

```powershell
$env:OPENF_API_TARGET = 'http://localhost:8080'
$env:OPENF_API_CONTEXT = '/open_f/api'
pnpm dev:api
```

El backend debe exponer `GET /api/session` y `POST /api/session/login`, `/api/session/register` y `/api/session/logout`. La sesión utiliza cookies; Angular envía el token de `OPENF-XSRF-TOKEN` en el encabezado `X-XSRF-TOKEN`.

### Producción

Sirve `dist/open-f/browser` mediante HTTPS, usa `index.html` como fallback para las rutas de Angular y dirige `/api/**` al backend conservando cookies y sin cachear respuestas de sesión. La URL de API se configura en `src/app/config/environment.prod.ts`; `proxy.conf.mjs` solo se usa en desarrollo.

El build descarga el CSS de DM Sans desde Google Fonts para incluirlo en producción.

## Organización

```text
src/app/
  config/          # Entornos, tokens y proveedores
  core/            # Modelos, sesión, transportes, guards e interceptores
  features/auth/   # Login y registro
  shared/ui/       # Componentes del design system
  layout/          # Sidebar y estructura
```

`Session` mantiene el estado mediante signals. Los proveedores HTTP y mock implementan el mismo contrato `SessionGateway`. Los botones reciben iconos y estados mediante propiedades.

Tailwind CSS 4 controla la estructura, los espacios, la tipografía y la adaptación móvil de login, registro y sidebar. Los tokens del design system se conectan a Tailwind mediante `@theme inline` en `src/styles.css`. Los estilos base y de controles usan las capas `base` y `components`, de modo que las utilidades pueden ajustarlos sin aumentar la especificidad.

## Pruebas

```sh
pnpm test:unit
```

Para ejecutar las pruebas en modo observación: `pnpm test`. Para compilar los modos de desarrollo: `pnpm build:api` y `pnpm build:mock`.
