import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Treemap.css';

const Treemap = ({ portfolioData }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!portfolioData?.portfolio) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    const data = {
      name: 'portfolio',
      children: portfolioData.portfolio.map(stock => ({
        name: stock.ticker,
        value: Math.abs(+stock.stock_return),
        return: +stock.stock_return,
        returnRate: +stock.stock_return_rate
      }))
    };

    const treemap = d3
      .treemap()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .padding(2);

    const root = d3.hierarchy(data).sum(d => d.value);
    treemap(root);

    const totalValue = root.value;

    // 颜色
    const maxAbs = d3.max(portfolioData.portfolio, d => Math.abs(+d.stock_return));
    const colorScaleLoss = d3.scaleLinear().domain([0, maxAbs]).range(['#f09393', '#c53030']);
    const colorScaleGain = d3.scaleLinear().domain([0, maxAbs]).range(['#68d391', '#2f855a']);

    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const leaves = container
      .selectAll('.leaf')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'leaf')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    leaves
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d =>
        (d.data.return >= 0 ? colorScaleGain : colorScaleLoss)(Math.abs(d.data.return))
      )
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    // 文本绘制
    leaves.each(function (d) {
      const g = d3.select(this);
      const w = d.x1 - d.x0 - 4;
      const lineHeight = 11;
      const centerY = (d.y1 - d.y0) / 2;

      // 确定要显示的内容
      const lines =
        d.value / totalValue < 0.2
          ? ['…']
          : [
              d.data.name,
              `${d.data.return >= 0 ? '+' : '-'}$${Math.abs(d.data.return).toLocaleString(undefined, {
                maximumFractionDigits: 0
              })}`,
              `${d.data.returnRate >= 0 ? '+' : ''}${d.data.returnRate.toFixed(1)}%`
            ];

      lines.forEach((line, i) => {
        let txt = line;
        const t = g
          .append('text')
          .attr('x', (d.x1 - d.x0) / 2)
          .attr('y', centerY + (i - (lines.length - 1) / 2) * lineHeight)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '10px')
          .style('fill', '#fff')
          .text(txt);

        while (t.node().getComputedTextLength() > w && txt.length > 1) {
          txt = txt.slice(0, -1) + '…';
          t.text(txt);
        }
      });
    });

    // tooltip
    leaves.append('title').text(d => {
      const fmt = v =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(v);
      return `${d.data.name}\nReturn: ${fmt(d.data.return)}\nReturn Rate: ${d.data.returnRate.toFixed(2)}%`;
    });
  }, [portfolioData]);

  return (
    <div className="treemap-container">
      <h4>Portfolio Treemap</h4>
      <p className="treemap-description">
        矩形大小表示收益绝对值，颜色表示盈亏及金额大小
      </p>
      <svg ref={svgRef} />
      <div className="treemap-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#c53030' }} />
          <span>Losses</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2f855a' }} />
          <span>Gains</span>
        </div>
      </div>
    </div>
  );
};

export default Treemap;