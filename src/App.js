import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  SearchBar, 
  StockList, 
  Portfolio, 
  Charts, 
  StockModal,
  ChatWidget,
  StockIndexReturn
} from './components';
import axios from 'axios';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [portfolioData, setPortfolioData] = useState(null);
  const [dailySnapshots, setDailySnapshots] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // First update portfolio prices, then fetch all data
      await axios.post(`${API_BASE}/api/portfolio/update-prices`);
      
      const [gainersRes, losersRes, trendingRes, portfolioRes, snapshotsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/top/gainer`),
        axios.get(`${API_BASE}/api/top/loser`),
        axios.get(`${API_BASE}/api/top/trending`),
        axios.get(`${API_BASE}/api/portfolio`),
        axios.get(`${API_BASE}/api/daily_snapshot`)
      ]);

      setTopGainers(gainersRes.data);
      setTopLosers(losersRes.data);
      setTrendingStocks(trendingRes.data);
      setPortfolioData(portfolioRes.data);
      setDailySnapshots(snapshotsRes.data.snapshots);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleSearch = async (query) => {
    try {
      if (query.trim()) {
        const response = await axios.get(`${API_BASE}/api/search?q=${query}`);
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  const refreshPortfolio = () => {
    fetchInitialData();
  };

  return (
    <div className="App">
      {/* 🎯 Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-brand">
            <div className="logo-icon">$</div>
            <div>
              <h1>WealthMaker</h1>
              <p className="header-subtitle">Your Complete Stock Trading Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* 🧱 Main Content */}
      <div className="main-content">
        <div className="dashboard-container">
          <div className="left-panel">
            <SearchBar onSearch={handleSearch} />
            
            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Search Results</h3>
                <StockList stocks={searchResults} onStockClick={handleStockClick} />
              </div>
            )}
            
            <div className="section">
              <h3>Top Gainers</h3>
              <StockList stocks={topGainers} onStockClick={handleStockClick} />
            </div>

            <div className="section">
              <h3>Top Losers</h3>
              <StockList stocks={topLosers} onStockClick={handleStockClick} />
            </div>
            
            <div className="section">
              <h3>Trending Stocks</h3>
              <StockList stocks={trendingStocks} onStockClick={handleStockClick} />
            </div>
          </div>

          <div className="right-panel">
            <StockIndexReturn />
            <Charts data={dailySnapshots} />
            <Portfolio
              portfolioData={portfolioData}
              onStockClick={handleStockClick}
              onRefreshNeeded={refreshPortfolio}
            />
          </div>
        </div>
      </div>

      <StockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        stock={selectedStock}
        onTransactionComplete={refreshPortfolio}
      />
      {/* NEW：右下角对话组件 */}
      <ChatWidget />
    </div>
  );
}

export default App;