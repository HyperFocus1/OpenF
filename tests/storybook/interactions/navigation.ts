import { expect, userEvent, waitFor, within } from 'storybook/test';

interface CanvasContext {
  canvasElement: HTMLElement;
}

export async function navigateSidebar({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  for (const title of ['Kanban', 'Tree', 'Home']) {
    const button = await canvas.findByRole('button', { name: title });
    await userEvent.click(button);
    await expect(await canvas.findByRole('heading', { name: `Hi from ${title}` })).toBeVisible();
    await waitFor(async () => {
      await expect(button).toHaveAttribute('aria-current', 'page');
    });
  }
}
export async function accountMenu({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole('button', { name: 'OpenF, opciones de cuenta' }));
  await expect(canvas.getByRole('dialog', { name: 'Opciones de cuenta' })).toBeVisible();
  await expect(canvas.getByText('demo@openf.local')).toBeVisible();
}
export async function logout(context: CanvasContext): Promise<void> {
  await accountMenu(context);
  const canvas = within(context.canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Cerrar sesión' }));
  await expect(await canvas.findByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
}
