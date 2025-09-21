import React, { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  addHours,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Calendar as CalendarIcon, Clock, Download, Settings } from 'lucide-react';
import { Button, Card } from '@mas/ui';
import { cn } from '@mas/utils';
import {
  CalendarReservation,
  CalendarTask,
  CalendarView,
  ReservationStatus,
  TaskStatus,
  useCalendarService,
} from '../../../services/calendarService';

const reservationStatusClasses: Record<ReservationStatus, string> = {
  confirmed: 'border-[rgba(238,118,109,0.35)] bg-[rgba(238,118,109,0.12)] text-[#24242E]',
  pending: 'border-[#D6D6D6] bg-white text-[#24242E]',
  cancelled: 'border-[#24242E] bg-[#24242E] text-white',
};

const taskStatusClasses: Record<TaskStatus, string> = {
  urgent: 'bg-[rgba(238,118,109,0.12)] text-[#24242E] border-[rgba(238,118,109,0.35)]',
  scheduled: 'bg-white text-[#24242E] border-[#D6D6D6]',
  completed: 'bg-[#24242E] text-white border-[#24242E]',
};

const viewOptions: Array<{ id: CalendarView; label: string; description: string }> = [
  { id: 'week', label: 'Week', description: 'Tables vs. stock across 7-day window' },
  { id: 'month', label: 'Month', description: 'High-level occupancy & covers' },
];

const today = new Date();

