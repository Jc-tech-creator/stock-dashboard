import React from 'react';
import './Holdings.css';

const Holdings = ({ portfolioData, onStockClick }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${parseFloat(value).toFixed(2)}%`;
  };

  const handleStockClick = (holding) => {
    const stock = {
      symbol: holding.ticker,
      name: holding.ticker, // You might want to fetch the full name
      price: parseFloat(holding.current_price),
      change: 0, // Calculate if needed
      changePercent: 0 // Calculate if needed
    };
    onStockClick(stock);
  };

  return (
    <div className="holdings-container">
      <div className="portfolio-summary">
        <div className="summary-item">
          <span className="summary-label">Total Value:</span>
          <span className="summary-value">{formatCurrency(portfolioData.total_stock_value)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Return:</span>
          <span className={`summary-value ${portfolioData.total_return >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(portfolioData.total_return)}
          </span>
        </div>
      </div>

      <div className="holdings-list">
        {portfolioData.portfolio.map((holding, index) => (
          <div
            key={`${holding.ticker}-${index}`}
            className="holding-item"
            onClick={() => handleStockClick(holding)}
          >
            <div className="holding-header">
              <div className="holding-symbol">{holding.ticker}</div>
              <div className="holding-current-price">
                {formatCurrency(holding.current_price)}
              </div>
            </div>
            
            <div className="holding-details">
              <div className="holding-quantity">
                Quantity: {holding.quantity}
              </div>
              <div className="holding-avg-price">
                Avg Cost: {formatCurrency(holding.avg_buy_price)}
              </div>
            </div>

            <div className="holding-performance">
              <div className={`holding-return ${holding.stock_return >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(holding.stock_return)}
              </div>
              <div className={`holding-return-rate ${holding.stock_return_rate >= 0 ? 'positive' : 'negative'}`}>
                ({formatPercent(holding.stock_return_rate)})
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cash-balance">
        <div className="cash-item">
          <span className="cash-label">Cash Balance:</span>
          <span className="cash-value">
            {formatCurrency(500000 - portfolioData.total_stock_value)} {/* Assuming initial cash */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
