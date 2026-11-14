# OpenF

Frontend con Angular 22, renderizado en cliente (CSR), pnpm y Tailwind CSS. Incluye login, registro, sidebar y tres vistas iniciales: Home, Kanban y Tree.

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

### Vistas

Después de acceder, `/app` redirige a `/app/home`. Home y Tree mantienen sus vistas iniciales. `/app/kanban` muestra el tablero con datos locales; Lista y Roadmap conservan paneles vacíos. El sidebar obtiene la selección de la URL, incluso al volver atrás o entrar mediante un enlace directo.

El Kanban permite buscar, filtrar por prioridad y responsable, ordenar, crear tareas, moverlas con CDK DragDrop y abrir su detalle. El detalle incluye estado, prioridad, responsables, presupuesto, áreas, contacto, herramientas, archivos TXT descargables, guardados y comentarios. Los cambios viven en signals y se reinician al recargar; el contrato `KanbanService` se resuelve mediante `KANBAN_SERVICE_TOKEN` a `KanbanMockServiceImpl`, sin llamadas API. `KanbanStateService` encapsula el estado, los filtros y los resúmenes. Los datos de ejemplo son constantes privadas de `KanbanMockServiceImpl`; los componentes reciben valores y emiten eventos. Consulta [la arquitectura y las fuentes verificadas](docs/kanban.md).

La estructura visual y responsive usa Tailwind y los tokens de la paleta menta. `Drawer` usa CDK Overlay y TemplatePortal, con bloqueo del scroll, contención del foco y cierre mediante Escape o clic fuera. `Dropdown` usa CdkConnectedOverlay para los filtros. `Badge`, `Avatar`, `Tabs`, `Drawer` y `Dropdown` son componentes reutilizables del DS con historias propias; las historias de `Vistas/Kanban` cubren las cuatro subsecciones, el detalle y la búsqueda vacía.

`KanbanPage` conecta el servicio con `Kanban`, que solo declara un input de vista y un output de acciones. Los servicios preparan la agrupación, los catálogos, los formularios y el resumen. La respuesta mock incluye las columnas y sus IDs, nombres, orden y metadatos, además de las prioridades, categorías y herramientas; la vista admite otra cantidad de columnas, incluidas las vacías. Este contrato conserva los atributos de la UI de referencia y amplía el modelo revisado en `D:/Dev/JavaOpenF`, cuyo backend todavía expone un subconjunto de esas propiedades.

Los métodos del mock devuelven Observables con 400 ms de demora por operación. El servicio de estado gestiona suscripciones cancelables y signals de carga, guardado y error. La UI muestra la carga inicial, bloquea envíos duplicados al guardar y permite reintentar cuando falla la lectura. Los datos de ejemplo están en constantes privadas de `KanbanMockServiceImpl`.

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
  config/                       # Entornos, tokens y proveedores
  core/
    models/auth/                # Usuario y contratos de autenticación
    services/auth/              # Contrato, implementaciones API/mock y estado de sesión
    guards/                     # Acceso autenticado e invitados
    interceptors/               # Cookies y caducidad de sesión
  features/auth/
    auth.router.ts              # Rutas del dominio de autenticación
    components/login/           # Login
    components/register/        # Registro
  features/home/                # Vista Home
  features/kanban/              # Vista Kanban
  features/tree/                # Vista Tree
  shared/
    ui/                         # Design system
    utils/                      # Funciones compartidas
  layout/                       # Sidebar y estructura
tests/unit/                     # Pruebas centralizadas, agrupadas por dominio
```

`SessionService` mantiene el estado mediante signals e inyecta `AUTH_SERVICE_TOKEN`. `AuthApiServiceImpl` y `AuthMockServiceImpl` implementan el contrato `AuthService`, sin mezclar transporte y estado. Los botones reciben iconos y estados mediante propiedades. `IconButton` distingue `kind="navigation"` y `kind="action"`: la navegación usa transición elástica al seleccionar y los botones de acción primarios responden a la presión. La directiva compartida `Ripple` proporciona capas de hover/foco y ondas con puntero o teclado; respeta controles deshabilitados, estado de carga y movimiento reducido.

Tailwind CSS 4 controla la estructura, los espacios, la tipografía y la adaptación móvil de login, registro y sidebar. Los tokens del design system se conectan a Tailwind mediante `@theme inline` en `src/styles.css`. Los estilos base y de controles usan las capas `base` y `components`, de modo que las utilidades pueden ajustarlos sin aumentar la especificidad.

### Selección de API o mock

El token se declara en `src/app/config/tokens.ts`. Los proveedores lo vinculan a una implementación mediante `useClass`:

```ts
// config/auth.providers.ts — desarrollo con API y producción
{ provide: AUTH_SERVICE_TOKEN, useClass: AuthApiServiceImpl }

