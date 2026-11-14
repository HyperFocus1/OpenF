# Kanban mock

La vista usa exclusivamente datos en memoria. No existe implementación API del dominio Kanban.

- `core/models/kanban/kanban.model.ts`: contratos de datos y comandos, independientes del DS y de los componentes.
- `core/services/kanban/kanban.service.ts`: contrato de acceso a los datos.
- `core/services/kanban/kanban-mock-impl.service.ts`: constantes privadas con todos los datos de ejemplo, almacenamiento local y operaciones de creación, actualización, movimiento y comentarios. Cada instancia clona las constantes para mantener su estado aislado. Genera los valores iniciales de nuevas tareas a partir del proyecto.
- `config/kanban.providers.ts`: vincula `KANBAN_SERVICE_TOKEN` con la implementación mock mediante `useClass`, siguiendo el patrón de autenticación existente. El proveedor tiene alcance de la vista y no registra HttpClient.
- `core/services/kanban/kanban-state.service.ts`: estado, búsqueda, ordenación, agrupación por columna, selección, formularios, resumen y acciones. Publica `KanbanViewModel` ya preparado; los snapshots se clonan para aislar el almacenamiento.
- `core/services/kanban/kanban-view.mapper.ts`: adapta los catálogos de la fuente a etiquetas, iconos y tonos del DS. Las pestañas de navegación son configuración del cliente; los nombres, IDs, cantidad y orden de columnas y opciones llegan de la fuente.
- `core/models/kanban/kanban-view.model.ts`: contrato de presentación y acciones tipadas.
- `features/kanban/kanban-page.ts`: punto de entrada de la ruta; conecta el servicio con la vista mediante bindings.
- `features/kanban/kanban.ts`: presentación pura, con un `input` y un `output`. Recibe el view model y emite acciones. No inyecta datos ni agrupa, filtra o busca tareas.
- Los componentes hijos reciben valores con `input()` y emiten intenciones con `output()`. No crean datos del proyecto ni modifican el almacenamiento. Los formularios conservan solo su borrador y validación local.
- `core/services/files/local-file.service.ts`: descarga de documentos locales mediante Blob, sin peticiones.

El layout usa Tailwind y la paleta semántica existente. Drawer usa CDK Overlay + TemplatePortal; Dropdown usa CdkConnectedOverlay. Los componentes del DS se documentan en Storybook, con controles y escenarios de interacción.

## Comportamiento asíncrono

`KanbanService` devuelve Observables de RxJS. El mock mantiene todos sus datos en constantes privadas del servicio y usa `timer(400)` para responder tras 400 ms por operación. Las lecturas, validaciones y escrituras se ejecutan al emitir; una solicitud sin suscripción o cancelada antes de la respuesta no modifica los datos.

`KanbanStateService` se suscribe y actualiza signals de datos, carga, guardado y error. Encadena la escritura y su lectura posterior con `switchMap`, libera el estado ocupado con `finalize` y cancela las solicitudes mediante `takeUntilDestroyed`. La carga inicial se muestra sin inventar datos del proyecto; permite reintentar una lectura fallida. Durante el guardado se bloquean envíos duplicados y controles de edición. El formulario y el borrador de comentario se conservan ante un fallo y se restablecen al confirmar la operación.

Los componentes reciben estos estados por inputs. `kanban.ts` sigue declarando únicamente `view` y `action`; las suscripciones de datos se gestionan en el servicio.

## Relación con JavaOpenF

Se revisaron `workspace/domain/model/ProjectColumn.java`, `Task.java`, `TaskPriority.java`, las respuestas de `workspace/api/response/` y `docs/HISTORIAS_USUARIO.md` en `D:/Dev/JavaOpenF`.

Una columna es una entidad del proyecto con ID, nombre, color y posición. La tarjeta pertenece a una columna mediante `columnId`; el orden de las tarjetas se representa con `positionY`. El cliente no define una unión cerrada de estados ni reconoce una columna por su nombre o por un ID fijo.

La respuesta mock amplía ese modelo con los atributos de la UI de referencia: responsables, áreas, herramientas, archivos, comentarios, calendario, iconos semánticos y metadatos de columnas completadas o en revisión. Es un contrato de pantalla enriquecido; el backend actual todavía expone un subconjunto de estas propiedades. La implementación actual sigue usando exclusivamente mocks.

La cantidad de columnas determina el grid. Los formularios reciben las opciones y valores iniciales de la fuente. Los casos de prueba usan cinco columnas con IDs y nombres diferentes, otro orden, una columna vacía y catálogos personalizados para comprobar esta separación.

## Tablero de referencia

El encabezado muestra `Tasks` y el selector Tablero, Lista y Roadmap debajo, ambos alineados a la izquierda.

El marco de página `KanbanLayout` mantiene el título, las pestañas y el foco mientras llega la primera respuesta. `KanbanLoading` muestra placeholders para el equipo, los filtros, las cabeceras de columnas y las tarjetas. Usa el componente `Skeleton` del DS y plantillas de presentación reutilizadas con `NgTemplateOutlet`; no contiene registros mock ni deduce columnas del backend. Las cuatro ranuras iniciales son solo una distribución visual de espera. Al llegar el snapshot, las columnas reales conservan su cantidad y orden dinámicos.

