import type { Alert, Severity } from '../../model/types';

export const formatTime = (iso: string) => new Date(iso).toLocaleString();
export function metersPerDeg(lat: number) {
  return { lat: 111_132, lon: 111_320 * Math.cos((lat * Math.PI) / 180) };
}
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3,
    toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function rssiColor(rssi: number) {
  if (rssi >= -65) return 'rgba(34,197,94,0.28)';
  if (rssi >= -80) return 'rgba(245,158,11,0.28)';
  return 'rgba(239,68,68,0.28)';
}
export function rssiRadius(rssi: number) {
  return rssi >= -65 ? 44 : rssi >= -80 ? 32 : 22;
}
export function statusColor(status: 'online' | 'offline' | 'inactive') {
  return status === 'online'
    ? '#16a34a'
    : status === 'inactive'
      ? '#9ca3af'
      : '#ef4444';
}
export function threatColor(sev?: Severity | null) {
  return sev === 'P0'
    ? '#ef4444'
    : sev === 'P1'
      ? '#f59e0b'
      : sev === 'P2'
        ? '#facc15'
        : null;
}
export function activeSeverityFor(deviceId: string, alerts: Alert[]) {
  const order: Record<Severity, number> = { P0: 3, P1: 2, P2: 1, INFO: 0 };
  let best: Severity | null = null;
  alerts.forEach((a) => {
    if (a.deviceId === deviceId && !a.acked) {
      if (!best || order[a.severity] > order[best]) best = a.severity;
    }
  });
  return best;
}
export function qtile(xs: number[], q: number) {
  const a = [...xs].sort((x, y) => x - y),
    i = Math.floor((a.length - 1) * q);
  return a[i];
}
export function movavg(xs: number[], w: number) {
  if (w <= 1) return xs.slice();
  const out: number[] = [];
  for (let i = 0; i < xs.length; i++) {
    let s = 0,
      c = 0;
    for (let k = -(w - 1); k <= 0; k++) {
      const j = i + k;
      if (j >= 0) {
        s += xs[j];
        c++;
      }
    }
    out.push(s / Math.max(1, c));
  }
  return out;
}
