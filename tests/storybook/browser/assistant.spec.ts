import { expect, test } from '@playwright/test';

test('el sprite reproduce el atlas y pausa al salir de pantalla', async ({ page }) => {
  await page.goto('/iframe.html?id=ui-assistantsprite--walking&viewMode=story&globals=theme:dark');
  const sprite = page.locator('of-assistant-sprite');
  const image = sprite.locator('img');
  await expect(image).toHaveJSProperty('naturalWidth', 768);
  const initial = await image.evaluate((node) => getComputedStyle(node).transform);
  await expect
    .poll(() => image.evaluate((node) => getComputedStyle(node).transform))
    .not.toBe(initial);
  await sprite.evaluate((node) => {
    node.style.transform = 'translateY(200vh)';
  });
  await expect(sprite).toHaveAttribute('data-paused', 'true');
  expect(await image.evaluate((node) => getComputedStyle(node).animationPlayState)).toBe('paused');
  await sprite.evaluate((node) => {
    node.style.transform = '';
  });
  await expect(sprite).toHaveAttribute('data-paused', 'false');
});

test('el movimiento reducido detiene los fotogramas y la oscilación', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=ui-assistantsprite--walking&viewMode=story&globals=theme:light');
  const sprite = page.locator('of-assistant-sprite');
  await expect(sprite).toBeVisible();
  expect(await sprite.locator('img').evaluate((node) => getComputedStyle(node).animationName)).toBe(
    'none',
  );
  expect(
    await sprite.locator('.sprite-motion').evaluate((node) => getComputedStyle(node).animationName),
  ).toBe('none');
});

test('los eventos desplazan la misma instancia, cancelan reacciones anteriores y permiten pausar', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=layout-assistant--events&viewMode=story&globals=theme:dark');
  const sprite = page.locator('of-app-assistant of-assistant-sprite');
  await expect(sprite).toBeVisible();
  await page.getByRole('button', { name: 'Restablecer', exact: true }).click();
  const stage = page.locator('.assistant-stage');
  const original = await stage.elementHandle();
  const right = (await stage.boundingBox())!.x;
  await page.getByRole('button', { name: 'Ir a la izquierda', exact: true }).click();
  await expect(sprite).toHaveAttribute('data-state', 'moving');
  await expect.poll(async () => (await stage.boundingBox())!.x).toBeLessThan(right - 100);
  await expect(stage).toHaveJSProperty('isConnected', true);
  expect(
    await original!.evaluate((node) => node === document.querySelector('.assistant-stage')),
  ).toBe(true);
  await page.getByRole('button', { name: 'Pensar', exact: true }).click();
  await expect(sprite).toHaveAttribute('data-state', 'thinking');
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(sprite).toHaveAttribute('data-paused', 'true');
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  await expect(sprite).toHaveAttribute('data-paused', 'false');
  await page.getByRole('button', { name: /Saludar a.*asistente de OpenF/ }).click();
  await expect(page.getByRole('status')).toHaveText('¡Hola! Estoy aquí para ayudarte.');
});

test('el login mantiene oculto el actor y lo muestra al entrar al espacio de trabajo', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=auth-login--empty&viewMode=story&args=scenario:slow&globals=theme:light',
  );
  await expect(page.locator('of-app-assistant of-assistant-sprite')).toHaveCount(0);
  await page.getByLabel('Correo', { exact: true }).fill('demo@openf.local');
  await page.getByLabel('Contraseña', { exact: true }).fill('OpenF1234!');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Entrando…', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hi from Home', exact: true })).toBeVisible();
  await expect(page.locator('of-app-assistant of-assistant-sprite')).toHaveAttribute(
    'data-variant',
    'character',
  );
});

test('la navegación conserva el actor y sus límites en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/iframe.html?id=layout-sidebar--home&viewMode=story&globals=theme:dark');
  const stage = page.locator('.assistant-stage');
  await expect(stage).toBeVisible();
  const original = await stage.elementHandle();
  await page.getByRole('button', { name: 'Tree', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hi from Tree', exact: true })).toBeVisible();
  expect(
    await original!.evaluate((node) => node === document.querySelector('.assistant-stage')),
  ).toBe(true);
  await expect(page.locator('of-app-assistant of-assistant-sprite')).toHaveAttribute(
    'data-state',
    'idle',
  );
  const box = (await stage.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(80);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  expect(box.y + box.height).toBeLessThanOrEqual(800);
});
