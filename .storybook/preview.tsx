import type { Preview } from '@storybook/nextjs-vite'
import { NextIntlClientProvider } from 'next-intl'
import defaultMessages from '../i18n/messages/en.json'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },

  // Components now read UI strings via useTranslations and render locale-aware
  // navigation links — provide the default (English) request config globally
  // so every story renders like a minimal /en route.
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={defaultMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default preview;
