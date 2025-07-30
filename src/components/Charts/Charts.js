import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Charts.css';

const Charts = ({ data }) => {
  const formatChartData = (snapshots) => {
    return snapshots.map(snapshot => ({
      date: new Date(snapshot.snapshot_date).toLocaleDateString(),
      netWealth: parseFloat(snapshot.total_value),
      returnRate: parseFloat(snapshot.total_return_rate) * 100,
      totalReturn: parseFloat(snapshot.total_return)
    }));
  };

  const chartData = formatChartData(data);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="charts-container">
      <div className="chart-section">
        <h3>Net Wealth</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => [formatCurrency(value), 'Net Wealth']} />
            <Line 
              type="monotone" 
              dataKey="netWealth" 
              stroke="#007bff" 
              strokeWidth={2}
              dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h3>Return Rate</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPercent} />
            <Tooltip formatter={(value) => [formatPercent(value), 'Return Rate']} />
            <Line 
              type="monotone" 
              dataKey="returnRate" 
              stroke="#28a745" 
              strokeWidth={2}
              dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
