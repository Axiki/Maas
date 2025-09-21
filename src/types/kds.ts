export type KdsOrderStatus = 'new' | 'in-progress' | 'ready';

export type KdsServiceType = 'dine-in' | 'takeaway' | 'delivery' | 'curbside';

export interface KdsStationTag {
  id: string;
  label: string;
  description?: string;
  /**
   * Background color used when rendering the tag chip. Should reference the approved palette.
   */
  background: string;
  /**
   * Text color that maintains accessible contrast with the background.
   */
  foreground: string;
}

export interface KdsTimersConfig {
  /**
   * Number of seconds after which the timer should switch to a warning state.
   */
  warningSeconds: number;
  /**
   * Number of seconds after which the timer should switch to a danger state.
   */
  dangerSeconds: number;
  /**
   * Grace period (in seconds) before ready tickets auto-clear or require bumping.
   */
  readyGraceSeconds: number;
}

export interface KdsOrderItem {
  id: string;
  name: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
  stationTag?: string;
}

export interface KdsOrderTicket {
  id: string;
  orderNumber: string;
  status: KdsOrderStatus;
  serviceType: KdsServiceType;
  tableNumber?: string;
  guestName?: string;
  destination?: string;
  startedAt: string;
  prepSeconds: number;
  bumpedAt?: string;
  isRush?: boolean;
  notes?: string;
  stationTags: string[];
  items: KdsOrderItem[];
}

export interface KdsLane {
  id: string;
  title: string;
  status: KdsOrderStatus;
  description?: string;
}
