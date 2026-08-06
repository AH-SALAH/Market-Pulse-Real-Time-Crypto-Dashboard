import { describe, expect, it } from 'vitest';
import reducer, { setSearchQuery, setSortBy } from './filtersSlice';

describe('filtersSlice', () => {
  it('defaults to market cap sort and an empty query', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      sortBy: 'market_cap',
      searchQuery: '',
    });
  });

  it('setSortBy updates the sort order', () => {
    expect(reducer(undefined, setSortBy('change24h')).sortBy).toBe('change24h');
  });

  it('setSortBy replaces the previous sort order', () => {
    const afterChange = reducer(undefined, setSortBy('price'));
    expect(reducer(afterChange, setSortBy('change24h')).sortBy).toBe('change24h');
  });

  it('setSearchQuery updates the query string', () => {
    expect(reducer(undefined, setSearchQuery('bitcoin')).searchQuery).toBe('bitcoin');
  });

  it('setSearchQuery replaces the previous query string', () => {
    const afterFirst = reducer(undefined, setSearchQuery('bitcoin'));
    expect(reducer(afterFirst, setSearchQuery('ethereum')).searchQuery).toBe('ethereum');
  });

  it('does not mutate the previous state', () => {
    const before = reducer(undefined, { type: 'unknown' });
    const after = reducer(before, setSortBy('price'));
    expect(before).toEqual({ sortBy: 'market_cap', searchQuery: '' });
    expect(after).toEqual({ sortBy: 'price', searchQuery: '' });
  });
});
