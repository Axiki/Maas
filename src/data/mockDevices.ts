export type DeviceCapability = 'print' | 'drawer';

export interface MockDevice {
  id: string;
  name: string;
  type: 'Receipt Printer' | 'Kitchen Printer' | 'Cash Drawer' | 'Barcode Scanner';
  location: string;
  model: string;
  ipAddress: string;
  firmware: string;
  lastSeen: string;
  connected: boolean;
  capabilities: DeviceCapability[];
}

export const mockDevices: MockDevice[] = [
  {
    id: 'device-01',
    name: 'Front Counter Printer',
    type: 'Receipt Printer',
    location: 'Register 1',
    model: 'Epson TM-T88VI',
    ipAddress: '10.10.0.21',
    firmware: 'v3.2.5',
    lastSeen: '2024-09-18T14:32:00.000Z',
    connected: true,
    capabilities: ['print']
  },
  {
    id: 'device-02',
    name: 'Cash Drawer',
    type: 'Cash Drawer',
    location: 'Register 2',
    model: 'APG Series 4000',
    ipAddress: '10.10.0.30',
    firmware: 'v1.4.0',
    lastSeen: '2024-09-18T13:58:00.000Z',
    connected: true,
    capabilities: ['drawer']
  },
  {
    id: 'device-03',
    name: 'Kitchen Pass Printer',
    type: 'Kitchen Printer',
    location: 'Kitchen',
    model: 'Star mC-Print3',
    ipAddress: '10.10.0.45',
    firmware: 'v2.9.1',
    lastSeen: '2024-09-18T12:15:00.000Z',
    connected: false,
    capabilities: ['print']
  },
  {
    id: 'device-04',
    name: 'Bar Scanner',
    type: 'Barcode Scanner',
    location: 'Bar Station',
    model: 'Zebra DS2208',
    ipAddress: '10.10.0.55',
    firmware: 'v5.1.3',
    lastSeen: '2024-09-18T12:46:00.000Z',
    connected: true,
    capabilities: []
  }
];
