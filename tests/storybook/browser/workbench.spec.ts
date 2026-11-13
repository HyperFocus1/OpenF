import { expect, test } from '@playwright/test';

test('Controls actualiza el componente real y Actions recibe su evento', async ({ page }) => {
  await page.goto('/?path=/story/ui-button--playground');
  const canvas = page.frameLocator('#storybook-preview-iframe');
  await expect(canvas.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await page.getByRole('tab', { name: /Controls/ }).click();
  await page.locator('#control-label').fill('Crear tarea');
  await expect(canvas.getByRole('button', { name: 'Crear tarea' })).toBeVisible();
  await canvas.getByRole('button', { name: 'Crear tarea' }).click();
  await page.getByRole('tab', { name: /Actions/ }).click();
  await expect(
    page.getByRole('tabpanel', { name: 'Actions' }).getByText('clicked', { exact: true }),
  ).toBeVisible();
});

test('Guía muestra documentación y ejemplos en iframes independientes', async ({ page }) => {
  await page.goto('/?path=/docs/auth-login--guía');
  const docs = page.frameLocator('#storybook-preview-iframe');
  await expect(docs.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
  await expect(docs.getByText(/Formulario real con Signal Forms/)).toBeVisible();
  await expect(docs.locator('iframe').first()).toBeVisible();
});

test('Tema cambia componentes y canvas, y conserva la selección entre historias', async ({ page }) => {
  await page.goto('/?path=/story/ui-button--playground&globals=theme:dark');
  const canvas = page.frameLocator('#storybook-preview-iframe');
  await expect(canvas.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await page.getByRole('button', { name: /Paleta menta del design system/ }).click();
  await page.getByText('Claro', { exact: true }).click();
  await expect(canvas.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(canvas.locator('body')).toHaveCSS('background-color', 'rgb(247, 248, 245)');
  await expect(canvas.getByRole('button', { name: 'Continuar' })).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.getByRole('link', { name: 'Secondary', exact: true }).click();
  await expect(canvas.getByRole('button', { name: 'Continuar' })).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(canvas.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /Paleta menta del design system/ }).click();
  await page.getByText('Oscuro', { exact: true }).click();
  await expect(canvas.locator('body')).toHaveCSS('background-color', 'rgb(10, 10, 12)');
  await expect(canvas.getByRole('button', { name: 'Continuar' })).toHaveCSS('background-color', 'rgb(25, 25, 28)');
});

test('Sistema responde al cambio de apariencia sin recargar el componente', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/iframe.html?id=ui-button--playground&viewMode=story&globals=theme:system');
  const button = page.getByRole('button', { name: 'Continuar' });
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 248, 245)');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(button).toHaveCSS('color', 'rgb(8, 27, 19)');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(10, 10, 12)');
});
