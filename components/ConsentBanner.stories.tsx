import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ConsentBanner } from './ConsentBanner';
import { CONSENT_STORAGE_KEY } from '../lib/analytics/consent';
import { PlainDecorator } from '../stories/helpers/decorators';

// Clear any persisted choice so the banner always starts undecided. Must run
// during render, not an effect: ConsentBanner's own mount effect reads the
// storage, and child effects run before parent effects — clearing in an effect
// here would happen too late (a prior story's stored choice would hide it).
function ResetConsent({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  }
  return <>{children}</>;
}

const meta = {
  title: 'Components/ConsentBanner',
  component: ConsentBanner,
  decorators: [PlainDecorator, (Story) => <ResetConsent>{Story()}</ResetConsent>],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ConsentBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {};

export const Accepted: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /accept all/i }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}')).toEqual({
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  },
};

export const Rejected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /reject all/i }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}')).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  },
};

export const Customizing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /customize/i }));
    await expect(
      await canvas.findByRole('checkbox', { name: /analytics/i }, { timeout: 5000 }),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('checkbox', { name: /ads/i }, { timeout: 5000 }),
    ).toBeVisible();
  },
};
