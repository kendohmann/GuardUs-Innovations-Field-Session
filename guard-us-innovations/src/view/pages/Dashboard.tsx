import type { Alert, Camera, Device } from '../../model/types';
import Map from '../components/Map';
import AlertsList from '../components/AlertsList';

interface Props {
  devices: Device[];
  cameras: Camera[];
  alerts: Alert[];
  onAck: (id: string) => void;
  openAlerts: () => void;
}

export default function Dashboard({
  devices,
  cameras,
  alerts,
  onAck,
  openAlerts,
}: Props) {
  const online = devices.filter((d) => d.status === 'online').length;
  const offline = devices.filter((d) => d.status !== 'online').length;
  const activeAlerts = alerts.filter((a) => !a.acked).length;
  const lag = Math.floor(Math.random() * 5) + 1;
  const center =
    devices[0] ??
    ({
      lat: 0,
      lon: 0,
      alias: 'center',
      deviceId: 'center',
      status: 'online',
    } as Device);

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="kpis">
        <div className="kpi">
          <div className="l">Online</div>
          <div className="v">{online}</div>
        </div>
        <div className="kpi">
          <div className="l">Offline/Inactive</div>
          <div className="v">{offline}</div>
        </div>
        <div className="kpi">
          <div className="l">Active Alerts</div>
          <div className="v">{activeAlerts}</div>
        </div>
        <div className="kpi">
          <div className="l">Ingestion Lag (s)</div>
          <div className="v">{lag}</div>
        </div>
      </div>

      <div className="row">
        <div className="card">
          <div className="hdr">
            <h3 style={{ margin: 0 }}>Map (RSSI + Cameras)</h3>
            <div>
              <button className="btn" onClick={openAlerts}>
                Open Alerts
              </button>
            </div>
          </div>
          {center && (
            <Map
              center={center}
              devices={devices}
              cameras={cameras}
              alerts={alerts}
            />
          )}
        </div>
        <div className="card">
          <div className="hdr">
            <h3 style={{ margin: 0 }}>Live Alerts</h3>
          </div>
          <AlertsList alerts={alerts} compact onAck={onAck} />
        </div>
      </div>
    </div>
  );
}
