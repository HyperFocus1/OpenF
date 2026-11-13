import { expect, userEvent, within } from 'storybook/test';

interface CanvasContext {
  canvasElement: HTMLElement;
}

export async function toggleSelection({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button', { name: 'Lista' });
  await userEvent.click(button);
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(canvas.getByRole('button', { name: 'Favorito' }));
  await expect(button).toHaveAttribute('aria-pressed', 'false');
}

export async function revealPassword({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('Contraseña');
  await userEvent.click(canvas.getByRole('button', { name: 'Mostrar contraseña' }));
  await expect(input).toHaveAttribute('type', 'text');
  await userEvent.click(canvas.getByRole('button', { name: 'Ocultar contraseña' }));
  await expect(input).toHaveAttribute('type', 'password');
}

export async function openAndClosePopover({ canvasElement }: CanvasContext): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Abrir opciones' }));
  await expect(canvas.getByRole('dialog', { name: 'Cuenta de ejemplo' })).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: 'Cerrar opciones' }));
  await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
}

export async function submitPrompt({
  canvasElement,
  args,
}: CanvasContext & { args: Record<string, unknown> }): Promise<void> {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox', { name: 'Mensaje para el asistente' });
  await userEvent.type(input, '  Organizar mi semana  ');
  await userEvent.click(canvas.getByRole('button', { name: 'Enviar mensaje' }));
  await expect(args['submitted']).toHaveBeenCalledWith('Organizar mi semana');
}