// config/auth.providers.mock.ts — demo
{ provide: AUTH_SERVICE_TOKEN, useClass: AuthMockServiceImpl }
```

`pnpm dev:mock` reemplaza el archivo de proveedores durante la compilación; no registra HTTP. `pnpm dev:api` y `pnpm build` usan el proveedor API. Los consumidores dependen del token o de `SessionService`, sin seleccionar clases concretas en componentes.

Los alias `@core`, `@models`, `@configs`, `@features`, `@shared` y `@layout` se definen en `tsconfig.json`.

## Pruebas

```sh
pnpm test:unit
```

Las pruebas unitarias se encuentran en `tests/unit/`, con la misma organización por dominios que el código. Las interacciones y pruebas de navegador del catálogo están en `tests/storybook/`. Angular CLI y `tsconfig.spec.json` están configurados para descubrirlas allí.

Para ejecutar las pruebas en modo observación: `pnpm test`. Para compilar los modos de desarrollo: `pnpm build:api` y `pnpm build:mock`.

## Storybook

Catálogo de componentes y casos de uso, separado de `src/` y del build de la app. Reutiliza los componentes y estilos reales, con controles editables, eventos e interacciones. Login, registro y sidebar funcionan con fixtures en memoria mediante `AUTH_SERVICE_TOKEN`, sin backend ni peticiones API.

| Comando | Resultado |
| --- | --- |
| `pnpm storybook` | Catálogo interactivo en http://localhost:6006 |
| `pnpm storybook:build` | Catálogo estático en `storybook-static/` |
| `pnpm storybook:test` | Compila el catálogo y verifica historias, interacciones, estados CSS, móvil y axe en Chromium |
| `pnpm storybook:check-isolation` | Compila producción y comprueba que no contiene código, fixtures ni CSS exclusivos del catálogo |

Antes de las pruebas de navegador, instala Chromium una vez: `pnpm exec playwright install chromium`. Las fuentes del catálogo son locales. No hace falta ejecutar Java.

Configuración, historias y fixtures: `storybook/`. Pruebas: `tests/storybook/`. La salida `storybook-static/` se ignora en Git; la app sigue saliendo a `dist/open-f/browser/`. Tailwind escanea solo `src/app/` para la app; el catálogo añade sus propias fuentes de clases. Consulta [la guía del catálogo](storybook/README.md) para sus escenarios y para añadir historias.

## Paleta menta

Los tokens semánticos de `src/styles/tokens.css` definen la misma paleta para la app, Tailwind, los componentes y Storybook, incluidos hover, presión, foco, selección, errores y sombras.

| Uso | Oscuro | Claro |
| --- | --- | --- |
| Fondo | #0A0A0C | #F7F8F5 |
| Superficie | #19191C | #FFFFFF |
| Texto | #F2F0EC | #202723 |
| Texto secundario | #A2A29F | #626B65 |
| Borde de control | #656563 | #838C85 |
| Acción principal | #70D1A6 | #167550 |
| Texto sobre acción | #081B13 | #FFFFFF |
| Fondo seleccionado | #173529 | #E7F3EB |

La app sigue la apariencia del sistema. Para fijar un tema, usa `data-theme="dark"` o `data-theme="light"` en `<html>` o en un contenedor del DS. Quita el atributo o usa `data-theme="system"` para volver a la preferencia del sistema. Los controles nativos comparten el mismo `color-scheme`; no hace falta duplicar componentes ni clases Tailwind por tema.

En `pnpm storybook`, el selector de tema **Oscuro / Claro / Sistema** aplica la paleta completa al canvas y a los componentes. **Fundamentos → Design system → Colores** muestra también los tokens de estados. El catálogo arranca en oscuro. `pnpm storybook:test` verifica todas las historias y su accesibilidad en ambos temas, además del selector y los cambios de apariencia del sistema.
