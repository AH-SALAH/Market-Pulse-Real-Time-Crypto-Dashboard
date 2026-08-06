import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useMemo } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { FilterBar } from './FilterBar';
import filtersReducer, { type SortBy } from '../../store/slices/filtersSlice';
import { PlainDecorator } from '../../stories/helpers/decorators';

// FilterBar reads/writes real Redux state — give each story a fresh store
// seeded from its args so the Controls panel drives the visible state.
function FilterBarWithState({ searchQuery, sortBy }: { searchQuery: string; sortBy: SortBy }) {
  const store = useMemo(
    () =>
      configureStore({
        reducer: { filters: filtersReducer },
        preloadedState: { filters: { searchQuery, sortBy } },
      }),
    [searchQuery, sortBy],
  );
  return (
    <Provider store={store}>
      <FilterBar />
    </Provider>
  );
}

const meta = {
  title: 'Dashboard/FilterBar',
  component: FilterBar,
  render: (args) => <FilterBarWithState {...args} />,
  decorators: [PlainDecorator],
  parameters: {
    layout: 'padded',
  },
  args: {
    searchQuery: '',
    sortBy: 'market_cap',
  },
  argTypes: {
    searchQuery: { control: 'text' },
    sortBy: {
      control: 'select',
      options: ['market_cap', 'price', 'change24h'],
    },
  },
} satisfies Meta<{ searchQuery: string; sortBy: SortBy }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveSearch: Story = {
  args: {
    searchQuery: 'bit',
    sortBy: 'change24h',
  },
};
