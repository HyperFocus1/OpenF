import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { Button, ButtonVariant, IconName } from '@shared/ui';
import { ButtonToggle } from '../../../hosts/button-toggle';
import { toggleSelection } from '../../../../tests/storybook/interactions/controls';

interface ButtonArgs {
  label: string;
  variant: ButtonVariant;
  size: 'sm' | 'md' | 'lg';
  icon: IconName | null;
  iconPosition: 'start' | 'end';
  busy: boolean;
  disabled: boolean;
  active: boolean;
  toggle: boolean;
  clicked: () => void;
}
const meta: Meta<ButtonArgs> = {
  title: 'UI/Button',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button, ButtonToggle] })],
  parameters: {
    docs: {
      description: {
        component:
          'Botón real de la app. Primary para la acción principal; secondary, ghost y danger según intención. El hover, el ripple y la presión se producen al interactuar: no se imitan con estilos de Storybook.',
      },
    },
  },
  args: {
    label: 'Continuar',
    variant: 'primary',
    size: 'md',
    icon: null,
    iconPosition: 'start',
    busy: false,
    disabled: false,
    active: false,
    toggle: false,
    clicked: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: 'select', options: [null, 'plus', 'arrow-right', 'logout', 'checklist'] },
    iconPosition: { control: 'inline-radio', options: ['start', 'end'] },
    clicked: { control: false },
  },
  render: (args) => ({
    props: args,
    template:
      '<button [ofButton]="variant" [size]="size" [icon]="icon" [iconPosition]="iconPosition" [busy]="busy" [disabled]="disabled" [active]="active" [toggle]="toggle" (click)="clicked()">{{ label }}</button>',
  }),
};
export default meta;
type Story = StoryObj<ButtonArgs>;
export const Playground: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Danger: Story = { args: { variant: 'danger', label: 'Eliminar' } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const LeadingIcon: Story = { args: { icon: 'plus', label: 'Crear' } };
export const TrailingIcon: Story = { args: { icon: 'arrow-right', iconPosition: 'end' } };
export const Loading: Story = { args: { busy: true, label: 'Guardando…' } };
export const Disabled: Story = { args: { disabled: true } };
export const Toggle: Story = {
  render: () => ({ template: '<book-button-toggle />' }),
  play: toggleSelection,
};
