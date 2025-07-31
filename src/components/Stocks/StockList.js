import React from 'react';
import './StockList.css';

const StockList = ({ stocks, onStockClick }) => {
  // Safety check for stocks array
  if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
    return <div className="stock-list-empty">No stocks to display</div>;
  }
  const formatPrice = (price) => {
    if (!price || typeof price !== 'number' || isNaN(price)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatChange = (change) => {
    if (typeof change !== 'number' || isNaN(change)) {
      return '±0.00';
    }
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatPercent = (percent) => {
    if (typeof percent !== 'number' || isNaN(percent)) {
      return '±0.00%';
    }
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatVolume = (volume) => {
    // Handle undefined, null, or invalid volume values
    if (!volume || typeof volume !== 'number' || isNaN(volume)) {
      return 'N/A';
    }
    
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <div className="stock-list">
      {stocks.map((stock, index) => (
        <div
          key={`${stock.symbol}-${index}`}
          className="stock-item"
          onClick={() => onStockClick(stock)}
        >
          <div className="stock-header">
            <div className="stock-symbol">{stock.symbol || 'N/A'}</div>
            <div className="stock-price">{formatPrice(stock.price)}</div>
          </div>
          <div className="stock-name">{stock.name || 'Unknown Company'}</div>
          <div className="stock-changes">
            <span className={`change ${(stock.change || 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatChange(stock.change)}
            </span>
            <span className={`change-percent ${(stock.changePercent || 0) >= 0 ? 'positive' : 'negative'}`}>
              ({formatPercent(stock.changePercent)})
            </span>
          </div>
          <div className="stock-volume">
            Vol: {formatVolume(stock.volume)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockList;
