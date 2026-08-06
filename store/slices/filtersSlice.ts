import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SortBy = 'market_cap' | 'price' | 'change24h';

export interface FiltersState {
  sortBy: SortBy;
  searchQuery: string;
}

const initialState: FiltersState = {
  sortBy: 'market_cap',
  searchQuery: '',
};

// Ephemeral UI state lives in Redux (PLAN.md §4.3); server data stays in React Query.
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
});

export const { setSortBy, setSearchQuery } = filtersSlice.actions;
export default filtersSlice.reducer;
