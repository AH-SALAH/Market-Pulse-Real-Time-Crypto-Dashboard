'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTranslations } from 'next-intl';
import styles from './PriceChart.module.scss';

interface PriceChartProps {
  /** [timestampMs, price][] series, oldest → newest (from CoinGecko market_chart) */
  prices: [number, number][];
  /** Chart range in days — drives the axis tick format (intraday vs dates) */
  days: number;
}

const WIDTH = 640;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

/**
 * D3 line + area chart of a coin's price history. Chosen over a generic chart
 * library to demonstrate hands-on d3 (scale/axis/shape/selection) — the same
 * SVG-building approach as Sparkline, but with axes, grid and hover crosshair.
 */
export function PriceChart({ prices, days }: PriceChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const t = useTranslations('PriceChart');

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode || prices.length < 2) return;

    const svg = d3.select(svgNode);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
      .attr('width', '100%')
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const x = d3
      .scaleUtc()
      .domain([new Date(prices[0][0]), new Date(prices[prices.length - 1][0])])
      .range([0, INNER_W]);

    const yMin = d3.min(prices, (d) => d[1]) ?? 0;
    const yMax = d3.max(prices, (d) => d[1]) ?? 1;
    const pad = (yMax - yMin) * 0.08 || 1;
    const y = d3.scaleLinear().domain([yMin - pad, yMax + pad]).range([INNER_H, 0]);

    const trend = prices[prices.length - 1][1] - prices[0][1];
    const lineClass = trend >= 0 ? styles.lineUp : styles.lineDown;
    const areaClass = trend >= 0 ? styles.areaUp : styles.areaDown;

    // Horizontal grid lines (y-axis ticks with full-width tick marks, labels off)
    g.append('g')
      .attr('class', styles.grid)
      .call(d3.axisLeft(y).ticks(5).tickSize(-INNER_W).tickFormat(() => ''))
      .select('.domain')
      .remove();

    // X axis — time format flips between intraday and calendar dates by range
    g.append('g')
      .attr('transform', `translate(0,${INNER_H})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickFormat(d3.timeFormat(days <= 1 ? '%H:%M' : '%b %d') as never),
      )
      .selectAll('text')
      .attr('fill', 'currentColor');

    // Y axis — compact currency tick labels
    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat((v) => d3.format('$.3s')(Number(v)) as never),
      )
      .selectAll('text')
      .attr('fill', 'currentColor');

    const lineGen = d3
      .line<[number, number]>()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    const areaGen = d3
      .area<[number, number]>()
      .x((d) => x(d[0]))
      .y0(() => y(yMin - pad))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(prices).attr('d', areaGen).attr('class', areaClass);
    g.append('path').datum(prices).attr('d', lineGen).attr('class', lineClass);

    // Hover crosshair: vertical guide + price/time label at the nearest point
    const focus = g.append('g').attr('class', styles.focus).style('display', 'none');
    focus.append('line').attr('class', styles.focusLine).attr('y1', 0).attr('y2', INNER_H);
    focus.append('circle').attr('r', 4.5).attr('class', styles.focusDot);
    const focusText = focus
      .append('g')
      .attr('class', styles.focusLabel)
      .append('text')
      .attr('text-anchor', 'middle');

    const bisect = d3.bisector<[number, number], number>((d) => d[0]).left;

    function onMove(event: MouseEvent) {
      const [mx] = d3.pointer(event, g.node() as SVGGElement);
      if (mx < 0 || mx > INNER_W) return;

      const x0 = x.invert(mx);
      const i = bisect(prices, x0.getTime(), 1);
      const prev = prices[i - 1];
      const next = prices[i];
      const point =
        prev && next && x0.getTime() - prev[0] > next[0] - x0.getTime() ? next : prev;
      if (!point) return;

      const cx = x(point[0]);
      const cy = y(point[1]);
      focus.style('display', null);
      focus.select('line').attr('x1', cx).attr('x2', cx);
      focus.select('circle').attr('cx', cx).attr('cy', cy);

      const priceFormat = d3.format(days <= 1 ? '$.2f' : '$.3s');
      const timeFormat = d3.timeFormat(days <= 1 ? '%H:%M' : '%b %d');
      const tx = Math.max(44, Math.min(INNER_W - 44, cx));
      focusText
        .attr('transform', `translate(${tx},${cy - 14})`)
        .text(`${priceFormat(point[1])} · ${timeFormat(new Date(point[0]))}`);
    }

    g.append('rect')
      .attr('width', INNER_W)
      .attr('height', INNER_H)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => focus.style('display', null))
      .on('mousemove', onMove)
      .on('mouseleave', () => focus.style('display', 'none'));

    return () => {
      svg.selectAll('*').remove();
    };
  }, [prices, days]);

  return (
    <div className={styles.container}>
      <svg
        ref={svgRef}
        className={styles.chart}
        role="img"
        aria-label={t('dayChart', { days })}
      />
    </div>
  );
}
