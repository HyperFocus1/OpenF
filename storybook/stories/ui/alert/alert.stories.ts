import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Alert } from '@shared/ui';

const meta: Meta<{ message: string }> = {
  title: 'UI/Alert',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Alert] })],
  args: { message: 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos momentos.' },
  render: (args) => ({
    props: args,
    template: '<div class="openf-storybook-field"><of-alert>{{ message }}</of-alert></div>',
  }),
};
export default meta;
export const ConnectionError: StoryObj<{ message: string }> = {};
