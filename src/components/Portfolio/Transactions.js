import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/transactions/recent`);
        // Extract transactions array from the response object
        setTransactions(response.data.transactions || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="transactions-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <div className="no-transactions">No transactions found</div>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction, index) => (
            <div key={index} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-info">
                <div className="transaction-symbol">{transaction.ticker}</div>
                <div className="transaction-details">
                  <span className={`transaction-type ${transaction.type}`}>
                    {transaction.type.toUpperCase()}
                  </span>
                  <span className="transaction-quantity">
                    {transaction.quantity} shares
                  </span>
                </div>
              </div>
              <div className="transaction-amounts">
                <div className="transaction-price">
                  {formatCurrency(parseFloat(transaction.price))}
                </div>
                <div className="transaction-total">
                  Total: {formatCurrency(transaction.quantity * parseFloat(transaction.price))}
                </div>
              </div>
              <div className="transaction-date">
                {formatDate(transaction.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
