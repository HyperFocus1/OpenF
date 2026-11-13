import { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { IconButton } from '@shared/ui';

const meta = {
  title: 'UI/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: {
    icon: 'plus',
    label: 'Crear tarea',
    kind: 'action',
    variant: 'primary',
    size: 'md',
    shape: 'circle',
    active: false,
    toggle: false,
    current: false,
    disabled: false,
    unavailable: false,
    busy: false,
    tooltip: '',
    tooltipPlacement: 'right',
    pressed: fn(),
  },
  argTypes: {
    icon: {
      control: 'select',
      options: ['plus', 'home', 'kanban', 'tree', 'eye', 'send', 'apps', 'brand'],
    },
    kind: { control: 'inline-radio', options: ['action', 'navigation'] },
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    shape: { control: 'inline-radio', options: ['rounded', 'circle'] },
    tooltipPlacement: { control: 'inline-radio', options: ['right', 'top'] },
    pressed: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'La etiqueta accesible es obligatoria. Navigation anima la selección y rellena el icono; action primary responde a la presión. Disabled elimina el foco; unavailable conserva el foco pero impide la acción. Usa el ratón o Tab para comprobar los estados reales.',
      },
    },
  },
} satisfies Meta<IconButton>;
export default meta;
type Story = StoryObj<IconButton>;
export const Playground: Story = {};
export const Navigation: Story = {
  args: { icon: 'home', label: 'Home', kind: 'navigation', variant: 'secondary', size: 'lg' },
};
export const CurrentPage: Story = { args: { ...Navigation.args, active: true, current: true } };
export const Rounded: Story = { args: { shape: 'rounded' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Tooltip: Story = { args: { tooltip: 'Crear tarea', tooltipPlacement: 'top' } };
export const Disabled: Story = { args: { disabled: true } };
export const Unavailable: Story = { args: { unavailable: true } };
export const Loading: Story = { args: { busy: true } };
