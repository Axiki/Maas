import { useCallback } from 'react';

export type CalendarView = 'week' | 'month';

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled';

export interface CalendarReservation {
  id: string;
  guestName: string;
  table: string;
  covers: number;
  status: ReservationStatus;
  start: string;
  end: string;
  notes?: string;
}

export type TaskStatus = 'urgent' | 'scheduled' | 'completed';

export interface CalendarTask {
  id: string;
  title: string;
  due: string;
  owner: string;
  status: TaskStatus;
  context: string;
}

interface ExportPayload {
  reservations: CalendarReservation[];
  tasks: CalendarTask[];
  view: CalendarView;
}

interface SyncPayload {
  reservations: CalendarReservation[];
  tasks: CalendarTask[];
}

export const useCalendarService = () => {
  const exportToICS = useCallback(async (payload: ExportPayload) => {
    console.info('ICS export requested', payload);
    return { ok: true } as const;
  }, []);

  const queueSync = useCallback((payload: SyncPayload) => {
    console.info('Background sync queued', payload);
  }, []);

  const openIntegrationSettings = useCallback(() => {
    console.info('Open calendar integration settings');
  }, []);

  return {
    exportToICS,
    queueSync,
    openIntegrationSettings,
  };
};
