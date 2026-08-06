import { beforeEach, describe, expect, it, vi } from 'vitest';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock('./dataLayer', () => ({
  pushToDataLayer: pushMock,
}));

import {
  chart_range_changed,
  coin_selected,
  filter_applied,
  price_alert_created,
  search_performed,
  watchlist_added,
} from './events';

describe('analytics events', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('coin_selected pushes event with coin params', () => {
    coin_selected({ coin_id: 'bitcoin', coin_name: 'Bitcoin', coin_symbol: 'btc' });
    expect(pushMock).toHaveBeenCalledWith({
      event: 'coin_selected',
      coin_id: 'bitcoin',
      coin_name: 'Bitcoin',
      coin_symbol: 'btc',
    });
  });

  it('watchlist_added pushes event', () => {
    watchlist_added({ coin_id: 'ethereum', coin_name: 'Ethereum' });
    expect(pushMock).toHaveBeenCalledWith({
      event: 'watchlist_added',
      coin_id: 'ethereum',
      coin_name: 'Ethereum',
    });
  });

  it('filter_applied redacts free-text filter value', () => {
    filter_applied({ filter_type: 'search', filter_value: 'mail me@x.com' });
    expect(pushMock).toHaveBeenCalledWith({
      event: 'filter_applied',
      filter_type: 'search',
      filter_value: 'mail [redacted]',
    });
  });

  it('chart_range_changed pushes event', () => {
    chart_range_changed({ coin_id: 'bitcoin', days: 7 });
    expect(pushMock).toHaveBeenCalledWith({
      event: 'chart_range_changed',
      coin_id: 'bitcoin',
      days: 7,
    });
  });

  it('price_alert_created redacts note', () => {
    price_alert_created({
      coin_id: 'bitcoin',
      target_price: 70000,
      note: 'ping john.doe@x.com',
    });
    expect(pushMock).toHaveBeenCalledWith({
      event: 'price_alert_created',
      coin_id: 'bitcoin',
      target_price: 70000,
      note: 'ping [redacted]',
    });
  });

  it('search_performed redacts search term', () => {
    search_performed({ search_term: 'solana 555-123-4567' });
    expect(pushMock).toHaveBeenCalledWith({
      event: 'search_performed',
      search_term: 'solana [redacted]',
    });
  });
});
