import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CoinCard, CoinCardSkeleton } from './CoinCard';
import { QueryClientDecorator } from '../../stories/helpers/decorators';
import { mockCoin } from '../../stories/helpers/mockData';

const meta = {
  title: 'Dashboard/CoinCard',
  component: CoinCard,
  decorators: [QueryClientDecorator],
  parameters: {
    layout: 'padded',
  },
  args: {
    coin: mockCoin(),
    rank: 1,
  },
} satisfies Meta<typeof CoinCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Negative: Story = {
  args: {
    coin: mockCoin({
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 3421.87,
      price_change_percentage_24h: -1.12,
      sparkline_in_7d: { price: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => 3400 - n * 12) },
    }),
    rank: 2,
  },
};

export const Loading: Story = {
  render: () => <CoinCardSkeleton />,
};

export const LongNameOverflow: Story = {
  args: {
    coin: mockCoin({
      id: 'super-long-ai-blockchain-token-name',
      symbol: 'slabtn',
      name: 'Super Long AI Blockchain Gaming DeFi Token Name That Cannot Fit',
      current_price: 0.0000421,
      price_change_percentage_24h: 0,
    }),
    rank: 99,
  },
};
