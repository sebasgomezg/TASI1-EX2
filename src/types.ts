export type View = 
  | 'LOGIN' 
  | 'HOME'
  | 'ZONES' 
  | 'SECTORS' 
  | 'BLOCKS' 
  | 'BLOCK_DETAIL' 
  | 'REGISTER_PANEL_1' 
  | 'REGISTER_PANEL_2' 
  | 'REGISTER_PANEL_3' 
  | 'REGISTER_LOADING'
  | 'REGISTER_SUCCESS' 
  | 'PANEL_DETAIL';

export interface Zone {
  id: string;
  name: string;
  location: string;
  coords: string;
  altitude: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface Sector {
  id: string;
  zoneId: string;
  name: string;
  description: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface Block {
  id: string;
  sectorId: string;
  name: string;
  type: string;
  power: string;
  capacity: number;
  status: 'OPERATIVO' | 'MANTENIMIENTO';
}

export interface Panel {
  id: string;
  blockId: string;
  name: string;
  serial: string;
  type: string;
  installationDate: string;
  row: number;
  col: number;
  status: 'OPERATIVO' | 'ALERTA' | 'ERROR';
  terminalId: string;
  mac: string;
}

export interface Telemetry {
  power: number;
  voltage: number;
  current: number;
  temperature: number;
  timestamp: string;
}
