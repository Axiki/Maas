import { subMinutes, subSeconds } from 'date-fns';
import type {
  KdsLane,
  KdsOrderTicket,
  KdsStationTag,
  KdsTimersConfig,
} from '../types/kds';

const baseNow = new Date();

const minutesAgo = (minutes: number) => subMinutes(baseNow, minutes).toISOString();
const secondsAgo = (seconds: number) => subSeconds(baseNow, seconds).toISOString();

export const mockKdsLanes: KdsLane[] = [
  {
    id: 'lane-new',
    title: 'New',
    status: 'new',
    description: 'Freshly fired orders awaiting acknowledgement.',
  },
  {
    id: 'lane-progress',
    title: 'In Progress',
    status: 'in-progress',
    description: 'Tickets currently being prepared on the line.',
  },
  {
    id: 'lane-ready',
    title: 'Ready',
    status: 'ready',
    description: 'Completed plates waiting for pickup or running.',
  },
];

export const mockKdsTimers: KdsTimersConfig = {
  warningSeconds: 420,
  dangerSeconds: 600,
  readyGraceSeconds: 300,
};

export const mockKdsStationTags: KdsStationTag[] = [
  {
    id: 'expo',
    label: 'Expo',
    description: 'Window plating and handoff.',
    background: '#24242E',
    foreground: '#D6D6D6',
  },
  {
    id: 'grill',
    label: 'Grill',
    description: 'Grill and flat-top station.',
    background: '#EE766D',
    foreground: '#24242E',
  },
  {
    id: 'dessert',
    label: 'Dessert',
    description: 'Cold line desserts and plating.',
    background: '#D6D6D6',
    foreground: '#24242E',
  },
  {
    id: 'bar',
    label: 'Bar',
    description: 'Beverage coordination.',
    background: '#EE766D',
    foreground: '#24242E',
  },
];

export const mockKdsOrders: KdsOrderTicket[] = [
  {
    id: 'ticket-1042',
    orderNumber: '1042',
    status: 'new',
    serviceType: 'dine-in',
    tableNumber: '12',
    guestName: 'Lopez',
    startedAt: minutesAgo(2),
    prepSeconds: 720,
    stationTags: ['expo', 'grill'],
    notes: 'Nut allergy: avoid cross contamination.',
    items: [
      {
        id: 'item-1042-1',
        name: 'Prime Burger',
        quantity: 2,
        modifiers: ['No onions', 'Medium rare'],
        stationTag: 'grill',
      },
      {
        id: 'item-1042-2',
        name: 'House Fries',
        quantity: 1,
        modifiers: ['Truffle aioli on side'],
        stationTag: 'expo',
      },
    ],
  },
  {
    id: 'ticket-1045',
    orderNumber: '1045',
    status: 'new',
    serviceType: 'takeaway',
    destination: 'Pickup shelf A',
    startedAt: minutesAgo(1),
    prepSeconds: 540,
    stationTags: ['expo'],
    isRush: true,
    items: [
      {
        id: 'item-1045-1',
        name: 'Roasted Veggie Wrap',
        quantity: 1,
        modifiers: ['Spinach tortilla'],
        stationTag: 'expo',
      },
      {
        id: 'item-1045-2',
        name: 'Seasonal Soup',
        quantity: 1,
        modifiers: ['Add bread roll'],
        stationTag: 'expo',
      },
    ],
  },
  {
    id: 'ticket-1049',
    orderNumber: '1049',
    status: 'new',
    serviceType: 'delivery',
    startedAt: minutesAgo(4),
    prepSeconds: 900,
    stationTags: ['grill', 'dessert'],
    notes: 'Courier arriving at 7:15pm.',
    items: [
      {
        id: 'item-1049-1',
        name: 'Fire-Grilled Salmon',
        quantity: 1,
        modifiers: ['Gluten-free'],
        stationTag: 'grill',
      },
      {
        id: 'item-1049-2',
        name: 'Key Lime Pie',
        quantity: 1,
        stationTag: 'dessert',
      },
    ],
  },
  {
    id: 'ticket-1054',
    orderNumber: '1054',
    status: 'in-progress',
    serviceType: 'dine-in',
    tableNumber: '7',
    startedAt: minutesAgo(8),
    prepSeconds: 660,
    stationTags: ['grill'],
    items: [
      {
        id: 'item-1054-1',
        name: 'Charred Ribeye',
        quantity: 1,
        modifiers: ['Medium'],
        stationTag: 'grill',
      },
      {
        id: 'item-1054-2',
        name: 'Garlic Mash',
        quantity: 1,
        stationTag: 'expo',
      },
    ],
  },
  {
    id: 'ticket-1056',
    orderNumber: '1056',
    status: 'in-progress',
    serviceType: 'takeaway',
    startedAt: minutesAgo(5),
    prepSeconds: 600,
    stationTags: ['expo'],
    items: [
      {
        id: 'item-1056-1',
        name: 'Chicken Pad Thai',
        quantity: 2,
        modifiers: ['Extra lime'],
        stationTag: 'expo',
      },
    ],
  },
  {
    id: 'ticket-1058',
    orderNumber: '1058',
    status: 'in-progress',
    serviceType: 'curbside',
    destination: 'Curb 3',
    startedAt: minutesAgo(9),
    prepSeconds: 780,
    stationTags: ['expo', 'dessert'],
    notes: 'Guest waiting outside.',
    items: [
      {
        id: 'item-1058-1',
        name: 'Fried Chicken Sandwich',
        quantity: 2,
        modifiers: ['No pickles'],
        stationTag: 'expo',
      },
      {
        id: 'item-1058-2',
        name: 'Chocolate Mousse',
        quantity: 2,
        stationTag: 'dessert',
      },
    ],
  },
  {
    id: 'ticket-1060',
    orderNumber: '1060',
    status: 'ready',
    serviceType: 'dine-in',
    tableNumber: '4',
    startedAt: minutesAgo(12),
    bumpedAt: secondsAgo(120),
    prepSeconds: 780,
    stationTags: ['expo'],
    items: [
      {
        id: 'item-1060-1',
        name: 'Chef Tasting Board',
        quantity: 1,
        modifiers: ['Add extra crostini'],
        stationTag: 'expo',
      },
    ],
  },
  {
    id: 'ticket-1062',
    orderNumber: '1062',
    status: 'ready',
    serviceType: 'delivery',
    startedAt: minutesAgo(14),
    bumpedAt: secondsAgo(30),
    prepSeconds: 840,
    stationTags: ['expo', 'bar'],
    destination: 'DoorDash - Alex',
    items: [
      {
        id: 'item-1062-1',
        name: 'Spicy Noodle Bowl',
        quantity: 1,
        stationTag: 'expo',
      },
      {
        id: 'item-1062-2',
        name: 'Thai Iced Tea',
        quantity: 1,
        stationTag: 'bar',
      },
    ],
  },
];
