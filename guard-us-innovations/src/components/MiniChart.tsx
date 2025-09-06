import { useEffect, useMemo, useRef } from 'react';
import { movavg, qtile } from '../utils/misc';

interface Props {
  minutes: number;
  deviceId: string;
  alertsNearby: (t: number) => boolean; // function that tells if an alert occurs near timestamp t (ms)
  showDelta: boolean;
  smoothW: number; // 1..5
  spikeThresh: number; // dB/min
  highlightSpikes: boolean;
}

// TODO:: random series generators - Demo placeholder mirrors logic from client
function genAccelSeries(
  m: number,
  devId: string,
  alertFn: (t: number) => boolean,
) {
  const arr: number[] = [];
  const now = Date.now();
  for (let i = m - 1; i >= 0; i--) {
    const t = now - i * 60 * 1000;
    let v =
      0.2 +
      0.05 * Math.sin((i / m) * Math.PI * 2) +
      (Math.random() - 0.5) * 0.05;
    const spike = alertFn(t);
    if (spike) v += 0.6 + Math.random() * 0.3;
    v = Math.max(0, Math.min(1.2, v));
    arr.push(v);
  }
  return arr;
}
function genRssiSeries(
  m: number,
  devId: string,
  alertFn: (t: number) => boolean,
  base = -75,
) {
  const arr: number[] = [];
  const now = Date.now();
  for (let i = m - 1; i >= 0; i--) {
    const t = now - i * 60 * 1000;
    let r = base + (Math.random() - 0.5) * 4;
    const spike = alertFn(t);
    if (spike) {
      const sign = Math.random() > 0.5 ? -1 : +1;
      r += sign * (3 + Math.random() * 4);
    }
    arr.push(r);
  }
  return movavg(arr, 2);
}

export default function MiniChart({
  minutes,
  deviceId,
  alertsNearby,
  showDelta,
  smoothW,
  spikeThresh,
  highlightSpikes,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const acc = useMemo(
    () => genAccelSeries(minutes, deviceId, alertsNearby),
    [minutes, deviceId, alertsNearby],
  );
  const rssi = useMemo(
    () => genRssiSeries(minutes, deviceId, alertsNearby),
    [minutes, deviceId, alertsNearby],
  );
  const thr = useMemo(() => qtile(acc, 0.3), [acc]);

  useEffect(() => {
    const chart = chartRef.current!,
      bars = barsRef.current!,
      svg = svgRef.current!;
    bars.innerHTML = '';
    svg.innerHTML = '';
    const rect = chart.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 160;
    const inner = { left: 6, right: 6, top: 6, bottom: 18 };
    const iw = width - inner.left - inner.right;
    const ih = height - inner.top - inner.bottom;
    const accMax = Math.max(1, ...acc);

    // bars
    acc.forEach((v) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = Math.max(1, Math.round((v / accMax) * ih)) + 'px';
      bars.appendChild(bar);
    });

    // threshold line
    const th = document.createElement('div');
    th.className = 'thline';
    th.style.bottom = inner.bottom + (thr / accMax) * ih + 'px';
    chart.appendChild(th);

    if (showDelta) {
      const rs = movavg(rssi, Math.max(1, Math.min(5, smoothW || 1)));
      const deltas = rs.map((v, i) => (i === 0 ? 0 : v - rs[i - 1]));
      const maxAbs = Math.max(4, ...deltas.map((x) => Math.abs(x)));
      const pts = deltas.map((d, i) => {
        const x = inner.left + (i / (minutes - 1)) * iw;
        const y = inner.top + (0.5 - d / (2 * maxAbs)) * ih;
        return [x, y];
      });
      const dAttr = pts
        .map(
          (p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ',' + p[1].toFixed(2),
        )
        .join(' ');
      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
      );
      path.setAttribute('d', dAttr);
      path.setAttribute('stroke', '#2563eb');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.appendChild(path);

      if (highlightSpikes) {
        deltas.forEach((d, i) => {
          if (Math.abs(d) >= spikeThresh) {
            const x = inner.left + (i / (minutes - 1)) * iw;
            const spike = document.createElement('div');
            spike.className = 'spike ' + (d > 0 ? 'bunch' : 'flight');
            spike.style.left = x + 'px';
            spike.style.height = ih + 'px';
            spike.title =
              (d > 0 ? 'Bunching +' : 'Flight −') +
              Math.abs(d).toFixed(1) +
              ' dB';
            chart.appendChild(spike);
          }
        });
      }
    }
  }, [
    acc,
    thr,
    rssi,
    minutes,
    showDelta,
    smoothW,
    spikeThresh,
    highlightSpikes,
  ]);

  return (
    <div className="miniChart" ref={chartRef}>
      <div className="bars" ref={barsRef}></div>
      <svg className="lineOverlay" ref={svgRef} preserveAspectRatio="none" />
    </div>
  );
}
