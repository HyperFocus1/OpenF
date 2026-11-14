import { Meta, StoryObj } from '@storybook/angular';
import { Avatar } from '@shared/ui';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Ana García', size: 'sm', tone: 'primary' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md'] },
    tone: { control: 'inline-radio', options: ['primary', 'neutral'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Avatar con fotografía opcional y nombre accesible; muestra iniciales cuando no hay imagen. XS para responsables de tarjetas, small para grupos y medium para perfiles.',
      },
    },
  },
} satisfies Meta<Avatar>;
export default meta;
type Story = StoryObj<Avatar>;
export const Playground: Story = {};
export const Medium: Story = { args: { size: 'md' } };
export const Portrait: Story = { args: { src: '/images/kanban/ana.jpg' } };
export const ExtraSmall: Story = {
  args: { src: '/images/kanban/mateo.jpg', name: 'Mateo Torres', size: 'xs' },
};
export const Neutral: Story = { args: { name: 'Mateo Torres', tone: 'neutral' } };
export const SingleName: Story = { args: { name: 'Sofía' } };
