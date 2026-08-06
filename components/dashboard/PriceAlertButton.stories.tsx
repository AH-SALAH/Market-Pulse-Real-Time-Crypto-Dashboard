import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userEvent, screen, within } from 'storybook/test';
import { PriceAlertButton } from './PriceAlertButton';
import { alertsQueryKey } from '../../hooks/useAlerts';
import { DarkBackground } from '../../stories/helpers/decorators';
import type { AlertItem } from '../../lib/alerts';

function AlertDecorator(alerts: AlertItem[]) {
  return function Decorator(Story: () => ReactNode) {
    const client = useMemo(() => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: Infinity },
          mutations: { retry: false },
        },
      });
      queryClient.setQueryData(alertsQueryKey, alerts);
      return queryClient;
    }, []);
    return (
      <QueryClientProvider client={client}>
        <DarkBackground>
          <Story />
        </DarkBackground>
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: 'Dashboard/PriceAlertButton',
  component: PriceAlertButton,
  parameters: {
    layout: 'padded',
  },
  args: {
    coinId: 'bitcoin',
    coinName: 'Bitcoin',
    currentPrice: 64520.31,
    label: 'Alert',
  },
} satisfies Meta<typeof PriceAlertButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [AlertDecorator([])],
};

export const OpenWithExistingAlerts: Story = {
  decorators: [
    AlertDecorator([
      {
        id: 'a1',
        coinId: 'bitcoin',
        coinName: 'Bitcoin',
        targetPrice: 60000,
        note: undefined,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'a2',
        coinId: 'bitcoin',
        coinName: 'Bitcoin',
        targetPrice: 70000,
        note: 'sell high',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'a3',
        coinId: 'ethereum',
        coinName: 'Ethereum',
        targetPrice: 3000,
        note: undefined,
        createdAt: new Date().toISOString(),
      },
    ]),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /set a price alert for bitcoin/i }));
    // Popover content portals to document.body — query via screen, not canvas.
    await screen.findByText('$60,000');
    await screen.findByText('$70,000');
  },
};

export const FormInteraction: Story = {
  decorators: [AlertDecorator([])],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /set a price alert for bitcoin/i }));
    const input = await screen.findByRole('spinbutton', { name: /target price/i });
    await userEvent.type(input, '65000');
    await userEvent.click(await screen.findByRole('button', { name: /^set alert$/i }));
  },
};
