export type DeviceType =
  | 'collar'
  | 'relay'
  | 'gateway'
  | 'tower'
  | 'fixed_node'
  | 'aerial_node';

export interface Device {
  alias: string;
  deviceId: string;
  type?: DeviceType;
  status: 'online' | 'offline' | 'inactive';
  batteryV?: number;
  ranch?: string;
  lat: number;
  lon: number;
  fwVersion?: string;
  rssi?: number;
}

export interface Camera {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusM: number;
  rssi?: number;
  feedUrl?: string;
  note?: string;
}

export type Severity = 'P0' | 'P1' | 'P2' | 'INFO';

export interface Alert {
  id: string;
  severity: Severity;
  deviceId: string;
  alias: string;
  kind: string;
  confidence: number; // 0..1
  ts: string; // ISO time
  acked: boolean;
}
