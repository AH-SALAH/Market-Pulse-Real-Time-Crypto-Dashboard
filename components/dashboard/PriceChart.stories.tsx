import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PriceChart } from './PriceChart';
import { PlainDecorator } from '../../stories/helpers/decorators';
import { makeChartPrices } from '../../stories/helpers/mockData';

const meta = {
  title: 'Dashboard/PriceChart',
  component: PriceChart,
  decorators: [PlainDecorator],
  parameters: {
    layout: 'padded',
  },
  args: {
    prices: makeChartPrices(7),
    days: 7,
  },
} satisfies Meta<typeof PriceChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneDay: Story = {
  args: {
    prices: makeChartPrices(1, 64000, 0.006),
    days: 1,
  },
};

export const SevenDay: Story = {};

export const ThirtyDay: Story = {
  args: {
    prices: makeChartPrices(30, 58000, 0.045, 99),
    days: 30,
  },
};

export const LoadingEmpty: Story = {
  // While chart data loads (CoinDetailView passes `data?.prices ?? []`), the
  // chart receives an empty series and renders an empty canvas.
  args: {
    prices: [],
    days: 7,
  },
};
