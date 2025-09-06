import { useMemo, useRef, useState } from 'react';
import type { Alert, Camera, Device } from '../types';
import {
  activeSeverityFor,
  haversine,
  metersPerDeg,
  rssiColor,
  rssiRadius,
  statusColor,
  threatColor,
} from '../utils/misc';

interface Props {
  center: Device;
  devices: Device[];
  cameras: Camera[];
  alerts: Alert[];
}

export default function Map({ center, devices, cameras, alerts }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showRSSI, setShowRSSI] = useState(true);
  const [showCams, setShowCams] = useState(true);
  const [openCam, setOpenCam] = useState<Camera | null>(null);
  const mpd = useMemo(() => metersPerDeg(center.lat), [center.lat]);

  function scale() {
    return ((600 / 2 - 24) / 220) * zoom;
  }
  function toPixel(lat: number, lon: number) {
    const dx = (lon - center.lon) * mpd.lon;
    const dy = (lat - center.lat) * mpd.lat;
    return {
      left: 600 / 2 + dx * scale(),
      top: (mapRef.current?.clientHeight || 420) / 2 - dy * scale(),
    };
  }

  return (
    <div className="map" ref={mapRef}>
      <div className="toolbar">
        <label>
          <input
            type="checkbox"
            checked={showRSSI}
            onChange={() => setShowRSSI((v) => !v)}
          />{' '}
          RSSI
        </label>
        <label>
          <input
            type="checkbox"
            checked={showCams}
            onChange={() => setShowCams((v) => !v)}
          />{' '}
          Cameras
        </label>
        <button
          className="btn"
          onClick={() => setZoom((z) => Math.min(2.5, z * 1.2))}
        >
          +
        </button>
        <button
          className="btn"
          onClick={() => setZoom((z) => Math.max(0.6, z / 1.2))}
        >
          −
        </button>
      </div>

      {[50, 100, 200].map((r) => {
        const d = r * 2 * scale();
        return (
          <div
            key={r}
            className="ring"
            style={{
              width: d,
              height: d,
              left: `calc(50% - ${r * scale()}px)`,
              top: `calc(50% - ${r * scale()}px)`,
            }}
          />
        );
      })}

      <div className="legend">
        <div>
          <strong>Legend</strong>
        </div>
        <div>● collar (status/alert color)</div>
        <div>■ relay</div>
        <div>▲ tower</div>
        <div>◆ camera</div>
        <div className="help" style={{ marginTop: 4 }}>
          RSSI: green ≥ −65 • amber ≥ −80 • red &lt; −80
        </div>
      </div>

      {/* Devices */}
      {devices.map((d) => {
        const p = toPixel(d.lat, d.lon);
        const type = d.type || 'collar';
        let color = statusColor(d.status);
        if (type === 'collar') {
          const sev = activeSeverityFor(d.deviceId, alerts);
          const threat = threatColor(sev);
          if (threat) color = threat;
        }
        return (
          <div key={d.deviceId}>
            {showRSSI && d.rssi != null && (
              <div
                className="aura"
                style={{
                  left: p.left - rssiRadius(d.rssi),
                  top: p.top - rssiRadius(d.rssi),
                  width: rssiRadius(d.rssi) * 2,
                  height: rssiRadius(d.rssi) * 2,
                  background: `radial-gradient(circle, ${rssiColor(d.rssi)} 0%, rgba(0,0,0,0) 70%)`,
                }}
              />
            )}
            {type === 'tower' ? (
              <div
                className="triangle"
                style={{
                  borderBottom: `12px solid ${color}`,
                  left: p.left - 6,
                  top: p.top - 12,
                }}
              />
            ) : (
              <div
                className={`pin ${type === 'relay' ? 'square' : 'circle'}`}
                style={{ background: color, left: p.left - 6, top: p.top - 6 }}
              />
            )}
            <div className="label" style={{ left: p.left + 6, top: p.top - 6 }}>
              {d.alias}
            </div>
          </div>
        );
      })}

      {/* Cameras */}
      {showCams &&
        cameras.map((c) => {
          const p = toPixel(c.lat, c.lon);
          return (
            <div key={c.id}>
              {showRSSI && c.rssi != null && (
                <div
                  className="aura"
                  style={{
                    left: p.left - rssiRadius(c.rssi),
                    top: p.top - rssiRadius(c.rssi),
                    width: rssiRadius(c.rssi) * 2,
                    height: rssiRadius(c.rssi) * 2,
                    background: `radial-gradient(circle, ${rssiColor(c.rssi)} 0%, rgba(0,0,0,0) 70%)`,
                  }}
                />
              )}
              <div
                className="diamond"
                style={{ left: p.left - 6, top: p.top - 6 }}
                title={c.name}
                onClick={() => setOpenCam(c)}
              />
              <div
                className="label"
                style={{ left: p.left + 6, top: p.top - 6 }}
              >
                {c.name} ({c.rssi ?? '—'} dBm)
              </div>
            </div>
          );
        })}

      {openCam && (
        <div className="camViewer">
          <div className="hdr">
            <strong>{openCam.name}</strong>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {openCam.feedUrl ? <span className="pill">Live</span> : null}
              <button className="btn" onClick={() => setOpenCam(null)}>
                Close
              </button>
            </div>
          </div>
          {openCam.feedUrl ? (
            /\.m3u8(\?.*)?$/.test(openCam.feedUrl) ? (
              <div
                className="placeholder"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e5e7eb',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    HLS (.m3u8) requires Safari or hls.js.
                  </div>
                  <div className="help">
                    {/* //TODO:: hls.js integration */}
                    This demo is offline.
                  </div>
                </div>
              </div>
            ) : (
              <video
                controls
                preload="none"
                muted
                playsInline
                src={openCam.feedUrl}
              ></video>
            )
          ) : (
            <div
              className="placeholder"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e5e7eb',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  No feed URL set
                </div>
                <div className="help">
                  Add one in Maintenance → Cameras (MP4 or HLS .m3u8)
                </div>
              </div>
            </div>
          )}
          <div className="help" style={{ marginTop: 6 }}>
            {openCam.note || ''}
          </div>
        </div>
      )}
    </div>
  );
}
