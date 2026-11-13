import { expect, userEvent, within } from 'storybook/test';
import { demoCredentials } from '../../../storybook/fixtures/auth/auth.fixture';

interface CanvasContext {
  canvasElement: HTMLElement;
}
const canvasOf = (context: CanvasContext) => within(context.canvasElement);

async function enterLogin(context: CanvasContext): Promise<void> {
  const canvas = canvasOf(context);
  await userEvent.type(await canvas.findByLabelText('Correo'), demoCredentials.email);
  await userEvent.type(canvas.getByLabelText('Contraseña'), demoCredentials.password);
  await userEvent.click(canvas.getByRole('button', { name: 'Iniciar sesión' }));
}

async function enterRegistration(
  context: CanvasContext,
  confirmation = demoCredentials.password,
): Promise<void> {
  const canvas = canvasOf(context);
  await userEvent.type(await canvas.findByLabelText('Nombre'), 'Ada');
  await userEvent.type(canvas.getByLabelText('Apellido'), 'Lovelace');
  await userEvent.type(canvas.getByLabelText('Correo'), 'ada@openf.local');
  await userEvent.type(
    canvas.getByLabelText('Contraseña', { exact: true }),
    demoCredentials.password,
  );
  await userEvent.type(canvas.getByLabelText('Confirmar contraseña'), confirmation);
  await userEvent.click(canvas.getByRole('button', { name: 'Crear cuenta' }));
}

export async function loginEmpty(context: CanvasContext): Promise<void> {
  const canvas = canvasOf(context);
  await userEvent.click(await canvas.findByRole('button', { name: 'Iniciar sesión' }));
  await expect(canvas.getByText('Introduce tu correo.')).toBeVisible();
  await expect(canvas.getByLabelText('Correo')).toHaveFocus();
}
export async function loginSuccess(context: CanvasContext): Promise<void> {
  await enterLogin(context);
  await expect(
    await canvasOf(context).findByRole('heading', { name: 'Hi from Home' }),
  ).toBeVisible();
}
export async function loginInvalid(context: CanvasContext): Promise<void> {
  await enterLogin(context);
  await expect(await canvasOf(context).findByRole('alert')).toHaveTextContent(
    'El correo o la contraseña no son correctos.',
  );
}
export async function loginOffline(context: CanvasContext): Promise<void> {
  await enterLogin(context);
  await expect(await canvasOf(context).findByRole('alert')).toHaveTextContent(
    'No pudimos conectar con el servidor.',
  );
}
export async function loginSlow(context: CanvasContext): Promise<void> {
  await enterLogin(context);
  await expect(canvasOf(context).getByRole('button', { name: 'Entrando…' })).toBeDisabled();
  await expect(
    await canvasOf(context).findByRole('heading', { name: 'Hi from Home' }, { timeout: 5000 }),
  ).toBeVisible();
}
export async function registerEmpty(context: CanvasContext): Promise<void> {
  const canvas = canvasOf(context);
  await userEvent.click(await canvas.findByRole('button', { name: 'Crear cuenta' }));
  await expect(canvas.getByText('Introduce tu nombre.')).toBeVisible();
  await expect(canvas.getByLabelText('Nombre')).toHaveFocus();
}
export async function registerMismatch(context: CanvasContext): Promise<void> {
  await enterRegistration(context, 'OtraClave123!');
  await expect(canvasOf(context).getByText('Las contraseñas no coinciden.')).toBeVisible();
}
export async function registerSuccess(context: CanvasContext): Promise<void> {
  await enterRegistration(context);
  await expect(
    await canvasOf(context).findByRole('heading', { name: 'Hi from Home' }),
  ).toBeVisible();
}
export async function registerTaken(context: CanvasContext): Promise<void> {
  await enterRegistration(context);
  await expect(await canvasOf(context).findByRole('alert')).toHaveTextContent(
    'Ya existe una cuenta con ese correo.',
  );
}
export async function registerSlow(context: CanvasContext): Promise<void> {
  await enterRegistration(context);
  await expect(canvasOf(context).getByRole('button', { name: 'Creando cuenta…' })).toBeDisabled();
  await expect(
    await canvasOf(context).findByRole('heading', { name: 'Hi from Home' }, { timeout: 5000 }),
  ).toBeVisible();
}
