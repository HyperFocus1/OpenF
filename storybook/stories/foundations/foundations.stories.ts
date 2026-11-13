import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrandMark, Icon } from '@shared/ui';

const meta: Meta = {
  title: 'Fundamentos/Design system',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Icon, BrandMark] })],
  parameters: {
    docs: {
      description: {
        component:
          'Tokens y componentes importados del design system de OpenF. El catálogo hereda DM Sans, colores y medidas de la app. Usa Tema para cambiar entre Menta oscuro, claro y sistema.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;
export const Colors: Story = {
  name: 'Colores',
  render: () => ({
    props: {
      colors: [
        ['Canvas', '--of-canvas'],
        ['Surface', '--of-surface'],
        ['Active', '--of-surface-active'],
        ['Text', '--of-text'],
        ['Muted', '--of-text-muted'],
        ['Outline', '--of-outline'],
        ['Primary', '--of-primary'],
        ['On primary', '--of-on-primary'],
        ['Primary hover', '--of-primary-hover'],
        ['Primary pressed', '--of-primary-pressed'],
        ['Selected', '--of-selected-background'],
        ['Selected text', '--of-selected-text'],
        ['Control border', '--of-input-outline'],
        ['Focus', '--of-focus'],
        ['Error', '--of-error'],
        ['Error background', '--of-error-background'],
      ],
    },
    template: `<div class="openf-storybook-frame"><h1 class="mb-6 text-2xl tracking-[0.123em]">Colores</h1><div class="openf-storybook-grid">@for (color of colors; track color[1]) {<div class="openf-storybook-card"><div class="openf-storybook-swatch" [style.background]="'var(' + color[1] + ')'"></div><strong>{{ color[0] }}</strong><code class="openf-storybook-caption">{{ color[1] }}</code></div>}</div></div>`,
  }),
};
export const TypographyAndSpacing: Story = {
  name: 'Tipografía y espacios',
  render: () => ({
    props: { spaces: [1, 2, 3, 4, 6, 8, 12] },
    template: `<div class="openf-storybook-frame openf-storybook-stack"><h1 class="text-3xl font-semibold">DM Sans · OpenF</h1><h2 class="text-2xl font-medium">Un lugar para organizar tus ideas</h2><p class="text-base">Texto principal, formularios y navegación.</p><p class="openf-storybook-caption">Texto secundario y ayuda contextual.</p><div class="openf-storybook-stack">@for (space of spaces; track space) {<div class="flex items-center gap-4"><span class="w-16">{{ space * 4 }} px</span><span class="block h-4 rounded bg-focus" [style.width.px]="space * 4"></span></div>}</div></div>`,
  }),
};
export const Icons: Story = {
  name: 'Iconos',
  render: () => ({
    props: {
      icons: [
        'plus',
        'sliders',
        'sparkles',
        'burst',
        'send',
        'brand',
        'kanban',
        'tree',
        'home',
        'checklist',
        'projects',
        'calendar',
        'apps',
        'user',
        'logout',
        'eye',
        'eye-off',
        'close',
        'arrow-right',
        'chevron',
        'alert',
      ],
    },
    template: `<div class="openf-storybook-frame"><h1 class="mb-6 text-2xl">Iconos</h1><div class="openf-storybook-grid">@for (icon of icons; track icon) {<div class="openf-storybook-card"><of-icon [name]="icon" /><span>{{ icon }}</span></div>}</div></div>`,
  }),
};
export const Brand: Story = {
  name: 'Marca',
  render: () => ({
    template:
      '<div class="openf-storybook-stack"><of-brand-mark /><of-brand-mark [tile]="true" /><of-brand-mark [tile]="true" [compact]="true" /><p class="openf-storybook-caption">Normal · tile · compact</p></div>',
  }),
};
