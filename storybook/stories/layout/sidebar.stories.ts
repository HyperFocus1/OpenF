import { Meta, StoryObj } from '@storybook/angular';
import { RoutePreview, routePreviewProviders } from '../../hosts/route-preview';
import {
  navigateSidebar,
  accountMenu,
  logout,
} from '../../../tests/storybook/interactions/navigation';

const meta = {
  title: 'Layout/Sidebar',
  component: RoutePreview,
  tags: ['autodocs'],
  decorators: [routePreviewProviders],
  args: { path: '/app/home', scenario: 'authenticated' },
  argTypes: {
    path: { control: 'select', options: ['/app/home', '/app/kanban', '/app/tree'] },
    scenario: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sidebar y shell reales con sesión demo. La selección sigue al Router. Incluye menú de cuenta y cierre de sesión. Las vistas mantienen únicamente el saludo solicitado; el catálogo no añade contenido al producto.',
      },
    },
  },
} satisfies Meta<RoutePreview>;
export default meta;
type Story = StoryObj<RoutePreview>;
export const Home: Story = {};
export const Kanban: Story = { args: { path: '/app/kanban' } };
export const Tree: Story = { args: { path: '/app/tree' } };
export const Navigation: Story = { name: 'Navegación', play: navigateSidebar };
export const AccountMenu: Story = { name: 'Menú de cuenta', play: accountMenu };
export const SignOut: Story = { name: 'Cerrar sesión', play: logout };
