import type { Alert } from '../../model/types';
import { formatTime } from '../utils/misc';

interface Props {
  alerts: Alert[];
  compact?: boolean;
  onOpen?: (a: Alert) => void;
  onAck?: (id: string) => void;
  filterSeverity?: string; // 'all' | Severity
  onlyUnacked?: boolean;
}

export default function AlertsList({
  alerts,
  compact = false,
  onOpen,
  onAck,
  filterSeverity = 'all',
  onlyUnacked = false,
}: Props) {
  const visible = alerts.filter(
    (a) =>
      (filterSeverity === 'all' || a.severity === filterSeverity) &&
      (!onlyUnacked || !a.acked),
  );
  return (
    <div className="list">
      {visible.map((a) => (
        <div key={a.id} className="alert" onClick={() => onOpen?.(a)}>
          <span className={`sev ${a.severity}`}>{a.severity}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>
              {a.alias} <span style={{ color: '#6b7280' }}>({a.deviceId})</span>
            </div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              {a.kind} • conf {a.confidence.toFixed(2)} • {formatTime(a.ts)}
            </div>
          </div>
          {a.acked ? (
            <span className="pill">Acked</span>
          ) : (
            <button
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                onAck?.(a.id);
              }}
            >
              Ack
            </button>
          )}
        </div>
      ))}
      {visible.length === 0 && (
        <div className="help" style={{ padding: '8px 0' }}>
          No alerts.
        </div>
      )}
    </div>
  );
}
