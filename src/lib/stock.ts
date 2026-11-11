export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  timestamp: number;
  formattedTime: string;
  isPositive: boolean;
  status: 'live' | 'fallback';
}

const FALLBACK_QUOTE: StockQuote = {
  symbol: '^GSPC',
  name: 'S&P 500 Index',
  price: 5864.67,
  change: 32.45,
  changePercent: 0.56,
  previousClose: 5832.22,
  dayHigh: 5878.10,
  dayLow: 5830.40,
  fiftyTwoWeekHigh: 5900.00,
  fiftyTwoWeekLow: 4920.00,
  currency: 'USD',
  timestamp: Date.now(),
  formattedTime: new Date().toUTCString(),
  isPositive: true,
  status: 'fallback'
};

// In-memory cache to prevent hitting rate limits during concurrent builds or fast clicks
let cachedQuote: StockQuote | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache
let ongoingFetch: Promise<StockQuote> | null = null;

export async function getSP500Quote(forceFresh = false): Promise<StockQuote> {
  const now = Date.now();
  if (!forceFresh && cachedQuote && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedQuote;
  }

  if (ongoingFetch) {
    return ongoingFetch;
  }

  ongoingFetch = fetchQuoteFromNetwork()
    .then((result) => {
      cachedQuote = result;
      lastFetchTime = Date.now();
      return result;
    })
    .finally(() => {
      ongoingFetch = null;
    });

  return ongoingFetch;
}

async function fetchQuoteFromNetwork(): Promise<StockQuote> {
  const endpoints = [
    'https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d',
    'https://query2.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d'
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;

      if (!meta || typeof meta.regularMarketPrice !== 'number') {
        continue;
      }

      const price = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose || meta.previousClose || price;
      const change = Number((price - previousClose).toFixed(2));
      const changePercent = Number(((change / previousClose) * 100).toFixed(2));
      const timestamp = meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now();

      return {
        symbol: meta.symbol || '^GSPC',
        name: meta.shortName || meta.longName || 'S&P 500',
        price: Number(price.toFixed(2)),
        change,
        changePercent,
        previousClose: Number(previousClose.toFixed(2)),
        dayHigh: Number((meta.regularMarketDayHigh || price).toFixed(2)),
        dayLow: Number((meta.regularMarketDayLow || price).toFixed(2)),
        fiftyTwoWeekHigh: Number((meta.fiftyTwoWeekHigh || price).toFixed(2)),
        fiftyTwoWeekLow: Number((meta.fiftyTwoWeekLow || price).toFixed(2)),
        currency: meta.currency || 'USD',
        timestamp,
        formattedTime: new Date(timestamp).toLocaleString('en-US', {
          timeZone: meta.exchangeTimezoneName || 'America/New_York',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        }),
        isPositive: change >= 0,
        status: 'live'
      };
    } catch {
      // Try next endpoint
    }
  }

  // If both network endpoints fail, return fallback with current time
  return {
    ...FALLBACK_QUOTE,
    timestamp: Date.now(),
    formattedTime: new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  };
}
