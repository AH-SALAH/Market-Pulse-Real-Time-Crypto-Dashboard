import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sparkline } from './Sparkline';
import { PlainDecorator } from '../../stories/helpers/decorators';
import { makeSparkline } from '../../stories/helpers/mockData';

const meta = {
  title: 'Dashboard/Sparkline',
  component: Sparkline,
  decorators: [PlainDecorator],
  parameters: {
    layout: 'centered',
  },
  args: {
    data: makeSparkline(48, 62000, 0.04, 7),
    width: 104,
    height: 34,
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Upward: Story = {};

export const Downward: Story = {
  args: { data: makeSparkline(48, 62000, -0.04, 11) },
};

export const Flat: Story = {
  args: { data: Array.from({ length: 24 }, () => 100) },
};

export const SinglePoint: Story = {
  args: { data: [64520] },
};

export const Empty: Story = {
  args: { data: [] },
};
