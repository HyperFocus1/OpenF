import { Meta, StoryObj } from '@storybook/angular';
import { Skeleton } from '@shared/ui';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: { shape: 'rectangle' },
  argTypes: { shape: { control: 'inline-radio', options: ['rectangle', 'circle'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Placeholder decorativo del DS. Usa clases Tailwind para sus dimensiones. Puede animarse en grupo con motion-safe:animate-pulse; permanece oculto para tecnologías de asistencia.',
      },
    },
  },
} satisfies Meta<Skeleton>;
export default meta;
type Story = StoryObj<Skeleton>;
export const Line: Story = {
  render: (args) => ({ props: args, template: '<of-skeleton [shape]="shape" class="h-3 w-48" />' }),
};
export const Circle: Story = {
  args: { shape: 'circle' },
  render: (args) => ({ props: args, template: '<of-skeleton [shape]="shape" class="size-9" />' }),
};
export const Block: Story = {
  render: (args) => ({
    props: args,
    template: '<of-skeleton [shape]="shape" class="h-28 w-64" />',
  }),
};
