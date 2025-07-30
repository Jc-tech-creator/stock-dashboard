# Stock Dashboard

A comprehensive React-based stock dashboard application that provides real-time market data, portfolio management, and trading capabilities.

## Features

### Market Data
- **Search Bar**: Search for stocks with real-time suggestions
- **Top Gainers**: Display top performing stocks
- **Top Losers**: Display worst performing stocks  
- **Trending Stocks**: Show currently trending stocks

### Portfolio Management
- **Holdings View**: View your current stock positions with returns
- **Treemap Visualization**: Visual representation of portfolio performance
- **Portfolio Analytics**: Track total returns and performance metrics

### Analytics & Charts
- **Net Wealth Chart**: Track portfolio value over time
- **Return Rate Chart**: Monitor return percentages
- **Historical Price Charts**: Individual stock price history

### Trading
- **Buy/Sell Modal**: Execute trades directly from the dashboard
- **Stock Details**: View comprehensive stock information
- **Transaction History**: Track your trading activity

## API Endpoints

The application expects a backend server running on `http://localhost:3001` with the following endpoints:

- `GET /api/search?q={query}` - Search for stocks
- `GET /api/top/gainer` - Get top gaining stocks
- `GET /api/top/loser` - Get top losing stocks
- `GET /api/top/trending` - Get trending stocks
- `GET /api/portfolio` - Get user portfolio data
- `GET /api/daily_snapshot` - Get historical portfolio snapshots
- `GET /api/history/{ticker}` - Get historical price data for a stock
- `POST /api/buy` - Execute buy orders
- `POST /api/sell` - Execute sell orders

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```
REACT_APP_API_BASE=http://localhost:3001
```

3. Start the development server:
```bash
npm start
```

## Dependencies

- React 19.1.1
- Recharts (for charts)
- D3 (for treemap visualization)
- Axios (for API calls)
- React Modal (for trading modal)

## Project Structure

```
src/
├── components/
│   ├── SearchBar.js         # Stock search functionality
│   ├── StockList.js         # Display lists of stocks
│   ├── Portfolio.js         # Portfolio container with tabs
│   ├── Holdings.js          # Holdings view component
│   ├── Treemap.js          # Treemap visualization
│   ├── Charts.js           # Portfolio performance charts
│   └── StockModal.js       # Trading modal component
├── App.js                  # Main application component
├── App.css                 # Main application styles
└── index.js               # Application entry point
```

## Usage

1. **Search Stocks**: Use the search bar in the upper left to find stocks
2. **View Market Data**: Browse top gainers, losers, and trending stocks
3. **Manage Portfolio**: Switch between Holdings and Treemap views
4. **Execute Trades**: Click on any stock to open the trading modal
5. **Monitor Performance**: View charts showing your portfolio's performance over time

## Development

To start the development server:
```bash
npm start
```

To build for production:
```bash
npm run build
```

To run tests:
```bash
npm test
```

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
