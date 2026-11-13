# Catálogo OpenF

Ejecuta `pnpm storybook` desde `web/` y abre http://localhost:6006. Usa Canvas para probar el componente, Controls para modificar sus propiedades, Actions para ver los eventos y Guía para consultar ejemplos. El selector de viewport permite revisar móvil, tablet y escritorio. El panel Accessibility ejecuta axe sobre cada ejemplo.

## Casos de uso

| Grupo                        | Qué permite comprobar                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Fundamentos                  | Colores reales, DM Sans, espaciado, iconos y marca                                                            |
| UI/Button                    | Variantes, tamaños, iconos antes/después, carga, disabled y selección interactiva                             |
| UI/IconButton                | Acción/navegación, forma, selección de ruta, tooltip, carga y unavailable                                     |
| UI/FormField e Input         | Vacío, valor, ayuda, error, disabled y mostrar/ocultar contraseña                                             |
| UI/Alert y Popover           | Errores accesibles y apertura/cierre con teclado o clic fuera                                                 |
| UI/ActionGroup y PromptInput | Composición, orientación, eventos, entrada y bloqueo durante carga                                            |
| Auth                         | Validación real, acceso/registro correcto, credenciales incorrectas, correo existente, latencia y desconexión |
| Layout/Sidebar               | Home/Kanban/Tree, selección por URL, menú de cuenta y cierre de sesión                                        |
| Vistas                       | Los tres saludos iniciales sin añadir contenido al producto                                                   |

Las historias con `play` ejecutan un caso de uso y quedan en su estado final. Puedes repetirlo desde Interactions. En las historias de respuesta lenta, el botón permanece bloqueado 1,8 segundos y después completa la acción. Cambia el escenario en Controls o vuelve a la historia Empty para explorar manualmente. Cuenta demo: `demo@openf.local` / `OpenF1234!`.

El hover, la presión y el foco se comprueban interactuando con los controles reales. No hay clases que simulen esos estados. El runner también usa hover y mouse-down nativos, teclado y movimiento reducido.

## Estructura y aislamiento

```text
storybook/
  .storybook/              configuración de Storybook y tema del catálogo
  stories/foundations/     tokens, marca e iconos
  stories/ui/<componente>/ casos por componente
  stories/layout/          sidebar y shell
  stories/features/        autenticación y vistas
  hosts/                   composición mínima de componentes reales
  fixtures/auth/           implementación controlable del contrato AuthService
  styles/                  fuentes locales y estructura exclusiva del catálogo
  tsconfig.json            compilación independiente
tests/storybook/
  interactions/            funciones play compartidas, fuera de las historias
  browser/                 regresión de todas las historias, CSS real y axe
  playwright.config.ts     runner Chromium
  serve.mjs                servidor local del build para las pruebas
```

El catálogo importa desde `src/`; la app nunca importa el catálogo. `SessionService`, guards, rutas y componentes siguen siendo los reales. Solo `AUTH_SERVICE_TOKEN` cambia a `AuthFixture`, que compone la implementación mock existente y añade fallos/latencia controlados. No se registra HttpClient ni se configura proxy. Cada historia reinicia la sesión y las cuentas.

El stylesheet del catálogo importa los estilos de la app y amplía sus fuentes Tailwind. El stylesheet de la app limita su detección de clases a `src/app/`. Las dependencias de Storybook y las fuentes locales son de desarrollo. El build de la app conserva su configuración de API.

## Añadir un componente

1. Crea `stories/ui/<componente>/<componente>.stories.ts` e importa el componente de `@shared/ui`.
2. Define Meta, args, argTypes y una descripción del uso. Añade escenarios con significado: vacío, error, carga, disabled, etc.
3. Si requiere estado o contenido proyectado, crea un host pequeño en `hosts/`. No copies la implementación ni el CSS del componente.
4. Coloca las comprobaciones `play` en `tests/storybook/interactions/` y referencia esas funciones desde la historia. El runner descubre automáticamente todas las historias.
5. Ejecuta `pnpm storybook:test`, `pnpm test:unit` y `pnpm storybook:check-isolation`.

Se versionan configuración, historias, fixtures y pruebas. `storybook-static/`, resultados y cachés son generados y se ignoran. El catálogo estático se puede servir en un host de archivos independiente; no se publica junto con la app por defecto.
