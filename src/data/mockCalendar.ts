export type ReservationStatus =
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'waitlist';

export type TableStatus = 'available' | 'reserved' | 'seated' | 'cleaning';

export type OccupancyState = 'light' | 'steady' | 'peak';

export type TaskStatus = 'open' | 'in-progress' | 'done';

export interface CalendarReservation {
  id: string;
  date: string;
  time: string;
  guestName: string;
  partySize: number;
  status: ReservationStatus;
  table: string;
  duration: number;
  tags?: string[];
  notes?: string;
}

export interface CalendarTableBlock {
  id: string;
  label: string;
  capacity: number;
  status: TableStatus;
  location: 'main' | 'patio' | 'bar';
  upcomingReservation?: string;
}

export interface CalendarTask {
  id: string;
  title: string;
  due: string;
  assignedTo: string;
  status: TaskStatus;
  category: 'reservations' | 'guests' | 'operations';
}

export interface CalendarDaySummary {
  date: string;
  dayLabel: string;
  coverCount: number;
  reservations: number;
  occupancy: OccupancyState;
  isToday?: boolean;
}

export interface CalendarWeekSlot {
  time: string;
  occupancy: number;
  covers: number;
  status: OccupancyState;
  note?: string;
}

export interface CalendarShift {
  label: string;
  start: string;
  end: string;
  lead: string;
  focus: string;
}

export interface CalendarMockData {
  currentDate: string;
  currentWeekRange: string;
  summary: {
    reservations: number;
    covers: number;
    waitlist: number;
    events: number;
  };
  monthDays: CalendarDaySummary[];
  weekSlots: CalendarWeekSlot[];
  reservations: CalendarReservation[];
  tables: CalendarTableBlock[];
  tasks: CalendarTask[];
  shifts: CalendarShift[];
}

