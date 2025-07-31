import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Charts.css';

const Charts = ({ data }) => {
  const formatChartData = (snapshots) => {
    return snapshots
      .map(snapshot => ({
        date: new Date(snapshot.snapshot_date),
        netWealth: parseFloat(snapshot.total_value),
        returnRate: parseFloat(snapshot.total_return_rate) ,
        totalReturn: parseFloat(snapshot.total_return)
      }))
      .sort((a, b) => a.date - b.date)
      .map(d => ({ ...d, date: d.date.toLocaleDateString() }));
  };

  const chartData = formatChartData(data);

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const netWealthValues = chartData.map(d => d.netWealth);
  const minY = Math.min(...netWealthValues) * 0.99;
  const maxY = Math.max(...netWealthValues) * 1.05;

  return (
    <div className="charts-container">
      <div className="chart-section">
        <h3>Net Wealth</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              domain={[minY, maxY]}
              tickFormatter={formatCurrency}
              width={60}
              tickCount={6}
            />
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
          <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPercent} width={60} />
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