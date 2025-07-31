import React, { useState, useEffect } from 'react';
import './StockIndexReturn.css';

const StockIndexReturn = () => {
  const [indexData, setIndexData] = useState(null);

  useEffect(() => {
    const fetchIndexData = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';
        const response = await fetch(`${API_BASE}/api/index`);
        const data = await response.json();
        setIndexData(data); // Store the data returned from the API
      } catch (error) {
        console.error('Error fetching index data:', error);
      }
    };

    fetchIndexData();
  }, []);

  return (
    <div className="stock-index-return">
      {indexData ? (
        <div>
          <h3>Market Indices</h3>
          <ul>
            {indexData.slice(0, 3).map((index, idx) => (
              <li key={idx}>
                <strong>{index.name}:</strong> 
                <span className={index.changePercent < 0 ? 'negative' : 'positive'}>
                  {index.changePercent > 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h3>Market Indices</h3>
          <div style={{marginTop: '20px'}}>
            <p style={{margin: 0, fontSize: '12px', color: '#666'}}>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockIndexReturn;
