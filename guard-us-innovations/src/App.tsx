import { useEffect, useMemo, useState } from 'react';
import TopBar from './components/TopBar';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import AlertsPage from './pages/Alerts';
import DataLab from './pages/DataLab';
import Audit from './pages/Audit';
import Maintenance from './pages/Maintenance';
import './styles.css';
import { dummyAlerts, dummyCameras, dummyDevices } from './data';
import type { Alert, Camera, Device } from './types';

const routes = [
  'dashboard',
  'devices',
  'alerts',
  'datalab',
  'audit',
  'maint',
] as const;

type Route = (typeof routes)[number];

export default function App() {
  const [devices, setDevices] = useState<Device[]>(dummyDevices);
  const [cameras, setCameras] = useState<Camera[]>(dummyCameras);
  const [alerts, setAlerts] = useState<Alert[]>(dummyAlerts);

  const [current, setCurrent] = useState<Route>(() =>
    //TODO:: conditional on login (not logged in -> login page, else dashboard)
    'dashboard'
  );

  useEffect(() => {
    const onHash = () => {
      if (location.hash === '#demo') setCurrent('devices');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const onAck = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acked: true } : a)),
    );

  const main = useMemo(() => {
    switch (current) {
      case 'devices':
        return <Devices devices={devices} />;
      case 'alerts':
        return (
          <AlertsPage
            devices={devices}
            cameras={cameras}
            alerts={alerts}
            onAck={onAck}
          />
        );
      case 'datalab':
        return <DataLab devices={devices} alerts={alerts} cameras={[]} onAck={function (id: string): void {
          throw new Error('Function not implemented.');
        } } />;
      case 'audit':
        return <Audit />;
      case 'maint':
        return (
          <Maintenance
            devices={devices}
            cameras={cameras}
            setDevices={(updater) => setDevices((prev) => updater(prev))}
            setCameras={(updater) => setCameras((prev) => updater(prev))}
          />
        );
      default:
        return (
          <Dashboard
            devices={devices}
            cameras={cameras}
            alerts={alerts}
            onAck={onAck}
            openAlerts={() => setCurrent('alerts')}
          />
        );
    }
  }, [current, devices, cameras, alerts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar />
      <div className="shell">
        <Nav current={current} setCurrent={setCurrent} />
        <main className="main">{main}</main>
      </div>
    </div>
  );
}
