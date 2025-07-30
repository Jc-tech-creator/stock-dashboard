import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Treemap.css';

const Treemap = ({ portfolioData }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!portfolioData || !portfolioData.portfolio) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    // Prepare data for treemap
    const data = {
      name: "portfolio",
      children: portfolioData.portfolio.map(stock => ({
        name: stock.ticker,
        value: Math.abs(parseFloat(stock.stock_return)),
        returnRate: parseFloat(stock.stock_return_rate),
        return: parseFloat(stock.stock_return),
        currentPrice: parseFloat(stock.current_price),
        quantity: stock.quantity
      }))
    };

    // Create treemap layout
    const treemap = d3.treemap()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .padding(2);

    // Create hierarchy and calculate layout
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    treemap(root);

    // Create color scale based on return rate
    const colorScale = d3.scaleLinear()
      .domain(d3.extent(portfolioData.portfolio, d => parseFloat(d.stock_return_rate)))
      .range(["#dc3545", "#28a745"]);

    // Create SVG container
    const container = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create treemap rectangles
    const leaves = container.selectAll(".leaf")
      .data(root.leaves())
      .enter().append("g")
      .attr("class", "leaf")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaves.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.returnRate))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer");

    // Add stock symbols
    leaves.append("text")
      .attr("x", d => (d.x1 - d.x0) / 2)
      .attr("y", d => (d.y1 - d.y0) / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(d => d.data.name);

    // Add return rate
    leaves.append("text")
      .attr("x", d => (d.x1 - d.x0) / 2)
      .attr("y", d => (d.y1 - d.y0) / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "10px")
      .style("fill", "white")
      .text(d => `${d.data.returnRate >= 0 ? '+' : ''}${d.data.returnRate.toFixed(1)}%`);

    // Add tooltips
    leaves.append("title")
      .text(d => {
        const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
        
        return `${d.data.name}\nReturn: ${formatCurrency(d.data.return)}\nReturn Rate: ${d.data.returnRate.toFixed(2)}%\nShares: ${d.data.quantity}`;
      });

  }, [portfolioData]);

  return (
    <div className="treemap-container">
      <h4>Portfolio Treemap</h4>
      <p className="treemap-description">
        Size represents absolute return value, color represents return rate
      </p>
      <svg ref={svgRef}></svg>
      <div className="treemap-legend">
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#dc3545'}}></div>
          <span>Losses</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#28a745'}}></div>
          <span>Gains</span>
        </div>
      </div>
    </div>
  );
};

export default Treemap;
