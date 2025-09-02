import { useMemo, useState } from 'react';
import type { Camera, Device, DeviceType } from '../types';

interface Props {
  devices: Device[];
  cameras: Camera[];
  // Pass an updater; parent should apply it functionally: setDevices(prev => updater(prev))
  setDevices: (updater: (old: Device[]) => Device[]) => void;
  setCameras: (updater: (old: Camera[]) => Camera[]) => void;
}

export default function Maintenance({
  devices,
  cameras,
  setDevices,
  setCameras,
}: Props) {
  // Device form state
  const [mType, setMType] = useState<DeviceType>('collar');
  const [mAlias, setMAlias] = useState('');
  const [mId, setMId] = useState('');
  const [mRanch, setMRanch] = useState('North Pasture');
  const [mLat, setMLat] = useState<number>(40.5855);
  const [mLon, setMLon] = useState<number>(-105.0849);

  // Camera form state
  const [cName, setCName] = useState('New Cam');
  const [cLat, setCLat] = useState<number>(40.5857);
  const [cLon, setCLon] = useState<number>(-105.0852);
  const [cRad, setCRad] = useState<number>(150);
  const [cRSSI, setCRSSI] = useState<number>(-70);
  const [cFeed, setCFeed] = useState('');

  const devRows = useMemo(() => devices, [devices]);
  const camRows = useMemo(() => cameras, [cameras]);

  function addDevice() {
    const alias = (
      mAlias || `${mType}-${Math.random().toString(36).slice(2, 5)}`
    ).trim();
    const deviceId = (
      mId || `${mType}-${Math.random().toString(36).slice(2, 7)}`
    ).trim();
    if (!alias || !deviceId) {
      alert('Alias and Device ID are required.');
      return;
    }
    setDevices((old) => [
      {
        alias,
        deviceId,
        type: mType,
        status: 'online',
        batteryV: 3.9,
        ranch: mRanch.trim() || 'North Pasture',
        lat: mLat,
        lon: mLon,
        rssi: -75,
      },
      ...old,
    ]);
    // reset a couple of fields but keep lat/lon/ranch/type for rapid entry
    setMAlias('');
    setMId('');
  }

  function addCamera() {
    const name = cName.trim() || 'Cam';
    const id = `cam-${Math.random().toString(36).slice(2, 7)}`;
    setCameras((old) => [
      {
        id,
        name,
        lat: cLat,
        lon: cLon,
        radiusM: cRad,
        rssi: cRSSI,
        feedUrl: cFeed,
      },
      ...old,
    ]);
    setCName('New Cam');
    setCFeed('');
  }

  return (
    <div className="card">
      <div className="hdr">
        <h3 style={{ margin: 0 }}>Maintenance</h3>
      </div>
      <div className="grid">
        <div className="row2">
          <div className="grid">
            <h4 style={{ margin: 0 }}>Add Device</h4>
            <div
              className="grid"
              style={{ gridAutoFlow: 'column', alignItems: 'center' }}
            >
              <select
                value={mType}
                onChange={(e) => setMType(e.target.value as DeviceType)}
              >
                <option value="collar">collar</option>
                <option value="relay">relay</option>
                <option value="gateway">gateway</option>
                <option value="tower">tower</option>
                <option value="fixed_node">fixed</option>
                <option value="aerial_node">aerial</option>
              </select>
              <input
                className="input"
                placeholder="Alias"
                value={mAlias}
                onChange={(e) => setMAlias(e.target.value)}
              />
              <input
                className="input"
                placeholder="Device ID"
                value={mId}
                onChange={(e) => setMId(e.target.value)}
              />
              <input
                className="input"
                placeholder="Ranch"
                value={mRanch}
                onChange={(e) => setMRanch(e.target.value)}
              />
              <input
                className="input"
                placeholder="Lat"
                value={mLat}
                onChange={(e) => setMLat(Number(e.target.value) || 0)}
              />
              <input
                className="input"
                placeholder="Lon"
                value={mLon}
                onChange={(e) => setMLon(Number(e.target.value) || 0)}
              />
              <button className="btn" onClick={addDevice}>
                Add Device
              </button>
            </div>
          </div>

          <div className="grid">
            <h4 style={{ margin: 0 }}>Add Camera</h4>
            <div
              className="grid"
              style={{ gridAutoFlow: 'column', alignItems: 'center' }}
            >
              <input
                className="input"
                placeholder="Name"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Lat"
                value={cLat}
                onChange={(e) => setCLat(Number(e.target.value) || 0)}
              />
              <input
                className="input"
                placeholder="Lon"
                value={cLon}
                onChange={(e) => setCLon(Number(e.target.value) || 0)}
              />
              <input
                className="input"
                placeholder="Radius (m)"
                value={cRad}
                onChange={(e) => setCRad(parseInt(e.target.value, 10) || 150)}
              />
              <input
                className="input"
                placeholder="RSSI (dBm)"
                value={cRSSI}
                onChange={(e) => setCRSSI(parseInt(e.target.value, 10) || -70)}
              />
              <input
                className="input"
                placeholder="Feed URL (HLS .m3u8 / MP4)"
                value={cFeed}
                onChange={(e) => setCFeed(e.target.value)}
              />
              <button className="btn" onClick={addCamera}>
                Add Camera
              </button>
            </div>
            <div className="help">
              HLS (.m3u8) plays natively in Safari; other browsers need hls.js.
              For demo, you can use an MP4 URL.
            </div>
          </div>
        </div>

        <div className="row2">
          <div>
            <h4>Devices</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devRows.map((d) => (
                  <tr key={d.deviceId}>
                    <td>{d.alias}</td>
                    <td>{d.deviceId}</td>
                    <td>{d.type || 'collar'}</td>
                    <td>{d.status}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn"
                        onClick={() =>
                          setDevices((old) =>
                            old.map((x) =>
                              x.deviceId === d.deviceId
                                ? {
                                    ...x,
                                    status:
                                      x.status === 'online'
                                        ? 'offline'
                                        : 'online',
                                  }
                                : x,
                            ),
                          )
                        }
                      >
                        Toggle Online
                      </button>
                      <button
                        className="btn"
                        onClick={() =>
                          setDevices((old) =>
                            old.filter((x) => x.deviceId !== d.deviceId),
                          )
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h4>Cameras</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Lat, Lon</th>
                  <th>Radius</th>
                  <th>RSSI</th>
                  <th>Feed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {camRows.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>
                      {c.lat.toFixed(4)}, {c.lon.toFixed(4)}
                    </td>
                    <td>{c.radiusM} m</td>
                    <td>{c.rssi ?? '—'} dBm</td>
                    <td>
                      {c.feedUrl ? (
                        <span className="tag">set</span>
                      ) : (
                        <span className="tag">empty</span>
                      )}
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn"
                        onClick={() => {
                          const url =
                            prompt(
                              'Set feed URL (.m3u8 or .mp4):',
                              c.feedUrl || '',
                            ) || '';
                          setCameras((old) =>
                            old.map((x) =>
                              x.id === c.id ? { ...x, feedUrl: url } : x,
                            ),
                          );
                        }}
                      >
                        Set Feed
                      </button>
                      <button
                        className="btn"
                        onClick={() =>
                          setCameras((old) => old.filter((x) => x.id !== c.id))
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
