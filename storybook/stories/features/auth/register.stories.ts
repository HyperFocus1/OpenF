import { Meta, StoryObj } from '@storybook/angular';
import { RoutePreview, routePreviewProviders } from '../../../hosts/route-preview';
import {
  registerEmpty,
  registerMismatch,
  registerSuccess,
  registerTaken,
  registerSlow,
} from '../../../../tests/storybook/interactions/auth';

const meta = {
  title: 'Auth/Registro',
  component: RoutePreview,
  tags: ['autodocs'],
  decorators: [routePreviewProviders],
  args: { path: '/register', scenario: 'guest' },
  argTypes: {
    path: { control: false },
    scenario: { control: 'select', options: ['guest', 'email-taken', 'slow', 'offline'] },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Registro real: campos obligatorios, correo, longitud y confirmación de contraseña. El alta correcta crea una cuenta efímera y abre Home. Los errores y la latencia se controlan por el mismo token de autenticación.',
      },
    },
  },
} satisfies Meta<RoutePreview>;
export default meta;
type Story = StoryObj<RoutePreview>;
export const Empty: Story = {};
export const RequiredFields: Story = { name: 'Campos obligatorios', play: registerEmpty };
export const PasswordMismatch: Story = { name: 'Contraseñas distintas', play: registerMismatch };
export const SuccessfulRegistration: Story = { name: 'Registro correcto', play: registerSuccess };
export const EmailTaken: Story = {
  name: 'Correo existente',
  args: { scenario: 'email-taken' },
  play: registerTaken,
};
export const SlowResponse: Story = {
  name: 'Respuesta lenta',
  args: { scenario: 'slow' },
  play: registerSlow,
};
