import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ActionGroup, IconButton } from '@shared/ui';

const meta: Meta<{ direction: 'horizontal' | 'vertical'; gap: 'sm' | 'md' }> = {
  title: 'UI/ActionGroup',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ActionGroup, IconButton] })],
  args: { direction: 'horizontal', gap: 'md' },
  argTypes: {
    direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    gap: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  render: (args) => ({
    props: args,
    template:
      '<of-action-group label="Herramientas de tareas" [direction]="direction" [gap]="gap"><of-icon-button icon="plus" label="Crear tarea" /><of-icon-button icon="sliders" label="Filtrar tareas" /><of-icon-button icon="sparkles" label="Asistente" /></of-action-group>',
  }),
};
export default meta;
export const Horizontal: StoryObj<{ direction: 'horizontal' | 'vertical'; gap: 'sm' | 'md' }> = {};
export const Vertical: StoryObj<{ direction: 'horizontal' | 'vertical'; gap: 'sm' | 'md' }> = {
  args: { direction: 'vertical' },
};
