import { Meta, StoryObj } from '@storybook/angular';
import { PopoverPreview } from '../../../hosts/popover-preview';
import { openAndClosePopover } from '../../../../tests/storybook/interactions/controls';

const meta = {
  title: 'UI/Popover',
  component: PopoverPreview,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Popover nativo: abre con el botón, cierra con Escape o clic fuera. Usa la capa superior del navegador y conserva los estilos del menú de cuenta.',
      },
    },
  },
} satisfies Meta<PopoverPreview>;
export default meta;
export const Account: StoryObj<PopoverPreview> = { play: openAndClosePopover };
