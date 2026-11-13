import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'OpenF · UI',
    colorPrimary: '#70d1a6',
    colorSecondary: '#70d1a6',
    appBg: '#19191c',
    appContentBg: '#0a0a0c',
    fontBase: '"DM Sans", sans-serif',
  }),
});
