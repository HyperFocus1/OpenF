import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'OpenF · UI',
    colorPrimary: '#b3c5ff',
    colorSecondary: '#b3c5ff',
    appBg: '#101012',
    appContentBg: '#000000',
    fontBase: '"DM Sans", sans-serif',
  }),
});
