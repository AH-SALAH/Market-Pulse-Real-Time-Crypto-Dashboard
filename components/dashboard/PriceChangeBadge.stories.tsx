import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PriceChangeBadge } from './PriceChangeBadge';
import { PlainDecorator } from '../../stories/helpers/decorators';

const meta = {
  title: 'Dashboard/PriceChangeBadge',
  component: PriceChangeBadge,
  decorators: [PlainDecorator],
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 0,
  },
} satisfies Meta<typeof PriceChangeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: { value: 2.34 },
};

export const Negative: Story = {
  args: { value: -1.12 },
};

export const Zero: Story = {
  args: { value: 0 },
};

export const LargePositive: Story = {
  args: { value: 18.9 },
};
