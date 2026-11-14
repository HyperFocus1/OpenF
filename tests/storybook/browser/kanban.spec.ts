import { expect, test } from '@playwright/test';

const taskTitle =
  'Analyze competitors and industry trends to identify best practices and areas for improvement.';

test.beforeEach(async ({ page }) => {
  await page.goto('/iframe.html?id=vistas-kanban--board&viewMode=story&globals=theme:light');
  await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
});

test('crea tareas, valida el nombre y conserva el estado entre las subsecciones', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Nueva tarea' }).click();
  const panel = page.getByRole('dialog', { name: 'Crear tarea' });
  await panel.getByRole('button', { name: 'Crear tarea', exact: true }).click();
  await expect(panel.getByText('Escribe el nombre de la tarea.')).toBeVisible();
  await panel
    .getByRole('textbox', { name: 'Nombre de la tarea' })
    .fill('Validar prototipo con el equipo');
  await panel.getByLabel('Estado', { exact: true }).selectOption('review');
  await panel.getByLabel('Prioridad', { exact: true }).selectOption('high');
  await panel.getByRole('button', { name: 'Crear tarea', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Creando tarea…', exact: true })).toBeDisabled();
  await expect(panel.getByRole('textbox', { name: 'Nombre de la tarea' })).toBeDisabled();
  await expect(panel).not.toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Under review', exact: true })
      .getByRole('button', { name: 'Validar prototipo con el equipo', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Lista', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toBeEmpty();
  await page.getByRole('tab', { name: 'Roadmap', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toBeEmpty();
  await expect(page.getByRole('tab', { name: 'Proyecto', exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Tablero', exact: true }).click();
  await expect(page.locator('of-task-card')).toHaveCount(12);
  await expect(
    page.getByRole('button', { name: 'Validar prototipo con el equipo', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('of-task-card')).toHaveCount(11);
  await expect(
    page.getByRole('button', { name: 'Validar prototipo con el equipo', exact: true }),
  ).toHaveCount(0);
});

test('filtra por texto, prioridad y responsable y conserva los datos al cambiar de pestaña', async ({
  page,
}) => {
  await page.getByRole('searchbox').fill('certificates');
  await expect(page.locator('of-task-card')).toHaveCount(1);
  await page.getByRole('searchbox').fill('ninguna coincidencia');
  await expect(page.getByRole('heading', { name: 'No encontramos tareas' })).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar todas las tareas' }).click();
  await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  const filter = page.getByRole('dialog', { name: 'Filtros', exact: true });
  await filter.getByLabel('Prioridad', { exact: true }).selectOption('high');
  await filter.getByLabel('Responsable', { exact: true }).selectOption('Ana García');
  await page.keyboard.press('Escape');
  await expect(page.locator('of-task-card')).toHaveCount(4);
  await page.getByRole('tab', { name: 'Lista', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toBeEmpty();
  await page.getByRole('tab', { name: 'Tablero', exact: true }).click();
  await expect(page.locator('of-task-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'Filtros' }).click();
  await filter.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('of-task-card')).toHaveCount(11);
});

test('el detalle actualiza estado, prioridad, guardados y comentarios en memoria', async ({
  page,
}) => {
  await page.getByRole('button', { name: taskTitle, exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Detalle de tarea' });
  await expect(panel.getByLabel('Estado', { exact: true })).toHaveValue('review');
  await expect(panel.getByLabel('Prioridad', { exact: true })).toHaveValue('high');
  await panel.getByLabel('Prioridad', { exact: true }).selectOption('low');
  await panel.getByRole('button', { name: 'Opciones de tarea', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Opciones de tarea', exact: true });
  await menu.getByRole('button', { name: 'Guardar tarea', exact: true }).click();
  await expect(menu.getByRole('button', { name: 'Quitar de guardados' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.press('Escape');
  await expect(panel).toBeVisible();
  await panel
    .getByRole('textbox', { name: 'Escribir un comentario' })
    .fill('Validado con el equipo.');
  await panel.getByRole('button', { name: 'Comentar', exact: true }).click();
  await expect(panel.getByText('Validado con el equipo.', { exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Opciones de tarea', exact: true }).click();
  await menu.getByRole('button', { name: 'Marcar como completada' }).click();
  await expect(panel.getByLabel('Estado', { exact: true })).toHaveValue('done');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  const card = page
    .getByRole('region', { name: 'Completed', exact: true })
    .getByRole('button', { name: taskTitle, exact: true });
  await expect(card).toBeVisible();
  await card.click();
  await expect(panel.getByText('Validado con el equipo.', { exact: true })).toBeVisible();
  await expect(panel.getByLabel('Prioridad', { exact: true })).toHaveValue('low');
});

test('Overlay contiene el foco, cierra fuera y con Escape, y restaura el foco', async ({
  page,
}) => {
  const card = page.getByRole('button', { name: taskTitle, exact: true });
  await card.click();
  const panel = page.getByRole('dialog', { name: 'Detalle de tarea' });
  const close = panel.getByRole('button', { name: 'Cerrar panel' });
  await expect(close).toBeFocused();
  const last = panel.getByRole('button', { name: 'Responder a Sofía Ruiz', exact: true });
  await last.focus();
  await page.keyboard.press('Tab');
  await expect(panel.getByRole('button', { name: 'Ampliar detalle' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
  await card.click();
  await page.locator('.of-overlay-backdrop').click({ position: { x: 10, y: 10 } });
  await expect(panel).not.toBeVisible();
  await expect(card).toBeFocused();
});

test('CDK mueve una tarjeta entre columnas y conserva el orden', async ({ page }) => {
  const first = page.getByRole('button', {
    name: 'List admin APIs for international pricing by country',
    exact: true,
  });
  const destination = page
    .getByRole('region', { name: 'Work in progress', exact: true })
    .locator('.cdk-drop-list');
  const sourceBox = (await first.boundingBox())!;
  const destinationBox = (await destination.boundingBox())!;
  await page.mouse.move(sourceBox.x + 40, sourceBox.y + 40);
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + 50, sourceBox.y + 50, { steps: 5 });
  await page.mouse.move(destinationBox.x + 100, destinationBox.y + 20, { steps: 20 });
  await page.mouse.up();
  await expect(
    page.getByRole('region', { name: 'Work in progress', exact: true }).locator('of-task-card'),
  ).toHaveCount(4);
  await expect(
    page.getByRole('region', { name: 'To do', exact: true }).locator('of-task-card'),
  ).toHaveCount(2);
  await page
    .getByRole('region', { name: 'Work in progress', exact: true })
    .getByRole('button', {
      name: 'List admin APIs for international pricing by country',
      exact: true,
    })
    .click();
  await expect(page.getByRole('dialog').getByLabel('Estado', { exact: true })).toHaveValue('todo');
});

test('los archivos se descargan como documentos locales', async ({ page }) => {
  await page.getByRole('button', { name: taskTitle, exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Detalle de tarea' })
    .getByRole('tab', { name: /Adjuntos/ })
    .click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar Brief del proyecto', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('Brief del proyecto.txt');
  expect(await download.failure()).toBeNull();
});

test('el detalle compacto cambia pestañas, responde, reacciona y se amplía', async ({ page }) => {
  await page.getByRole('button', { name: taskTitle, exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Detalle de tarea', exact: true });
  await expect(panel.getByRole('tab', { name: /Comentarios.*3/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await panel.getByRole('button', { name: 'Responder a Mateo Torres', exact: true }).click();
  const composer = panel.getByRole('textbox', { name: 'Escribir un comentario' });
  await expect(composer).toBeFocused();
  await expect(composer).toHaveValue('@Mateo Torres ');
  await composer.fill('¿Podrías elaborarlo?');
  await panel.getByRole('button', { name: 'Comentar', exact: true }).click();
  await expect(composer).toBeDisabled();
  await expect(panel.getByText('¿Podrías elaborarlo?', { exact: true })).toBeVisible();
  await expect(composer).toHaveValue('');
  await expect(panel.getByRole('tab', { name: /Comentarios.*4/ })).toBeVisible();
  await panel
    .getByRole('button', { name: 'Me gusta al comentario de Mateo Torres', exact: true })
    .click();
  const reaction = panel.getByRole('button', {
    name: 'Reaccionar con 👍 al comentario de Mateo Torres',
    exact: true,
  });
  await expect(reaction).toHaveAttribute('aria-pressed', 'true');
  await reaction.click();
  await expect(reaction).toHaveCount(0);
  await panel.getByRole('tab', { name: 'Descripción', exact: true }).click();
  await expect(
    panel.getByRole('region', { name: 'Descripción de la tarea', exact: true }),
  ).toContainText('Design System');
  await panel.getByRole('tab', { name: /Adjuntos.*4/ }).click();
  await expect(
    panel.getByRole('region', { name: 'Archivos de la tarea' }).getByRole('button'),
  ).toHaveCount(4);
  await panel.getByRole('button', { name: 'Ver actividad', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Actividad de la tarea' })).toContainText(
    'añadió un comentario.',
  );
  const narrow = (await panel.boundingBox())!.width;
  await panel.getByRole('button', { name: 'Ampliar detalle', exact: true }).click();
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeGreaterThan(narrow);
  await panel.getByRole('button', { name: 'Reducir detalle', exact: true }).click();
  await expect.poll(async () => (await panel.boundingBox())!.width).toBe(narrow);
});

test('el detalle compacto cabe en móvil y respeta el movimiento reducido', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('of-task-card button').first().click();
  const panel = page.getByRole('dialog', { name: 'Detalle de tarea', exact: true });
  const box = (await panel.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(344);
  expect(box.height).toBeLessThanOrEqual(624);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  expect(await panel.evaluate((node) => getComputedStyle(node).animationName)).toBe('none');
  await panel.getByRole('tab', { name: /Adjuntos/ }).click();
  await expect(
    panel.getByRole('button', { name: 'Descargar Brief del proyecto', exact: true }),
  ).toBeVisible();
});

test('el shell cabe en móvil y el desplazamiento horizontal queda dentro de las vistas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/iframe.html?id=layout-sidebar--kanban&viewMode=story&globals=theme:light');
  await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();
  for (const view of ['Tablero', 'Lista', 'Roadmap']) {
    await page.getByRole('tab', { name: view, exact: true }).click();
    const widths = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(widths.content).toBeLessThanOrEqual(widths.viewport);
  }
  await page.getByRole('tab', { name: 'Tablero', exact: true }).click();
  await page.getByRole('button', { name: 'Nueva tarea' }).click();
  const panel = page.getByRole('dialog', { name: 'Crear tarea' });
  await expect(panel).toBeVisible();
  expect(Math.round((await panel.boundingBox())!.width)).toBeLessThanOrEqual(360);
});
