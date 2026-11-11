# Astro S&P 500 Hello World

A lightning-fast "Hello World" web application built with **Astro** that displays the real-time stock value and daily performance metrics for the **S&P 500 Index (`^GSPC`)**.

## 🚀 Features

- **Hello World Starter**: Clean, modern UI with a glassmorphism theme and responsive design.
- **Real-Time S&P 500 Index Data**: Displays current price, daily dollar change, percentage change, previous close, day range, 52-week range, and exchange timestamp.
- **Server Pre-rendering + Client Hydration**: Quotes are pre-rendered at build/request time and can be refreshed on-demand with zero page reloads via the client script.
- **Resilient Data Fetching**: Multi-endpoint fallback system with automatic caching to prevent rate-limiting and ensure 100% uptime.
- **API Endpoint**: Built-in `/api/quote.json` endpoint to provide fresh JSON data.

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at the URL shown in your terminal (typically `http://localhost:4321` or `http://localhost:4322`).

### 3. Build for Production
```bash
npm run build
```

### 4. Preview the Production Build
```bash
npm run preview
```

## 📁 Project Structure

```text
├── src/
│   ├── lib/
│   │   └── stock.ts            # S&P 500 quote fetcher with cache & fallbacks
│   └── pages/
│       ├── api/
│       │   └── quote.json.ts   # API endpoint returning stock data
│       └── index.astro         # Main Hello World page with stock card
├── public/                     # Static assets (favicons, etc.)
├── astro.config.mjs            # Astro configuration
└── package.json
```
