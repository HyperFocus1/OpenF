import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Home } from '@features/home/home';
import { Tree } from '@features/tree/tree';

const meta: Meta = {
  title: 'Vistas/Iniciales',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Home, Tree] })],
  parameters: {
    docs: {
      description: {
        component:
          'Vistas iniciales sin contenido adicional, independientes del shell y del backend.',
      },
    },
  },
};
export default meta;
export const HomeView: StoryObj = { name: 'Home', render: () => ({ template: '<of-home />' }) };
export const TreeView: StoryObj = { name: 'Tree', render: () => ({ template: '<of-tree />' }) };
