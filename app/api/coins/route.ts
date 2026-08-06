import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const API_KEY = process.env.COINGECKO_API_KEY;

// Simple in-memory cache
let cachedResponse: unknown = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 60 seconds

export async function GET(request: NextRequest) {
  const now = Date.now();
  
  // Return cached response if valid
  if (cachedResponse && (now - cacheTimestamp) < CACHE_DURATION) {
    return NextResponse.json(cachedResponse);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const vsCurrency = searchParams.get('vs_currency') || 'usd';
    const order = searchParams.get('order') || 'market_cap_desc';
    const perPage = searchParams.get('per_page') || '50';
    const page = searchParams.get('page') || '1';
    const sparkline = searchParams.get('sparkline') || 'true';

    const url = `${COINGECKO_API_URL}?vs_currency=${vsCurrency}&order=${order}&per_page=${perPage}&page=${page}&sparkline=${sparkline}`;

    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }, // Next.js cache for 60s
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Update cache
    cachedResponse = data;
    cacheTimestamp = now;

    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko API error:', error);
    
    // Return cached data if available
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }
    
    // Hardcoded fallback data (5 coins)
    const fallbackData = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        current_price: 43250.00,
        market_cap: 847000000000,
        market_cap_rank: 1,
        price_change_percentage_24h: 2.34,
        sparkline_in_7d: {
          price: Array.from({ length: 168 }, (_, i) => 42000 + Math.sin(i * 0.1) * 1500 + Math.random() * 500)
        }
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        current_price: 2650.00,
        market_cap: 318000000000,
        market_cap_rank: 2,
        price_change_percentage_24h: -1.12,
        sparkline_in_7d: {
          price: Array.from({ length: 168 }, (_, i) => 2600 + Math.sin(i * 0.1) * 100 + Math.random() * 50)
        }
      },
      {
        id: 'tether',
        symbol: 'usdt',
        name: 'Tether',
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        current_price: 1.00,
        market_cap: 95000000000,
        market_cap_rank: 3,
        price_change_percentage_24h: 0.01,
        sparkline_in_7d: {
          price: Array.from({ length: 168 }, (_, i) => 1 + Math.sin(i * 0.1) * 0.002)
        }
      },
      {
        id: 'binancecoin',
        symbol: 'bnb',
        name: 'BNB',
        image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        current_price: 315.00,
        market_cap: 48500000000,
        market_cap_rank: 4,
        price_change_percentage_24h: 0.87,
        sparkline_in_7d: {
          price: Array.from({ length: 168 }, (_, i) => 310 + Math.sin(i * 0.1) * 15 + Math.random() * 5)
        }
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        current_price: 98.50,
        market_cap: 44200000000,
        market_cap_rank: 5,
        price_change_percentage_24h: 3.45,
        sparkline_in_7d: {
          price: Array.from({ length: 168 }, (_, i) => 95 + Math.sin(i * 0.1) * 5 + Math.random() * 3)
        }
      }
    ];

    return NextResponse.json(fallbackData);
  }
}