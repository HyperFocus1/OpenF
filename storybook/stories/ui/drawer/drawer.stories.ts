import { Meta, StoryObj } from '@storybook/angular';
import { DrawerPreview } from '../../../hosts/overlay-preview';
import { openDrawer } from '../../../../tests/storybook/interactions/kanban';

const meta = {
  title: 'UI/Drawer',
  component: DrawerPreview,
  tags: ['autodocs'],
  args: { label: 'Detalle de ejemplo' },
  parameters: {
    docs: {
      description: {
        component:
          'Panel lateral reutilizable construido con CDK Overlay, TemplatePortal y CdkTrapFocus. Bloquea el scroll del fondo y restaura el foco. Estilos Tailwind y tokens del DS, sin servicios API.',
      },
    },
  },
} satisfies Meta<DrawerPreview>;
export default meta;
type Story = StoryObj<DrawerPreview>;
export const Playground: Story = {};
export const Open: Story = { name: 'Abierto', play: openDrawer };
export const Compact: Story = {
  name: 'Compacto',
  args: { variant: 'compact', scheme: 'dark' },
  play: openDrawer,
};
