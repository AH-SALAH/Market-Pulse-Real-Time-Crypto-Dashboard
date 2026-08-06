// CoinGecko API client - calls local Next.js route handlers (never CoinGecko directly)

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export interface CoinChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

const API_BASE = '/api';

export async function getCoins(): Promise<Coin[]> {
  try {
    const response = await fetch(`${API_BASE}/coins`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coins: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('getCoins error:', error);
    throw error;
  }
}

export async function getCoinChart(coinId: string, days: number = 1): Promise<CoinChartData> {
  try {
    const response = await fetch(`${API_BASE}/coins/${coinId}/chart?days=${days}`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chart for ${coinId}: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('getCoinChart error:', error);
    throw error;
  }
}