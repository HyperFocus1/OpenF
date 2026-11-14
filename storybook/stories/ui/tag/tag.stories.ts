import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Tag } from '@shared/ui';

interface TagArgs {
  label: string;
  color?: string;
  emoji?: string;
}
const meta: Meta<TagArgs> = {
  title: 'UI/Tag',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Tag] })],
  args: { label: 'Product' },
  argTypes: { color: { control: 'color' }, emoji: { control: 'text' } },
  parameters: {
    docs: {
      description: {
        component:
          'Etiqueta rectangular compacta para catálogos. Admite color de la fuente y un marcador opcional. El texto siempre comunica su significado; los colores deben asegurar contraste AA con blanco.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: '<of-tag [color]="color" [emoji]="emoji">{{ label }}</of-tag>',
  }),
};
export default meta;
type Story = StoryObj<TagArgs>;
export const Playground: Story = {};
export const Priority: Story = { args: { label: 'Important', color: '#50513e', emoji: '🔥' } };
export const Category: Story = { args: { label: 'UX Design', color: '#62494b' } };
export const Column: Story = { args: { label: 'TO DO', color: '#484354' } };
