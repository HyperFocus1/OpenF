import { Meta, StoryObj } from '@storybook/angular';
import { DropdownPreview } from '../../../hosts/overlay-preview';
import { openFilters } from '../../../../tests/storybook/interactions/kanban';

const meta = {
  title: 'UI/Dropdown',
  component: DropdownPreview,
  tags: ['autodocs'],
  args: { label: 'Filtros', icon: 'sliders', count: 0 },
  argTypes: { icon: { control: 'select', options: ['sliders', 'more', 'plus'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Overlay anclado mediante CdkConnectedOverlay, con posición alternativa, contención del foco y cierre mediante Escape o clic fuera. Adecuado para filtros y formularios compactos.',
      },
    },
  },
} satisfies Meta<DropdownPreview>;
export default meta;
type Story = StoryObj<DropdownPreview>;
export const Playground: Story = {};
export const ActiveFilters: Story = { args: { count: 2 } };
export const Open: Story = { name: 'Abierto', play: openFilters };
export const IconOnly: Story = {
  name: 'Solo icono',
  args: { iconOnly: true, icon: 'more' },
  play: openFilters,
};
