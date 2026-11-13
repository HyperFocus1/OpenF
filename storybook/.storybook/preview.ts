import type { Preview } from '@storybook/angular';
import { themes } from 'storybook/theming';
import { waitFor } from 'storybook/test';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Paleta menta del design system',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Oscuro' },
          { value: 'light', title: 'Claro' },
          { value: 'system', title: 'Sistema' },
        ],
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme: unknown = context.globals['theme'];
      if (theme === 'light' || theme === 'dark') {
        document.documentElement.dataset['theme'] = theme;
      } else {
        delete document.documentElement.dataset['theme'];
      }
      return story();
    },
  ],
  beforeEach: ({ canvasElement }) => {
    delete canvasElement.dataset['catalogReady'];
  },
  afterEach: async ({ canvasElement }) => {
    await waitFor(
      () => {
        const route = canvasElement.querySelector('book-route-preview');
        if (route && !route.querySelector('h1')) throw new Error('Esperando la vista de Angular');
      },
      { timeout: 5000 },
    );
    canvasElement.dataset['catalogReady'] = 'true';
  },
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: { theme: themes.dark, story: { inline: false, height: '400px' } },
    backgrounds: { disable: true },
    viewport: {
      options: {
        mobile: { name: 'Móvil · 360', styles: { width: '360px', height: '800px' } },
        tablet: { name: 'Tablet · 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop · 1440', styles: { width: '1440px', height: '900px' } },
      },
    },
    a11y: {
      test: 'error',
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } },
    },
    options: { storySort: { order: ['Fundamentos', 'UI', 'Layout', 'Auth', 'Vistas'] } },
  },
  initialGlobals: { theme: 'dark' },
};
export default preview;
