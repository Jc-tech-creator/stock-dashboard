import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import axios from 'axios';
import './StockModal.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

// Custom Candlestick component for K-line chart
const CandlestickChart = ({ data, width, height }) => {
  const Candlestick = (props) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const { open, high, low, close } = payload;
    const isGreen = close >= open;
    const color = isGreen ? '#00C851' : '#FF4444';
    const bodyHeight = Math.abs(close - open);
    const bodyY = Math.min(open, close);
    
    // Scale factors for positioning
    const priceRange = Math.max(...data.map(d => d.high)) - Math.min(...data.map(d => d.low));
    const chartHeight = height || 300;
    const scale = chartHeight / priceRange;
    const minPrice = Math.min(...data.map(d => d.low));
    
    const getY = (price) => chartHeight - ((price - minPrice) * scale);
    
    return (
      <g>
        {/* High-Low line (wick) */}
        <line
          x1={x + width / 2}
          y1={getY(high)}
          x2={x + width / 2}
          y2={getY(low)}
          stroke={color}
          strokeWidth={1}
        />
        {/* Open-Close body */}
        <rect
          x={x + width * 0.2}
          y={getY(Math.max(open, close))}
          width={width * 0.6}
          height={Math.max(bodyHeight * scale, 1)}
          fill={isGreen ? color : color}
          fillOpacity={isGreen ? 0.8 : 1}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis 
          domain={['dataMin - 5', 'dataMax + 5']}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="candlestick-tooltip">
                  <p className="tooltip-label">{label}</p>
                  <p style={{ color: '#666' }}>Open: <span style={{ fontWeight: 'bold' }}>${data.open?.toFixed(2)}</span></p>
                  <p style={{ color: '#666' }}>High: <span style={{ fontWeight: 'bold', color: '#00C851' }}>${data.high?.toFixed(2)}</span></p>
                  <p style={{ color: '#666' }}>Low: <span style={{ fontWeight: 'bold', color: '#FF4444' }}>${data.low?.toFixed(2)}</span></p>
                  <p style={{ color: '#666' }}>Close: <span style={{ fontWeight: 'bold' }}>${data.close?.toFixed(2)}</span></p>
                  <p style={{ color: '#666' }}>Volume: <span style={{ fontWeight: 'bold' }}>{data.volume?.toLocaleString()}</span></p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="high" 
          shape={Candlestick}
          fill="transparent"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const StockModal = ({ isOpen, onClose, stock, onTransactionComplete }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [fullHistoricalData, setFullHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentHolding, setCurrentHolding] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [maxBuyQuantity, setMaxBuyQuantity] = useState(0);
  const [chartType, setChartType] = useState('candlestick'); // 'candlestick' or 'line'

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    if (isOpen && stock) {
      fetchHistoricalData();
      fetchPortfolioInfo();
    }
  }, [isOpen, stock]);

  const fetchHistoricalData = async () => {
    if (!stock) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/history/${stock.symbol}`);
      const allData = response.data.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        price: item.close, // Keep for backward compatibility
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume),
        originalDate: new Date(item.date) // Keep original date for sorting
      }));
      
      // Sort by date and get only the most recent 30 days for candlestick
      const sortedData = allData.sort((a, b) => b.originalDate - a.originalDate);
      const recent30Days = sortedData.slice(0, 30).reverse(); // Reverse to show chronological order
      
      // Store both full data and 30-day data
      setFullHistoricalData(sortedData.reverse()); // Full data in chronological order
      setHistoricalData(recent30Days); // 30-day data for candlestick
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioInfo = async () => {
    if (!stock) return;
    
    try {
      // Fetch current holdings for this stock
      const portfolioResponse = await axios.get(`${API_BASE}/api/portfolio`);
      const holdings = portfolioResponse.data.portfolio || [];
      const currentStock = holdings.find(h => h.ticker === stock.symbol);
      setCurrentHolding(currentStock ? currentStock.quantity : 0);

      // Fetch cash balance
      const cashResponse = await axios.get(`${API_BASE}/api/cash`);
      const cash = cashResponse.data.cash_balance || 0;
      setCashBalance(cash);

      // Calculate max buy quantity based on cash and stock price
      const maxBuy = Math.floor(cash / stock.price);
      setMaxBuyQuantity(maxBuy);
    } catch (error) {
      console.error('Error fetching portfolio info:', error);
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
          <div className="chart-header">
            <h3>Price History</h3>
            <div className="chart-toggle">
              <button
                className={`toggle-btn ${chartType === 'candlestick' ? 'active' : ''}`}
                onClick={() => setChartType('candlestick')}
              >
                K-Line (30 Days)
              </button>
              <button
                className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                Line Chart (Full Range)
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Loading chart...</div>
          ) : (
            <>
              {chartType === 'candlestick' ? (
                <CandlestickChart 
                  data={historicalData}
                  width="100%" 
                  height={300}
                />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fullHistoricalData}>
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
            </>
          )}
        </div>

        <div className="transaction-section">
          <h3>Transaction</h3>
          
          {/* Current Holdings Info */}
          <div className="current-holdings-info">
            <p>Current Holdings: <strong>{currentHolding} shares</strong></p>
            <p>Cash Balance: <strong>{formatCurrency(cashBalance)}</strong></p>
          </div>

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

            {/* Max Quantity Info */}
            <div className="max-quantity-info">
              {transactionType === 'buy' ? (
                <p>Max Buy: <strong>{maxBuyQuantity} shares</strong> (based on cash balance)</p>
              ) : (
                <p>Max Sell: <strong>{currentHolding} shares</strong> (current holdings)</p>
              )}
            </div>

            <div className="quantity-input">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={transactionType === 'buy' ? maxBuyQuantity : currentHolding}
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
              disabled={transactionLoading || quantity <= 0 || 
                        (transactionType === 'buy' && quantity > maxBuyQuantity) ||
                        (transactionType === 'sell' && quantity > currentHolding)}
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
