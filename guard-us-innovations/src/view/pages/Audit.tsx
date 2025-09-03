import { formatTime } from '..\\utils\\misc.ts';

export default function Audit() {
  const rows = [
    {
      ts: new Date().toISOString(),
      user: 'admin@guardus',
      action: 'set_thresholds',
      resource: 'abc123',
      before: '0.85',
      after: '0.90',
      status: 'OK',
    },
    {
      ts: new Date().toISOString(),
      user: 'viewer@guardus',
      action: 'login',
      resource: '-',
      before: '-',
      after: '-',
      status: 'OK',
    },
  ];
  return (
    <div className="card">
      <div className="hdr">
        <h3 style={{ margin: 0 }}>Audit Log</h3>
      </div>
      <div style={{ overflow: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Before → After</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{formatTime(r.ts)}</td>
                <td>{r.user}</td>
                <td>{r.action}</td>
                <td>{r.resource}</td>
                <td>
                  {r.before} → {r.after}
                </td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