export const mockCalendar: CalendarMockData = {
  currentDate: '2024-06-12',
  currentWeekRange: 'June 10 – June 16, 2024',
  summary: {
    reservations: 42,
    covers: 186,
    waitlist: 5,
    events: 2
  },
  monthDays: [
    { date: '2024-06-02', dayLabel: 'Sun', coverCount: 94, reservations: 28, occupancy: 'steady' },
    { date: '2024-06-03', dayLabel: 'Mon', coverCount: 58, reservations: 18, occupancy: 'light' },
    { date: '2024-06-04', dayLabel: 'Tue', coverCount: 74, reservations: 22, occupancy: 'steady' },
    { date: '2024-06-05', dayLabel: 'Wed', coverCount: 112, reservations: 34, occupancy: 'peak' },
    { date: '2024-06-06', dayLabel: 'Thu', coverCount: 128, reservations: 37, occupancy: 'peak' },
    { date: '2024-06-07', dayLabel: 'Fri', coverCount: 162, reservations: 44, occupancy: 'peak' },
    { date: '2024-06-08', dayLabel: 'Sat', coverCount: 178, reservations: 49, occupancy: 'peak' },
    { date: '2024-06-09', dayLabel: 'Sun', coverCount: 96, reservations: 30, occupancy: 'steady' },
    { date: '2024-06-10', dayLabel: 'Mon', coverCount: 62, reservations: 20, occupancy: 'light' },
    { date: '2024-06-11', dayLabel: 'Tue', coverCount: 80, reservations: 24, occupancy: 'steady' },
    {
      date: '2024-06-12',
      dayLabel: 'Wed',
      coverCount: 118,
      reservations: 36,
      occupancy: 'peak',
      isToday: true
    },
    { date: '2024-06-13', dayLabel: 'Thu', coverCount: 130, reservations: 38, occupancy: 'peak' },
    { date: '2024-06-14', dayLabel: 'Fri', coverCount: 168, reservations: 47, occupancy: 'peak' },
    { date: '2024-06-15', dayLabel: 'Sat', coverCount: 182, reservations: 50, occupancy: 'peak' },
    { date: '2024-06-16', dayLabel: 'Sun', coverCount: 102, reservations: 31, occupancy: 'steady' }
  ],
  weekSlots: [
    { time: '17:00', occupancy: 0.45, covers: 24, status: 'steady', note: 'Early diners & pre-show' },
    { time: '18:00', occupancy: 0.72, covers: 36, status: 'peak' },
    { time: '19:00', occupancy: 0.86, covers: 44, status: 'peak', note: 'Most tables turning over' },
    { time: '20:00', occupancy: 0.78, covers: 38, status: 'peak' },
    { time: '21:00', occupancy: 0.54, covers: 28, status: 'steady' },
    { time: '22:00', occupancy: 0.32, covers: 16, status: 'light', note: 'Late bar seating' }
  ],
  reservations: [
    {
      id: 'res-101',
      date: '2024-06-12',
      time: '17:30',
      guestName: 'Alex Morgan',
      partySize: 4,
      status: 'confirmed',
      table: 'T12',
      duration: 90,
      tags: ['Anniversary'],
      notes: 'Prefers a quieter corner table.'
    },
    {
      id: 'res-102',
      date: '2024-06-12',
      time: '18:00',
      guestName: 'Priya Desai',
      partySize: 2,
      status: 'seated',
      table: 'T6',
      duration: 75,
      tags: ['VIP']
    },
    {
      id: 'res-103',
      date: '2024-06-12',
      time: '18:30',
      guestName: 'Liam Chen',
      partySize: 6,
      status: 'confirmed',
      table: 'T18',
      duration: 120,
      notes: 'Cake arrival at 19:15.'
    },
    {
      id: 'res-104',
      date: '2024-06-12',
      time: '19:15',
      guestName: 'Jordan Smith',
      partySize: 3,
      status: 'waitlist',
      table: 'T9',
      duration: 90,
      tags: ['Allergy: nuts']
    },
    {
      id: 'res-105',
      date: '2024-06-12',
      time: '19:45',
      guestName: 'Martinez Family',
      partySize: 5,
      status: 'confirmed',
      table: 'T2',
      duration: 105
    },
    {
      id: 'res-106',
      date: '2024-06-12',
      time: '20:15',
      guestName: 'Sofia Alvarez',
      partySize: 2,
      status: 'completed',
      table: 'Bar 2',
      duration: 60
    },
    {
      id: 'res-107',
      date: '2024-06-12',
      time: '21:00',
      guestName: 'Noah Williams',
      partySize: 2,
      status: 'cancelled',
      table: 'T5',
      duration: 60,
      notes: 'Cancelled at 15:20, deposit refunded.'
    }
  ],
  tables: [
    {
      id: 'tbl-1',
      label: 'T1',
      capacity: 2,
      status: 'available',
      location: 'main',
      upcomingReservation: 'Hold for walk-in couples.'
    },
    {
      id: 'tbl-2',
      label: 'T2',
      capacity: 5,
      status: 'reserved',
      location: 'main',
      upcomingReservation: 'Martinez Family at 19:45'
    },
    {
      id: 'tbl-3',
      label: 'T4',
      capacity: 4,
      status: 'seated',
      location: 'main',
      upcomingReservation: 'Priya Desai — seated 18:00'
    },
    {
      id: 'tbl-4',
      label: 'T6',
      capacity: 2,
      status: 'seated',
      location: 'patio',
      upcomingReservation: 'Dessert fire at 18:45'
    },
    {
      id: 'tbl-5',
      label: 'T8',
      capacity: 4,
      status: 'reserved',
      location: 'patio',
      upcomingReservation: 'Liam Chen at 18:30'
    },
    {
      id: 'tbl-6',
      label: 'T10',
      capacity: 6,
      status: 'available',
      location: 'main',
      upcomingReservation: 'Open for waitlist at 19:15'
    },
    {
      id: 'tbl-7',
      label: 'T12',
      capacity: 4,
      status: 'reserved',
      location: 'bar',
      upcomingReservation: 'Anniversary setup by 17:20'
    },
    {
      id: 'tbl-8',
      label: 'Bar 2',
      capacity: 2,
      status: 'cleaning',
      location: 'bar',
      upcomingReservation: 'Turn table by 20:45'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Confirm 10pax corporate booking for Friday',
      due: '15:00',
      assignedTo: 'Jamie',
      status: 'in-progress',
      category: 'reservations'
    },
    {
      id: 'task-2',
      title: 'Prepare anniversary dessert plate for T12',
      due: '17:15',
      assignedTo: 'Ana',
      status: 'open',
      category: 'guests'
    },
    {
      id: 'task-3',
      title: 'Update patio heating schedule',
      due: '18:30',
      assignedTo: 'Chris',
      status: 'done',
      category: 'operations'
    },
    {
      id: 'task-4',
      title: 'Call waitlist for 19:15 slot',
      due: '18:45',
      assignedTo: 'Taylor',
      status: 'open',
      category: 'reservations'
    },
    {
      id: 'task-5',
      title: 'Verify band setup checklist',
      due: '19:30',
      assignedTo: 'Morgan',
      status: 'in-progress',
      category: 'operations'
    }
  ],
  shifts: [
    {
      label: 'Service Lead',
      start: '16:00',
      end: '00:00',
      lead: 'Morgan Blake',
      focus: 'Monitor VIP experiences & live music guests.'
    },
    {
      label: 'Floor Supervisor',
      start: '16:30',
      end: '23:00',
      lead: 'Taylor Ray',
      focus: 'Coordinate table turns and walk-in traffic.'
    }
  ]
};
