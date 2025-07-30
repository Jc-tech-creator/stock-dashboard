import React, { useState } from 'react';
import Holdings from './Holdings';
import Treemap from './Treemap';
import './Portfolio.css';

const Portfolio = ({ portfolioData, onStockClick }) => {
  const [activeTab, setActiveTab] = useState('holdings');

  if (!portfolioData) {
    return <div className="portfolio-loading">Loading portfolio...</div>;
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-tabs">
        <button
          className={`tab-button ${activeTab === 'holdings' ? 'active' : ''}`}
          onClick={() => setActiveTab('holdings')}
        >
          Holdings
        </button>
        <button
          className={`tab-button ${activeTab === 'treemap' ? 'active' : ''}`}
          onClick={() => setActiveTab('treemap')}
        >
          Treemap
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'holdings' ? (
          <Holdings 
            portfolioData={portfolioData} 
            onStockClick={onStockClick}
          />
        ) : (
          <Treemap portfolioData={portfolioData} />
        )}
      </div>
    </div>
  );
};

export default Portfolio;
