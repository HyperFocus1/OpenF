import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { KanbanPage } from '@features/kanban/kanban-page';
import { KanbanLayout } from '@features/kanban/components/kanban-layout/kanban-layout';
import { KanbanLoading } from '@features/kanban/components/kanban-loading/kanban-loading';
import { KANBAN_TABS } from '@core/services/kanban/kanban-view.mapper';
import {
  emptySearch,
  showList,
  showRoadmap,
  showTask,
  showTaskContent,
} from '../../../tests/storybook/interactions/kanban';

const meta = {
  title: 'Vistas/Kanban',
  component: KanbanPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tablero oscuro con columnas dinámicas, tarjetas compactas y portadas locales. Lista y Roadmap reservan paneles vacíos. Mocks con demora de 400 ms y signals, arrastre CDK y detalle con CDK Overlay. Las modificaciones se reinician al recargar.',
      },
    },
  },
} satisfies Meta<KanbanPage>;
export default meta;
type Story = StoryObj<KanbanPage>;
export const Board: Story = { name: 'Tablero' };
export const Loading: Story = {
  name: 'Carga inicial',
  decorators: [moduleMetadata({ imports: [KanbanLayout, KanbanLoading] })],
  render: () => ({
    props: { tabs: KANBAN_TABS, activeView: 'board' },
    template: `
    <of-kanban-layout [tabs]="tabs" [(activeView)]="activeView">
      @if (activeView === 'board') { <of-kanban-loading /> }
      @else { <div id="kanban-panel" role="tabpanel" [attr.aria-labelledby]="'kanban-panel-tab-' + activeView" tabindex="0" class="mt-7 min-h-96"></div> }
    </of-kanban-layout>
  `,
  }),
};
export const List: Story = { name: 'Lista', play: showList };
export const Roadmap: Story = { play: showRoadmap };
export const Detail: Story = { name: 'Detalle de tarea', play: showTask };
export const Description: Story = {
  name: 'Detalle · Descripción',
  play: (context) => showTaskContent(context, 'Descripción'),
};
export const Attachments: Story = {
  name: 'Detalle · Adjuntos',
  play: (context) => showTaskContent(context, 'Adjuntos'),
};
export const Activity: Story = {
  name: 'Detalle · Actividad',
  play: (context) => showTaskContent(context, 'Actividad'),
};
export const Empty: Story = { name: 'Sin resultados', play: emptySearch };