export const CalendarApp: React.FC = () => {
  const [view, setView] = useState<CalendarView>('week');
  const { exportToICS, queueSync, openIntegrationSettings } = useCalendarService();

  const reservations = useMemo<CalendarReservation[]>(
    () => [
      {
        id: 'res-1',
        guestName: 'Elena Ortega',
        table: 'T4',
        covers: 4,
        status: 'confirmed',
        start: addHours(today, 2).toISOString(),
        end: addHours(today, 4).toISOString(),
        notes: 'Allergy: shellfish',
      },
      {
        id: 'res-2',
        guestName: 'Finlay Rhodes',
        table: 'Chef\'s Counter',
        covers: 2,
        status: 'pending',
        start: addDays(addHours(today, 20), 1).toISOString(),
        end: addDays(addHours(today, 22), 1).toISOString(),
      },
      {
        id: 'res-3',
        guestName: 'Sora Kim',
        table: 'Mezzanine',
        covers: 6,
        status: 'confirmed',
        start: addDays(addHours(today, 48), 2).toISOString(),
        end: addDays(addHours(today, 51), 2).toISOString(),
        notes: 'Pre-theatre seating request',
      },
      {
        id: 'res-4',
        guestName: 'Patrice Bowen',
        table: 'Garden',
        covers: 3,
        status: 'cancelled',
        start: addDays(addHours(today, 72), 3).toISOString(),
        end: addDays(addHours(today, 75), 3).toISOString(),
        notes: 'Cancelled via portal',
      },
      {
        id: 'res-5',
        guestName: 'Team Wine Tasting',
        table: 'Cellar Suite',
        covers: 10,
        status: 'confirmed',
        start: addDays(addHours(today, 96), 4).toISOString(),
        end: addDays(addHours(today, 102), 4).toISOString(),
      },
    ],
    [],
  );

  const upcomingTasks = useMemo<CalendarTask[]>(
    () => [
      {
        id: 'task-1',
        title: 'Defrost pastry inventory',
        due: addHours(today, 18).toISOString(),
        owner: 'Prep',
        status: 'urgent',
        context: 'Stock room',
      },
      {
        id: 'task-2',
        title: 'Confirm florist delivery',
        due: addDays(today, 2).toISOString(),
        owner: 'Events',
        status: 'scheduled',
        context: 'Private dining',
      },
      {
        id: 'task-3',
        title: 'Upload new prix fixe menu',
        due: addDays(today, 4).toISOString(),
        owner: 'Marketing',
        status: 'completed',
        context: 'Website sync',
      },
    ],
    [],
  );

  useEffect(() => {
    queueSync({ reservations, tasks: upcomingTasks });
  }, [queueSync, reservations, upcomingTasks]);

  const reservationsByDay = useMemo(() => {
    return reservations.reduce<Record<string, CalendarReservation[]>>((acc, reservation) => {
      const key = format(new Date(reservation.start), 'yyyy-MM-dd');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reservation);
      return acc;
    }, {});
  }, [reservations]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, []);

  const monthMatrix = useMemo(() => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const firstDayIndex = (monthStart.getDay() + 6) % 7; // align Monday start
    const totalDays = monthEnd.getDate();

    const cells: Array<Date | null> = Array.from({ length: firstDayIndex }, () => null);
    for (let day = 0; day < totalDays; day += 1) {
      cells.push(addDays(monthStart, day));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const weeks: Array<Array<Date | null>> = [];
    for (let index = 0; index < cells.length; index += 7) {
      weeks.push(cells.slice(index, index + 7));
    }
    return weeks;
  }, []);

  const handleExport = async () => {
    await exportToICS({ reservations, tasks: upcomingTasks, view });
  };

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#24242E]/60">
              Hospitality calendar
            </p>
            <h1 className="text-3xl font-semibold text-[#24242E]">Front-of-house schedule</h1>
            <p className="text-sm text-[#24242E]/70">
              Toggle between tactical and strategic planning views while keeping covers, stock, and
              prep tasks aligned.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-[#D6D6D6] bg-white p-1 shadow-sm">
              {viewOptions.map((option) => {
                const isActive = option.id === view;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setView(option.id)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                      isActive
                        ? 'bg-[#EE766D] text-white focus-visible:outline-[#EE766D]'
                        : 'text-[#24242E]/70 hover:bg-[#D6D6D6]/40 focus-visible:outline-[#D6D6D6]'
                    )}
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              onClick={handleExport}
              className="gap-2 rounded-full border border-[#EE766D] bg-[#EE766D] px-4 py-2 text-sm font-semibold text-white shadow-card transition-transform hover:translate-y-[-1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE766D]"
            >
              <Download size={16} aria-hidden />
              Export .ics
            </Button>
            <Button
              variant="outline"
              onClick={openIntegrationSettings}
              className="gap-2 rounded-full border-[#D6D6D6] bg-white px-4 py-2 text-sm font-semibold text-[#24242E] transition-transform hover:translate-y-[-1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24242E]"
            >
              <Settings size={16} aria-hidden />
              Integrations
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-sm font-medium text-[#24242E]/70">
                <CalendarIcon size={16} aria-hidden />
                {format(today, 'MMMM yyyy')}
              </span>
              <p className="text-lg font-semibold text-[#24242E]">
                {view === 'week' ? 'Service week plan' : 'Monthly occupancy overview'}
              </p>
              <p className="text-sm text-[#24242E]/70">
                {viewOptions.find((option) => option.id === view)?.description}
              </p>
            </div>

            {view === 'week' ? (
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                  {weekDays.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const dayReservations = reservationsByDay[key] ?? [];
                    return (
                      <div
                        key={key}
                        className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#D6D6D6] bg-white/60 p-4 backdrop-blur"
                      >
                        <div className="flex items-center justify-between text-sm text-[#24242E]">
                          <div>
                            <p className="font-semibold">{format(day, 'EEE')}</p>
                            <p className="text-xs text-[#24242E]/60">{format(day, 'd MMM')}</p>
                          </div>
                          <span className="rounded-full bg-[#EE766D]/10 px-2 py-1 text-xs font-semibold text-[#24242E]">
                            {dayReservations.reduce((acc, reservation) => acc + reservation.covers, 0)} covers
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {dayReservations.length > 0 ? (
                            dayReservations.map((reservation) => (
                              <button
                                key={reservation.id}
                                type="button"
                                draggable
                                className={cn(
                                  'cursor-grab rounded-xl border px-3 py-2 text-left text-sm shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                                  reservationStatusClasses[reservation.status],
                                )}
                              >
                                <p className="flex items-center justify-between font-semibold">
                                  <span>{reservation.guestName}</span>
                                  <span className="text-xs font-medium text-[#24242E]/70">
                                    {format(new Date(reservation.start), 'HH:mm')}
                                  </span>
                                </p>
                                <p className="mt-1 text-xs text-[#24242E]/70">
                                  {reservation.table} • {reservation.covers} guests
                                </p>
                              </button>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-[#D6D6D6] bg-white p-3 text-center text-xs text-[#24242E]/60">
                              Drag tables or stock counts here
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-[#D6D6D6] bg-white/70 p-4">
                  <p className="text-sm font-semibold text-[#24242E]">Stock alignment</p>
                  <p className="text-xs text-[#24242E]/70">
                    Map prep counts to reservations. Drag handles above mimic the future drag-and-drop
                    experience for allocating tables or trays.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-xs font-medium text-[#24242E]/70">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                    <span key={label} className="px-2 py-1 text-center uppercase tracking-wide">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="grid gap-2">
                  {monthMatrix.map((week, index) => (
                    <div key={`week-${index}`} className="grid grid-cols-7 gap-2">
                      {week.map((day, cellIndex) => {
                        if (!day) {
                          return (
                            <div
                              key={`empty-${index}-${cellIndex}`}
                              className="min-h-[88px] rounded-xl border border-dashed border-[#D6D6D6] bg-white/40"
                              aria-hidden
                            />
                          );
                        }

                        const key = format(day, 'yyyy-MM-dd');
                        const dayReservations = reservationsByDay[key] ?? [];
                        const isToday = isSameDay(day, today);
                        return (
                          <div
                            key={key}
                            className={cn(
                              'flex min-h-[88px] flex-col gap-1 rounded-xl border bg-white/70 p-2 text-xs transition-colors',
                              isToday ? 'border-[#EE766D] shadow-card' : 'border-[#D6D6D6]'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className={cn('font-semibold', isToday && 'text-[#EE766D]')}>
                                {format(day, 'd')}
                              </span>
                              <span className="rounded-full bg-[#D6D6D6]/60 px-2 py-0.5 text-[10px] font-semibold text-[#24242E]">
                                {dayReservations.length} resv
                              </span>
                            </div>
                            {dayReservations.slice(0, 3).map((reservation) => (
                              <span
                                key={reservation.id}
                                className={cn(
                                  'line-clamp-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                                  reservationStatusClasses[reservation.status],
                                )}
                              >
                                {format(new Date(reservation.start), 'HH:mm')} {reservation.guestName}
                              </span>
                            ))}
                            {dayReservations.length > 3 && (
                              <span className="text-[10px] font-medium text-[#24242E]/60">
                                +{dayReservations.length - 3} more
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-[#24242E]">Reservations</h2>
                <p className="text-sm text-[#24242E]/70">
                  Real-time feed of covers and timing, styled with the MAS palette for clarity.
                </p>
              </div>
              <ul className="space-y-3">
                {reservations.map((reservation) => (
                  <li
                    key={reservation.id}
                    className="rounded-2xl border border-[#D6D6D6] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#24242E]">{reservation.guestName}</p>
                        <p className="text-xs text-[#24242E]/70">
                          {reservation.table} • {reservation.covers} guests
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                          reservationStatusClasses[reservation.status],
                        )}
                      >
                        {reservation.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#24242E]/70">
                      <Clock size={14} aria-hidden />
                      <span>
                        {format(new Date(reservation.start), 'EEE d MMM, HH:mm')} –
                        {` ${format(new Date(reservation.end), 'HH:mm')}`}
                      </span>
                    </div>
                    {reservation.notes && (
                      <p className="mt-2 text-xs text-[#24242E]/70">{reservation.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-[#24242E]">Upcoming tasks</h2>
                <p className="text-sm text-[#24242E]/70">
                  Assign prep, service, and marketing tasks to match the upcoming service load.
                </p>
              </div>
              <ul className="space-y-3">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="rounded-2xl border border-[#D6D6D6] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#24242E]">{task.title}</p>
                        <p className="text-xs text-[#24242E]/70">{task.context}</p>
                        <p className="mt-2 text-xs text-[#24242E]/70">
                          Due {format(new Date(task.due), 'EEE d MMM, HH:mm')} • Owner: {task.owner}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                          taskStatusClasses[task.status],
                        )}
                      >
                        {task.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
