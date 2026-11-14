import { Meta, StoryObj } from '@storybook/angular';
import { TabsPreview } from '../../../hosts/tabs-preview';
import { changeView } from '../../../../tests/storybook/interactions/kanban';

const meta = {
  title: 'UI/Tabs',
  component: TabsPreview,
  tags: ['autodocs'],
  args: {
    label: 'Vistas del proyecto',
    value: 'board',
    options: [
      { id: 'board', label: 'Tablero', icon: 'kanban' },
      { id: 'list', label: 'Lista', icon: 'list' },
      { id: 'project', label: 'Proyecto', icon: 'folder' },
    ],
  },
  argTypes: { value: { control: 'select', options: ['board', 'list', 'project'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Navegación entre subsecciones con iconos y selección mediante model(). Flechas, Home y End cambian y enfocan la pestaña. El panel enlaza su aria-labelledby con la pestaña seleccionada.',
      },
    },
  },
} satisfies Meta<TabsPreview>;
export default meta;
type Story = StoryObj<TabsPreview>;
export const Playground: Story = {};
export const Keyboard: Story = { name: 'Navegación con teclado', play: changeView };
export const Underline: Story = {
  name: 'Subrayadas con contadores',
  args: {
    variant: 'underline',
    value: 'comments',
    options: [
      { id: 'description', label: 'Descripción' },
      { id: 'comments', label: 'Comentarios', count: 3 },
      { id: 'attachments', label: 'Adjuntos', count: 4 },
      { id: 'activity', label: 'Actividad' },
    ],
  },
};
