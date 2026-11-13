import { Meta, StoryObj } from '@storybook/angular';
import { RoutePreview, routePreviewProviders } from '../../../hosts/route-preview';
import {
  loginEmpty,
  loginInvalid,
  loginSuccess,
  loginSlow,
  loginOffline,
} from '../../../../tests/storybook/interactions/auth';

const meta = {
  title: 'Auth/Login',
  component: RoutePreview,
  tags: ['autodocs'],
  decorators: [routePreviewProviders],
  args: { path: '/login', scenario: 'guest' },
  argTypes: {
    path: { control: false },
    scenario: { control: 'select', options: ['guest', 'invalid-credentials', 'slow', 'offline'] },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Formulario real con Signal Forms, guard y SessionService reales. AUTH_SERVICE_TOKEN recibe un adaptador de fixtures en memoria. Demo: demo@openf.local / OpenF1234!. Cada historia reinicia cuentas y sesión. Puedes navegar y volver a ejecutar las interacciones.',
      },
    },
  },
} satisfies Meta<RoutePreview>;
export default meta;
type Story = StoryObj<RoutePreview>;
export const Empty: Story = {};
export const RequiredFields: Story = { name: 'Campos obligatorios', play: loginEmpty };
export const SuccessfulLogin: Story = { name: 'Acceso correcto', play: loginSuccess };
export const InvalidCredentials: Story = {
  name: 'Credenciales incorrectas',
  args: { scenario: 'invalid-credentials' },
  play: loginInvalid,
};
export const SlowResponse: Story = {
  name: 'Respuesta lenta',
  args: { scenario: 'slow' },
  play: loginSlow,
};
export const Offline: Story = {
  name: 'Sin conexión',
  args: { scenario: 'offline' },
  play: loginOffline,
};
