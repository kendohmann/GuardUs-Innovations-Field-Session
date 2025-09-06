import { useMemo, useState } from 'react';
import type { Device } from '../types';

interface Props {
  devices: Device[];
}

export default function Devices({ devices }: Props) {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | NonNullable<Device['type']>>('all');
  const [status, setStatus] = useState<'all' | Device['status']>('all');

  const rows = useMemo(
    () =>
      devices.filter((d) => {
        if (type !== 'all' && (d.type || 'collar') !== type) return false;
        if (status !== 'all' && d.status !== status) return false;
        const text = q.toLowerCase();
        if (text && !(d.alias + ' ' + d.deviceId).toLowerCase().includes(text))
          return false;
        return true;
      }),
    [devices, q, type, status],
  );

  return (
    <div className="card">
      <div className="hdr">
        <h3 style={{ margin: 0 }}>Devices</h3>
        <div className="grid" style={{ gridAutoFlow: 'column' }}>
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="all">All types</option>
            <option value="collar">Collar</option>
            <option value="relay">Relay</option>
            <option value="gateway">Gateway</option>
            <option value="tower">Tower</option>
            <option value="fixed_node">Fixed</option>
            <option value="aerial_node">Aerial</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="all">All statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            className="input"
            placeholder="Search alias or ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div style={{ overflow: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Alias</th>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Battery</th>
              <th>Ranch</th>
              <th>Last GPS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.deviceId}>
                <td>{d.alias}</td>
                <td>{d.deviceId}</td>
                <td>{d.type || 'collar'}</td>
                <td>{d.status}</td>
                <td>{(d.batteryV ?? 0).toFixed(2)} V</td>
                <td>{d.ranch || '-'}</td>
                <td>
                  {d.lat.toFixed(4)}, {d.lon.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="help">
        Tip: Add new hardware in Maintenance, then it appears here.
      </div>
    </div>
  );
}
