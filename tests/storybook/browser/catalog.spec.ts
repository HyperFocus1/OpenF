import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import axe, { type AxeResults } from 'axe-core';

interface Entry {
  id: string;
  title: string;
  name: string;
  type: string;
}
const index = JSON.parse(readFileSync('storybook-static/index.json', 'utf8')) as {
  entries: Record<string, Entry>;
};

for (const story of Object.values(index.entries).filter((entry) => entry.type === 'story')) {
  test(`${story.title} / ${story.name}: interacción, accesibilidad y sin API`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/') || url.origin !== baseURL) {
        requests.push(url.href);
        return route.abort();
      }
      return route.continue();
    });
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await expect(page.locator('#storybook-root')).toHaveAttribute('data-catalog-ready', 'true');
    await expect(page.locator('#storybook-root > *')).not.toHaveCount(0);
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
    await page.addScriptTag({ content: axe.source });
    const accessibility = await page.evaluate(async () => {
      const axe = (
        window as unknown as {
          axe: { run: (context: string, options: object) => Promise<AxeResults> };
        }
      ).axe;
      return axe.run('#storybook-root', {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      });
    });
    expect(
      accessibility.violations.map(
        (item) => `${item.id}: ${item.nodes.map((node) => node.target.join(' ')).join(', ')}`,
      ),
    ).toEqual([]);
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
  });
}