La carga conserva los 400 ms del mock. El skeleton se reemplaza por los datos o por el error con reintento; Lista y Roadmap continúan vacíos, incluso durante la carga. El estado se comunica mediante `aria-busy` y un mensaje accesible; las formas decorativas están ocultas para lectores de pantalla. Una sola animación de opacidad agrupa los placeholders y se desactiva con movimiento reducido. Storybook incluye `UI/Skeleton` y `Vistas/Kanban · Carga inicial`.

El tablero usa el tema oscuro de la paleta existente, columnas delineadas, tarjetas compactas, etiquetas de catálogo, responsables y contadores. Los colores de columnas y etiquetas llegan del mock, junto con las portadas y rutas de retratos. Las imágenes están en `public/images/kanban` y se sirven localmente. Los contadores representan totales de metadatos; archivos y comentarios incluyen una muestra del detalle. Al añadir un comentario aumenta su total.

`Tag` es el componente reutilizable del DS para etiquetas rectangulares. `Avatar` admite fotografía local opcional y tamaño XS. Ambos tienen escenarios y controles en Storybook. El arrastre CDK presenta una tarjeta inclinada mientras se mueve.

Solo Tablero tiene contenido. Lista y Roadmap mantienen pestañas accesibles con paneles vacíos. Proyecto y sus componentes se eliminaron.

Al abrir o cerrar el detalle se conservan las referencias de tarjetas, columnas y catálogos mediante `computed()`. La selección reutiliza el view model ya preparado; no vuelve a solicitar el tablero ni invalida todas las tarjetas. La agrupación por columna se calcula únicamente cuando cambian los datos o los filtros.

El drawer anima solo su desplazamiento durante 120 ms y usa un fondo atenuado sin desenfoque de pantalla completa. Respeta `prefers-reduced-motion`. Esta decisión sigue las recomendaciones de [animaciones de alto rendimiento de web.dev](https://web.dev/articles/animations-guide). La regresión de estado comprueba que abrir, cambiar y cerrar una tarea reutiliza los datos y no genera nuevas lecturas.

El detalle usa la variante compacta de Drawer: superficie oscura, borde redondeado, ancho de 400 px ampliable a 760 px y altura máxima de 720 px, siempre limitada al viewport. La barra superior permite ampliar, abrir las opciones de guardado/completado, ir a actividad, escribir un comentario y cerrar. Estado y prioridad conservan la edición en línea.

Tabs admite una variante subrayada con contadores, navegación por teclado y panel enlazado mediante ARIA. Comentarios es la pestaña inicial; Descripción, Adjuntos y Actividad tienen su propio contenido. La selección de pestaña y el borrador de respuesta son estado local de UI. Los datos, reacciones y registro de actividad se gestionan en el mock service. La respuesta prepara una mención en el formulario y las reacciones se guardan mediante el mismo contrato Observable con demora de 400 ms. Los mocks incluyen tres comentarios con retratos y reacciones, dos etiquetas, cuatro documentos y actividad; no se crean fixtures.

## Criterios verificados

La implementación sigue `best-practices.md`, los formularios existentes y estas fuentes oficiales de Angular:

- [Componentes centrados en presentación](https://angular.dev/style-guide#keep-components-and-directives-focused-on-presentation): la lógica desacoplada de la UI se extrae a otras clases o funciones.
- [Servicios e inyección](https://angular.dev/guide/di/creating-and-using-services): los servicios encapsulan datos y lógica. `@Service()` es el singleton moderno; se usa `@Injectable()` cuando se necesitan proveedores con alcance propio, como esta demo por vista.
- [Signals de solo lectura y estado derivado](https://angular.dev/guide/signals): escritura encapsulada, `asReadonly()` y `computed()` para datos derivados.
- [Cancelación con takeUntilDestroyed](https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed) e [interoperabilidad RxJS/signals](https://angular.dev/ecosystem/rxjs-interop): gestión del ciclo de vida y exposición del estado asíncrono a la UI.
- [Inputs de componentes](https://angular.dev/guide/components/inputs) y [outputs](https://angular.dev/guide/components/outputs): valores de entrada y eventos tipados.
- [Validación con Signal Forms](https://angular.dev/guide/forms/signals/validation): `form()`, `[formField]`, esquemas de validación y `submit()`, como en login y registro. Crear tarea y comentar usan este sistema.
- [CDK Overlay](https://material.angular.dev/cdk/overlay/overview): primitivas de overlay y posicionamiento, sin incorporar los estilos de Angular Material.

Las pruebas del dominio cubren el contrato por DI, ausencia de HTTP, aislamiento de los datos iniciales, creación, filtros, ordenación, progreso y comentarios. Las pruebas de navegador cubren el tablero y los paneles vacíos, CDK DragDrop, foco, cierre de overlays, descarga local y adaptación móvil. El catálogo ejecuta axe y comprueba ausencia de llamadas API en ambos temas.
