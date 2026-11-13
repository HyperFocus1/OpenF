import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormField, Input } from '@shared/ui';
import { PasswordField } from '../../../hosts/password-field';
import { revealPassword } from '../../../../tests/storybook/interactions/controls';

interface FieldArgs {
  label: string;
  value: string;
  hint: string;
  error: string;
  disabled: boolean;
  type: 'text' | 'email';
}
const meta: Meta<FieldArgs> = {
  title: 'UI/FormField e Input',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormField, Input, PasswordField] })],
  args: { label: 'Correo', value: '', hint: '', error: '', disabled: false, type: 'email' },
  argTypes: { type: { control: 'inline-radio', options: ['text', 'email'] } },
  parameters: {
    docs: {
      description: {
        component:
          'FormField proyecta el input real y conecta label, hint y error mediante IDs. Input aporta los estados de borde y foco. Los ejemplos no sustituyen la validación de Signal Forms; esa validación se prueba en Auth.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<of-form-field class="openf-storybook-field" [label]="label" controlId="book-field" [hint]="hint" [error]="error">
    <input ofInput id="book-field" [type]="type" [value]="value" placeholder=" " [disabled]="disabled" [ofInvalid]="!!error" [attr.aria-invalid]="error ? true : null" [attr.aria-describedby]="error ? 'book-field-error' : (hint ? 'book-field-hint' : null)">
  </of-form-field>`,
  }),
};
export default meta;
type Story = StoryObj<FieldArgs>;
export const Empty: Story = {};
export const Filled: Story = { args: { value: 'demo@openf.local' } };
export const Hint: Story = { args: { hint: 'Usaremos este correo para tu cuenta.' } };
export const Error: Story = { args: { value: 'correo', error: 'Introduce un correo válido.' } };
export const Disabled: Story = { args: { disabled: true, value: 'demo@openf.local' } };
export const Password: Story = {
  render: () => ({ template: '<book-password-field />' }),
  play: revealPassword,
};
