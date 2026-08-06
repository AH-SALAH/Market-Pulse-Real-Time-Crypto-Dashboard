import { pushToDataLayer } from './dataLayer';
import { redactPII } from './redactPII';

interface CoinSelectedParams {
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
}

interface WatchlistAddedParams {
  coin_id: string;
  coin_name: string;
}

interface FilterAppliedParams {
  filter_type: 'sort' | 'search';
  filter_value: string;
}

interface ChartRangeChangedParams {
  coin_id: string;
  days: number;
}

interface PriceAlertCreatedParams {
  coin_id: string;
  target_price: number;
  note?: string;
}

interface SearchPerformedParams {
  search_term: string;
}

export function coin_selected(params: CoinSelectedParams): void {
  pushToDataLayer({
    event: 'coin_selected',
    ...params,
  });
}

export function watchlist_added(params: WatchlistAddedParams): void {
  pushToDataLayer({
    event: 'watchlist_added',
    ...params,
  });
}

export function filter_applied(params: FilterAppliedParams): void {
  pushToDataLayer({
    event: 'filter_applied',
    ...params,
    filter_value: redactPII(params.filter_value),
  });
}

export function chart_range_changed(params: ChartRangeChangedParams): void {
  pushToDataLayer({
    event: 'chart_range_changed',
    ...params,
  });
}

export function price_alert_created(params: PriceAlertCreatedParams): void {
  pushToDataLayer({
    event: 'price_alert_created',
    ...params,
    note: params.note ? redactPII(params.note) : undefined,
  });
}

// TODO(T041): wire search_performed into the search input debounced handler in Phase 5
export function search_performed(params: SearchPerformedParams): void {
  pushToDataLayer({
    event: 'search_performed',
    ...params,
    search_term: redactPII(params.search_term),
  });
}
