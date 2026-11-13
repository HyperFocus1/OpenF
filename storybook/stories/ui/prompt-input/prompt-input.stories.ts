import { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { PromptInput } from '@shared/ui';
import { submitPrompt } from '../../../../tests/storybook/interactions/controls';

const meta = {
  title: 'UI/PromptInput',
  component: PromptInput,
  tags: ['autodocs'],
  args: {
    label: 'Mensaje para el asistente',
    placeholder: '¿Qué quieres ajustar?',
    value: '',
    leadingIcon: 'burst',
    leadingLabel: 'Opciones de IA',
    sendIcon: 'send',
    sendLabel: 'Enviar mensaje',
    disabled: false,
    busy: false,
    submitted: fn(),
    leadingPressed: fn(),
  },
  render: (args) => ({
    props: args,
    template:
      '<of-prompt-input class="openf-storybook-prompt" [label]="label" [placeholder]="placeholder" [value]="value" [leadingIcon]="leadingIcon" [leadingLabel]="leadingLabel" [sendIcon]="sendIcon" [sendLabel]="sendLabel" [disabled]="disabled" [busy]="busy" (submitted)="submitted($event)" (leadingPressed)="leadingPressed()" />',
  }),
  argTypes: {
    submitted: { control: false },
    leadingPressed: { control: false },
    leadingIcon: { control: 'select', options: ['burst', 'plus', 'sliders'] },
    sendIcon: { control: 'select', options: ['send', 'arrow-right'] },
  },
} satisfies Meta<PromptInput>;
export default meta;
type Story = StoryObj<PromptInput>;
export const Compose: Story = { play: submitPrompt };
export const Filled: Story = { args: { value: 'Organizar mi semana' } };
export const Loading: Story = { args: { busy: true, value: 'Organizar mi semana' } };
export const Disabled: Story = { args: { disabled: true } };
