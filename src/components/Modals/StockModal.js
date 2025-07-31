import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './StockModal.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

const StockModal = ({ isOpen, onClose, stock, onTransactionComplete }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    if (isOpen && stock) {
      fetchHistoricalData();
    }
  }, [isOpen, stock]);

  const fetchHistoricalData = async () => {
    if (!stock) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/history/${stock.symbol}`);
      const formattedData = response.data.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        price: item.close,
        open: item.open,
        high: item.high,
        low: item.low,
        volume: item.volume
      }));
      setHistoricalData(formattedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!stock || quantity <= 0) return;

    setTransactionLoading(true);
    try {
      const endpoint = transactionType === 'buy' ? '/api/portfolio/buy' : '/api/portfolio/sell';
      await axios.post(`${API_BASE}${endpoint}`, {
        ticker: stock.symbol,
        quantity: parseInt(quantity),
        price: stock.price
      });
      
      // Show success toast and delay modal close
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      onTransactionComplete();
      
      // Keep modal open briefly so toast can be seen
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setTransactionLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatPercent = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (!stock) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="stock-modal"
        overlayClassName="stock-modal-overlay"
      >
      <div className="modal-header">
        <div className="stock-info">
          <h2>{stock.symbol}</h2>
          <p className="stock-name">{stock.name}</p>
          <div className="price-info">
            <span className="current-price">{formatCurrency(stock.price)}</span>
            {stock.change !== undefined && (
              <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                {formatChange(stock.change)} ({formatPercent(stock.changePercent)})
              </span>
            )}
          </div>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="modal-content">
        <div className="chart-section">
          <h3>Price History</h3>
          {loading ? (
            <div className="loading">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name === 'price' ? 'Close Price' : name]}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#007bff" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="transaction-section">
          <h3>Transaction</h3>
          <div className="transaction-controls">
            <div className="transaction-type">
              <label>
                <input
                  type="radio"
                  value="buy"
                  checked={transactionType === 'buy'}
                  onChange={(e) => setTransactionType(e.target.value)}
                />
                Buy
              </label>
              <label>
                <input
                  type="radio"
                  value="sell"
                  checked={transactionType === 'sell'}
                  onChange={(e) => setTransactionType(e.target.value)}
                />
                Sell
              </label>
            </div>

            <div className="quantity-input">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="transaction-summary">
              <p>Total: {formatCurrency(stock.price * quantity)}</p>
            </div>

            <button
              className={`transaction-button ${transactionType}`}
              onClick={handleTransaction}
              disabled={transactionLoading || quantity <= 0}
            >
              {transactionLoading ? 'Processing...' : `${transactionType.toUpperCase()} ${quantity} shares`}
            </button>
          </div>
        </div>

        {historicalData.length > 0 && (
          <div className="stock-details">
            <h3>Latest Data</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Open:</span>
                <span className="value">{formatCurrency(historicalData[historicalData.length - 1]?.open || 0)}</span>
              </div>
              <div className="detail-item">
                <span className="label">High:</span>
                <span className="value">{formatCurrency(historicalData[historicalData.length - 1]?.high || 0)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Low:</span>
                <span className="value">{formatCurrency(historicalData[historicalData.length - 1]?.low || 0)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Volume:</span>
                <span className="value">{historicalData[historicalData.length - 1]?.volume?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>

    {/* Simple Toast Notification */}
    {showToast && (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#28a745',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 999999,
        fontSize: '16px',
        fontWeight: '500',
        pointerEvents: 'none',
        textAlign: 'center'
      }}>
        Transaction succeed!
      </div>
    )}
    </>
  );
};

export default StockModal;
