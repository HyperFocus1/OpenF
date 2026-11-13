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
