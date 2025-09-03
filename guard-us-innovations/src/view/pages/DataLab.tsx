import { useMemo, useState } from 'react';
import type { Alert, Camera, Device, Severity } from '../../model/types.ts';
import { formatTime, haversine } from '../utils/misc';
import AlertsList from '../components/AlertsList';
import Map from '../components/Map';

interface Props {
  devices: Device[];
  cameras: Camera[];
  alerts: Alert[];
  onAck: (id: string) => void;
}

export default function AlertsPage({ devices, cameras, alerts, onAck }: Props) {
  const [severity, setSeverity] = useState<'all' | Severity>('all');
  const [onlyUn, setOnlyUn] = useState(false);
  const [open, setOpen] = useState<Alert | null>(null);

  const centerDev = useMemo(() => devices[0], [devices]);
  const devForOpen = useMemo(
    () => devices.find((d) => d.deviceId === open?.deviceId) || centerDev,
    [devices, open, centerDev],
  );

  return (
    <div className="row">
      <div className="card">
        <div className="hdr">
          <h3 style={{ margin: 0 }}>Alerts</h3>
          <div className="grid" style={{ gridAutoFlow: 'column' }}>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="INFO">INFO</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={onlyUn}
                onChange={(e) => setOnlyUn(e.target.checked)}
              />{' '}
              Only unacked
            </label>
          </div>
        </div>
        <AlertsList
          alerts={alerts}
          filterSeverity={severity}
          onlyUnacked={onlyUn}
          onOpen={setOpen}
          onAck={onAck}
        />
      </div>

      <div className="card" style={{ minHeight: 420 }}>
        {!open && (
          <div className="help">
            Select an alert to view dispersion map, neighbor reactions and
            in-range cameras.
          </div>
        )}
        {open && (
          <div>
            <div className="hdr">
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {formatTime(open.ts)}
                </div>
                <h3 style={{ margin: 0 }}>
                  <span className={`sev ${open.severity}`}>
                    {open.severity}
                  </span>{' '}
                  {open.kind} — {open.alias} ({open.deviceId})
                </h3>
                <div className="help">conf {open.confidence.toFixed(2)}</div>
              </div>
            </div>
            {devForOpen && (
              <Map
                center={devForOpen}
                devices={devices}
                cameras={cameras}
                alerts={alerts}
              />
            )}

            {/* Neighbor reactions & cameras */}
            <div className="row2" style={{ marginTop: 10 }}>
              <div>
                <h4>Neighbor Reactions (≤200 m)</h4>
                <div className="help">
                  {(() => {
                    if (!devForOpen) return 'No nearby devices.';
                    const NEI = 200,
                      WIN = 5 * 60 * 1000,
                      t0 = new Date(open!.ts).getTime();
                    const ns = devices
                      .filter(
                        (d) =>
                          d.deviceId !== devForOpen.deviceId &&
                          (d.type || 'collar') === 'collar',
                      )
                      .map((d) => ({
                        d,
                        dist: haversine(
                          devForOpen.lat,
                          devForOpen.lon,
                          d.lat,
                          d.lon,
                        ),
                      }))
                      .filter((x) => x.dist <= NEI)
                      .map((x) => ({
                        ...x,
                        reactive: alerts.some(
                          (z) =>
                            z.deviceId === x.d.deviceId &&
                            Math.abs(new Date(z.ts).getTime() - t0) <= WIN,
                        ),
                      }))
                      .sort((a, b) => a.dist - b.dist);
                    return ns.length === 0
                      ? 'No nearby devices.'
                      : ns
                          .map(
                            (n) =>
                              `${n.d.alias} (${n.d.deviceId}) — ${n.dist.toFixed(1)} m • ${n.reactive ? 'Reactive' : 'No recent alert'}`,
                          )
                          .join('\n');
                  })()}
                </div>
              </div>
              <div>
                <h4>In-Range Cameras</h4>
                <div className="help">
                  {(() => {
                    if (!devForOpen) return 'No cameras within coverage.';
                    const cs = cameras
                      .map((c) => ({
                        ...c,
                        dist: haversine(
                          devForOpen.lat,
                          devForOpen.lon,
                          c.lat,
                          c.lon,
                        ),
                      }))
                      .filter((c) => c.dist <= c.radiusM)
                      .sort((a, b) => a.dist - b.dist);
                    return cs.length === 0
                      ? 'No cameras within coverage.'
                      : cs
                          .map(
                            (c) =>
                              `${c.name} — ${c.dist.toFixed(1)} m • coverage ${c.radiusM} m`,
                          )
                          .join('\n');
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
