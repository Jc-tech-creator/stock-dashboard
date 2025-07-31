import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Holdings.css';

const Holdings = ({ portfolioData, onStockClick, onRefreshNeeded }) => {
  const [cashBalance, setCashBalance] = useState(null);
  
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    fetchCashBalance();
  }, []);

  // Refetch cash balance when portfolio data changes (after transactions)
  useEffect(() => {
    if (onRefreshNeeded) {
      fetchCashBalance();
    }
  }, [portfolioData, onRefreshNeeded]);

  const fetchCashBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/cash`);
      setCashBalance(response.data.cash_balance);
    } catch (error) {
      console.error('Error fetching cash balance:', error);
    }
  };
  const formatCurrency = (value) => {
    if (!value || typeof value !== 'number' || isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '±0.00%';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${parseFloat(value).toFixed(2)}%`;
  };

  const handleStockClick = async (holding) => {
    try {
      // Fetch real-time quote data for change and changePercent
      const response = await axios.get(`${API_BASE}/api/quote/${holding.ticker}`);
      const quoteData = response.data;
      
      const stock = {
        symbol: holding.ticker || 'N/A',
        name: quoteData.name || holding.ticker || 'Unknown',
        price: parseFloat(holding.current_price) || quoteData.price || 0,
        change: quoteData.change || 0,
        changePercent: quoteData.changePercent || 0
      };
      onStockClick(stock);
    } catch (error) {
      console.error('Error fetching quote data:', error);
      // Fallback to original behavior if API call fails
      const stock = {
        symbol: holding.ticker || 'N/A',
        name: holding.ticker || 'Unknown',
        price: parseFloat(holding.current_price) || 0,
        change: 0,
        changePercent: 0
      };
      onStockClick(stock);
    }
  };

  // Safety check for portfolio data
  if (!portfolioData || !portfolioData.portfolio || !Array.isArray(portfolioData.portfolio)) {
    return <div className="holdings-loading">Loading holdings...</div>;
  }

  // Debug logging to check data types
  console.log('Portfolio data:', portfolioData);
  if (portfolioData.portfolio.length > 0) {
    console.log('First holding:', portfolioData.portfolio[0]);
    console.log('Current price type:', typeof portfolioData.portfolio[0].current_price);
    console.log('Stock return type:', typeof portfolioData.portfolio[0].stock_return);
  }

  return (
    <div className="holdings-container">
      <div className="portfolio-summary">
        <div className="summary-item">
          <span className="summary-label">Total Value:</span>
          <span className="summary-value">{formatCurrency(parseFloat(portfolioData.total_stock_value) || 0)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Return:</span>
          <span className={`summary-value ${(parseFloat(portfolioData.total_return) || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(parseFloat(portfolioData.total_return) || 0)}
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
                Price: {formatCurrency(parseFloat(holding.current_price) || 0)}
              </div>
            </div>
            
            <div className="holding-details">
              <div className="holding-quantity">
                Quantity: {holding.quantity}
              </div>
              <div className="holding-avg-price">
                Avg Cost: {formatCurrency(parseFloat(holding.avg_buy_price) || 0)}
              </div>
            </div>

            <div className="holding-performance">
              <div className={`holding-return ${(parseFloat(holding.stock_return) || 0) >= 0 ? 'positive' : 'negative'}`}>
                {(parseFloat(holding.stock_return) || 0) >= 0 ? 'Return' : 'Loss'}: {formatCurrency(parseFloat(holding.stock_return) || 0)}
              </div>
              <div className={`holding-return-rate ${(parseFloat(holding.stock_return_rate) || 0) >= 0 ? 'positive' : 'negative'}`}>
                ({formatPercent(parseFloat(holding.stock_return_rate) || 0)})
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cash-balance">
        <div className="cash-item">
          <span className="cash-label">Cash Balance:</span>
          <span className="cash-value">
            {cashBalance !== null ? formatCurrency(cashBalance) : 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
