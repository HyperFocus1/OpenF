import { expect, test } from '@playwright/test';

test('hover y presión usan los estados CSS reales; el ripple responde al puntero', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=ui-iconbutton--ghost&viewMode=story');
  await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
  const button = page.getByRole('button', { name: 'Crear tarea' });
  await button.hover();
  await expect
    .poll(() =>
      button.evaluate(
        (element) =>
          getComputedStyle(element.querySelector('.of-state-layer')!, '::before').opacity,
      ),
    )
    .toBe('0.08');
  await page.mouse.down();
  await expect(button.locator('.of-ripple')).toHaveCount(1);
  await page.mouse.up();
  await expect(button.locator('.of-ripple')).toHaveCount(0);

  await page.goto('/iframe.html?id=ui-button--playground&viewMode=story');
  await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
  const primary = page.getByRole('button', { name: 'Continuar' });
  await primary.hover();
  await page.mouse.down();
  await expect
    .poll(() => primary.evaluate((element) => getComputedStyle(element).transform))
    .toMatch(/matrix\(0\.95, 0, 0, 0\.9,/);
  await page.mouse.up();
});

test('teclado, foco visible y controles bloqueados', async ({ page }) => {
  await page.goto('/iframe.html?id=ui-button--secondary&viewMode=story');
  await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
  await page.keyboard.press('Tab');
  const button = page.getByRole('button', { name: 'Continuar' });
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await page.keyboard.down('Space');
  await expect(button.locator('.of-ripple')).toHaveCount(1);
  await page.keyboard.up('Space');
  await page.goto('/iframe.html?id=ui-button--disabled&viewMode=story');
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Continuar' })).not.toBeFocused();
});

test('movimiento reducido y tooltip con Escape', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=ui-iconbutton--tooltip&viewMode=story');
  await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
  const button = page.getByRole('button', { name: 'Crear tarea' });
  await button.hover();
  await expect(page.locator('.tooltip')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Escape');
  await expect(page.locator('.tooltip')).toHaveCSS('opacity', '0');
  const duration = await button.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration.split(',').every((value) => parseFloat(value) <= 0.001)).toBe(true);
});

test('popover cierra al pulsar fuera', async ({ page }) => {
  await page.goto('/iframe.html?id=ui-popover--account&viewMode=story');
  await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
  await page.getByRole('button', { name: 'Abrir opciones' }).click();
  await expect(page.getByRole('dialog', { name: 'Cuenta de ejemplo' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Cuenta de ejemplo' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Abrir opciones' }).click();
  await page.mouse.click(1100, 100);
  await expect(page.getByRole('dialog', { name: 'Cuenta de ejemplo' })).not.toBeVisible();
});

test('login y registro caben en móvil sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const id of ['auth-login--empty', 'auth-registro--empty', 'layout-sidebar--home']) {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
    const widths = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(widths.content).toBeLessThanOrEqual(widths.viewport);
  }
});

test('los enlaces de autenticación permanecen dentro del catálogo', async ({ page }) => {
  await page.goto('/iframe.html?id=auth-registro--empty&viewMode=story');
  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
  await page.getByRole('link', { name: 'OpenF, ir al acceso' }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page).toHaveURL(/iframe\.html\?id=auth-registro--empty/);
  await page.getByRole('link', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
});
