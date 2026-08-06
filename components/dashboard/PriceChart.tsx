'use client';

import { useEffect, useRef } from 'react';
import { select, pointer } from 'd3-selection';
import { scaleUtc, scaleLinear } from 'd3-scale';
import { min, max, bisector } from 'd3-array';
import { axisLeft, axisBottom, axisRight } from 'd3-axis';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { line, area, curveMonotoneX } from 'd3-shape';
import { useLocale, useTranslations } from 'next-intl';
import styles from './PriceChart.module.scss';

interface PriceChartProps {
  /** [timestampMs, price][] series, oldest → newest (from CoinGecko market_chart) */
  prices: [number, number][];
  /** Chart range in days — drives the axis tick format (intraday vs dates) */
  days: number;
}

const WIDTH = 640;
const HEIGHT = 320;
// Price axis (with room for tick labels) sits on the left edge in LTR and on the
// right edge in RTL so the mirrored time axis still leaves the labels outside the plot.
const LTR_MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };
const RTL_MARGIN = { top: 16, right: 56, bottom: 32, left: 16 };

/**
 * D3 line + area chart of a coin's price history. Chosen over a generic chart
 * library to demonstrate hands-on d3 (scale/axis/shape/selection) — the same
 * SVG-building approach as Sparkline, but with axes, grid and hover crosshair.
 */
export function PriceChart({ prices, days }: PriceChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const t = useTranslations('PriceChart');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode || prices.length < 2) return;

    const svg = select(svgNode);
    svg.selectAll('*').remove();

    const margin = isRtl ? RTL_MARGIN : LTR_MARGIN;
    const innerW = WIDTH - margin.left - margin.right;
    const innerH = HEIGHT - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
      .attr('width', '100%')
      .append('g')
      .attr(
        'transform',
        // Origin sits at the left margin in LTR, the right margin in RTL — the
        // mirrored x-range below then draws time flowing right→left.
        `translate(${isRtl ? WIDTH - margin.right : margin.left},${margin.top})`,
      );

    const x = scaleUtc()
      .domain([new Date(prices[0][0]), new Date(prices[prices.length - 1][0])])
      // RTL mirrors time: origin sits on the right edge of the plot, so the scale
      // must run negative (leftward) from the origin instead of positive.
      .range(isRtl ? [0, -innerW] : [0, innerW]);

    const yMin = min(prices, (d) => d[1]) ?? 0;
    const yMax = max(prices, (d) => d[1]) ?? 1;
    const pad = (yMax - yMin) * 0.08 || 1;
    const y = scaleLinear().domain([yMin - pad, yMax + pad]).range([innerH, 0]);

    const trend = prices[prices.length - 1][1] - prices[0][1];
    const lineClass = trend >= 0 ? styles.lineUp : styles.lineDown;
    const areaClass = trend >= 0 ? styles.areaUp : styles.areaDown;

    // Horizontal grid lines (y-axis ticks with full-width tick marks, labels off).
    // Drawn from the origin toward negative x, which crosses the plot either way.
    g.append('g')
      .attr('class', styles.grid)
      .call(axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ''))
      .select('.domain')
      .remove();

    // X axis — time format flips between intraday and calendar dates by range
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        axisBottom(x)
          .ticks(6)
          .tickFormat(timeFormat(days <= 1 ? '%H:%M' : '%b %d') as never),
      )
      .selectAll('text')
      .attr('fill', 'currentColor');

    // Price axis — left edge in LTR, right edge in RTL (mirror), compact currency ticks
    const priceAxis = isRtl ? axisRight : axisLeft;
    g.append('g')
      .call(
        priceAxis(y)
          .ticks(6)
          .tickFormat((v) => format('$.3s')(Number(v)) as never),
      )
      .selectAll('text')
      .attr('fill', 'currentColor');

    const lineGen = line<[number, number]>()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .curve(curveMonotoneX);

    const areaGen = area<[number, number]>()
      .x((d) => x(d[0]))
      .y0(() => y(yMin - pad))
      .y1((d) => y(d[1]))
      .curve(curveMonotoneX);

    g.append('path').datum(prices).attr('d', areaGen).attr('class', areaClass);
    g.append('path').datum(prices).attr('d', lineGen).attr('class', lineClass);

    // Hover crosshair: vertical guide + price/time label at the nearest point
    const focus = g.append('g').attr('class', styles.focus).style('display', 'none');
    focus.append('line').attr('class', styles.focusLine).attr('y1', 0).attr('y2', innerH);
    focus.append('circle').attr('r', 4.5).attr('class', styles.focusDot);
    const focusText = focus
      .append('g')
      .attr('class', styles.focusLabel)
      .append('text')
      .attr('text-anchor', 'middle');

    const bisect = bisector<[number, number], number>((d) => d[0]).left;

    function onMove(event: MouseEvent) {
      const [mx] = pointer(event, g.node() as SVGGElement);
      const plotLo = isRtl ? -innerW : 0;
      const plotHi = isRtl ? 0 : innerW;
      if (mx < plotLo || mx > plotHi) return;

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

      const priceFormat = format(days <= 1 ? '$.2f' : '$.3s');
      const timeFormatFn = timeFormat(days <= 1 ? '%H:%M' : '%b %d');
      const tx = isRtl
        ? Math.max(-(innerW - 44), Math.min(-44, cx))
        : Math.max(44, Math.min(innerW - 44, cx));
      focusText
        .attr('transform', `translate(${tx},${cy - 14})`)
        .text(`${priceFormat(point[1])} · ${timeFormatFn(new Date(point[0]))}`);
    }

    g.append('rect')
      .attr('x', isRtl ? -innerW : 0)
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => focus.style('display', null))
      .on('mousemove', onMove)
      .on('mouseleave', () => focus.style('display', 'none'));

    return () => {
      svg.selectAll('*').remove();
    };
  }, [prices, days, isRtl]);

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
