import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // CoinGecko coin icons — served from the classic assets host and the newer
    // dedicated image CDN. next/image optimizes/sizes them (currently plain <img>).
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
