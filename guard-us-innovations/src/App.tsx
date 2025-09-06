import { useEffect, useMemo, useState } from 'react';
import TopBar from './view/components/TopBar';
import Nav from './view/components/Nav';
import Dashboard from './view/pages/Dashboard';
import Devices from './view/pages/Devices';
import AlertsPage from './view/pages/Alerts';
import DataLab from './view/pages/DataLab';
import Audit from './view/pages/Audit';
import Maintenance from './view/pages/Maintenance';
import './view/styles.css';
import { dummyAlerts, dummyCameras, dummyDevices } from './model/data';
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
  //TODO:: replace dummy data with real data from backend
  const [devices, setDevices] = useState<Device[]>(dummyDevices);
  const [cameras, setCameras] = useState<Camera[]>(dummyCameras);
  const [alerts, setAlerts] = useState<Alert[]>(dummyAlerts);

  const [current, setCurrent] = useState<Route>(() =>
    //TODO:: conditional on login (not logged in -> login page, else dashboard)
    'dashboard'
  );

  useEffect(() => {
    const onHash = () => {
      //TODO:: add hash for help requests (maybe - team decision), and for logged in users, and not logged in users
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
