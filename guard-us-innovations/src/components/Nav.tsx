interface NavProps {
  current: string;
  setCurrent: (id: string) => void;
}
const routes = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'devices', label: 'Devices' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'datalab', label: 'Data Lab' },
  { id: 'audit', label: 'Audit Log' },
  { id: 'maint', label: 'Maintenance' },
];
export default function Nav({ current, setCurrent }: NavProps) {
  return (
    <aside className="side">
      <nav className="nav">
        {routes.map((r) => (
          <button
            key={r.id}
            className={current === r.id ? 'active' : ''}
            onClick={() => setCurrent(r.id)}
          >
            {r.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
