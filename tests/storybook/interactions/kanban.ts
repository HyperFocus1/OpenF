import { expect, userEvent, waitFor, within } from 'storybook/test';

interface CanvasContext {
  canvasElement: HTMLElement;
}

export async function changeView({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  const tab = canvas.getByRole('tab', { name: 'Tablero' });
  tab.focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect(canvas.getByRole('tab', { name: 'Lista' })).toHaveAttribute('aria-selected', 'true');
  await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Lista');
}

export async function openDrawer({ canvasElement }: CanvasContext): Promise<void> {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abrir detalle' }));
  await waitFor(() =>
    expect(
      within(canvasElement.ownerDocument.body).getByRole('dialog', { name: 'Detalle de ejemplo' }),
    ).toBeVisible(),
  );
}

export async function openFilters({ canvasElement }: CanvasContext): Promise<void> {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filtros' }));
  await waitFor(() =>
    expect(
      within(canvasElement.ownerDocument.body).getByRole('dialog', { name: 'Filtros' }),
    ).toBeVisible(),
  );
}

export async function showList({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole('tab', { name: 'Lista' }));
  await expect(canvas.getByRole('tabpanel')).toBeEmptyDOMElement();
}

export async function showRoadmap({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole('tab', { name: 'Roadmap' }));
  await expect(canvas.getByRole('tabpanel')).toBeEmptyDOMElement();
}

export async function showTask({ canvasElement }: CanvasContext): Promise<void> {
  await userEvent.click(
    await within(canvasElement).findByRole('button', {
      name: 'Update the Design System to Support Dark Mode and High Contrast Accessibility Options',
    }),
  );
  await waitFor(() =>
    expect(
      within(canvasElement.ownerDocument.body).getByRole('dialog', { name: 'Detalle de tarea' }),
    ).toBeVisible(),
  );
}

export async function showTaskContent(context: CanvasContext, tab: string): Promise<void> {
  await showTask(context);
  const dialog = within(context.canvasElement.ownerDocument.body).getByRole('dialog', {
    name: 'Detalle de tarea',
  });
  await userEvent.click(within(dialog).getByRole('tab', { name: new RegExp(tab) }));
}

export async function emptySearch({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.type(
    await canvas.findByRole('searchbox', { name: 'Buscar tareas' }),
    'sin coincidencias',
  );
  await expect(canvas.getByRole('heading', { name: 'No encontramos tareas' })).toBeVisible();
}
