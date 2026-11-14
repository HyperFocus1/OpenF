import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  staticDirs: [{ from: '../../public/images', to: '/images' }],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/angular', options: {} },
  core: { disableTelemetry: true },
  docs: { defaultName: 'Guía' },
};
export default config;
