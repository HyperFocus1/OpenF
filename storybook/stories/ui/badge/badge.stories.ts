import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Badge, BadgeTone, IconName } from '@shared/ui';

interface BadgeArgs {
  label: string;
  tone: BadgeTone;
  icon: IconName | null;
  dot: boolean;
}
const meta: Meta<BadgeArgs> = {
  title: 'UI/Badge',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Badge] })],
  parameters: {
    docs: {
      description: {
        component:
          'Metadatos compactos no interactivos. El texto comunica el significado además del color. Usa exclusivamente la paleta semántica del DS.',
      },
    },
  },
  args: { label: 'Producto', tone: 'neutral', icon: null, dot: false },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'primary', 'danger'] },
    icon: { control: 'select', options: [null, 'chart', 'pen', 'file', 'check-circle'] },
  },
  render: (args) => ({
    props: args,
    template: '<of-badge [tone]="tone" [icon]="icon" [dot]="dot">{{ label }}</of-badge>',
  }),
};
export default meta;
type Story = StoryObj<BadgeArgs>;
export const Playground: Story = {};
export const Status: Story = { args: { label: 'En curso', tone: 'primary', dot: true } };
export const HighPriority: Story = { args: { label: 'Alta', tone: 'danger', icon: 'chart' } };
export const Tool: Story = { args: { label: 'Figma', icon: 'pen' } };
