import React, { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  LayoutGrid,
  ListChecks,
  Users,
  UserCheck
} from 'lucide-react';
import { Button, Card } from '@mas/ui';
import { MotionWrapper } from '../../ui/MotionWrapper';
import { cn } from '../../../utils/cn';
import {
  mockCalendar,
  CalendarDaySummary,
  CalendarReservation,
  CalendarTableBlock,
  CalendarTask,
  CalendarWeekSlot,
  ReservationStatus,
  TaskStatus,
  OccupancyState,
  TableStatus
} from '../../../data/mockCalendar';

const reservationBadgeStyles: Record<ReservationStatus, string> = {
  confirmed:
    'bg-[rgba(238,118,109,0.12)] text-[#EE766D] border border-[#EE766D]/40',
  seated: 'bg-[#24242E] text-white',
  completed: 'bg-[#D6D6D6] text-[#24242E]',
  cancelled: 'border border-[#EE766D] text-[#EE766D] bg-white',
  waitlist: 'bg-[rgba(214,214,214,0.45)] text-[#24242E] border border-[#D6D6D6]'
};

const occupancyStyles: Record<OccupancyState, string> = {
  light: 'bg-[rgba(214,214,214,0.28)] text-[#24242E] border border-[#D6D6D6]',
  steady: 'bg-[rgba(238,118,109,0.15)] text-[#EE766D] border border-[#EE766D]/40',
  peak: 'bg-[#EE766D] text-white border border-[#EE766D]'
};

const tableStatusStyles: Record<TableStatus, string> = {
  available: 'bg-white border border-dashed border-[#D6D6D6] text-[#24242E]',
  reserved: 'bg-[#EE766D] text-white shadow-sm',
  seated: 'bg-[#24242E] text-white shadow-sm',
  cleaning: 'bg-[rgba(214,214,214,0.6)] text-[#24242E] border border-[#D6D6D6]'
};

const taskStatusAccent: Record<TaskStatus, string> = {
  open: 'text-[#EE766D]',
  'in-progress': 'text-[#24242E]',
  done: 'text-[#D6D6D6] line-through'
};

const occupancyFill: Record<OccupancyState, string> = {
  light: '#D6D6D6',
  steady: '#24242E',
  peak: '#EE766D'
};

export const CalendarApp: React.FC = () => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(mockCalendar.currentDate);
  const shouldReduceMotion = useReducedMotion();

  const daySummary = useMemo<CalendarDaySummary | undefined>(
    () => mockCalendar.monthDays.find((day) => day.date === selectedDate),
    [selectedDate]
  );

  const reservations = useMemo<CalendarReservation[]>(
    () => mockCalendar.reservations.filter((reservation) => reservation.date === selectedDate),
    [selectedDate]
  );

  const waitlistCount = reservations.filter((reservation) => reservation.status === 'waitlist').length;

  const content = (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-[#24242E]">Calendar &amp; Reservations</h1>
          <p className="text-sm text-[#24242E]/70 max-w-2xl">
            Live overview of reservations, floor availability, and shift tasks for
            {` ${mockCalendar.currentWeekRange}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === 'week' ? 'primary' : 'outline'}
            onClick={() => setViewMode('week')}
            className="min-w-[112px]"
          >
            Week view
          </Button>
          <Button
            variant={viewMode === 'month' ? 'primary' : 'outline'}
            onClick={() => setViewMode('month')}
            className="min-w-[112px]"
          >
            Month view
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={CalendarDays}
          label="Reservations"
          value={mockCalendar.summary.reservations.toString()}
          hint="Booked for the week"
        />
        <SummaryTile
          icon={Users}
          label="Covers"
          value={mockCalendar.summary.covers.toString()}
          hint="Expected guests"
        />
        <SummaryTile
          icon={Clock}
          label="Waitlist"
          value={mockCalendar.summary.waitlist.toString()}
          hint="Guests awaiting slots"
        />
        <SummaryTile
          icon={UserCheck}
          label="Special events"
          value={mockCalendar.summary.events.toString()}
          hint="Live music &amp; VIP"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#24242E]/70">{selectedDate}</p>
                <h2 className="text-2xl font-semibold text-[#24242E]">
                  {daySummary?.dayLabel ?? 'Selected day'} overview
                </h2>
              </div>
              {daySummary && (
                <div
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
                    occupancyStyles[daySummary.occupancy]
                  )}
                >
                  <span className="inline-flex h-2 w-2 rounded-full bg-white/80" aria-hidden />
                  {daySummary.occupancy === 'peak'
                    ? 'Peak demand'
                    : daySummary.occupancy === 'steady'
                    ? 'Steady flow'
                    : 'Light service'}
                </div>
              )}
            </header>

            {viewMode === 'week' ? (
              <WeekOccupancy slots={mockCalendar.weekSlots} />
            ) : (
              <MonthGrid
                days={mockCalendar.monthDays}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#24242E]">Reservation board</h3>
                <p className="text-sm text-[#24242E]/70">
                  {reservations.length} reservations · {waitlistCount} waitlist entries
                </p>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutGrid size={16} />
                Manage tables
              </Button>
            </div>

            <ReservationList reservations={reservations} />
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#24242E]">Floor availability</h3>
              <span className="text-xs font-medium uppercase tracking-wide text-[#24242E]/60">
                Drag-ready layout
              </span>
            </div>
            <TableGrid tables={mockCalendar.tables} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#24242E]">Shift tasks</h3>
              <ListChecks className="text-[#EE766D]" size={18} aria-hidden />
            </div>
            <TaskList tasks={mockCalendar.tasks} />
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-semibold text-[#24242E]">Leadership coverage</h3>
            <ul className="space-y-3">
              {mockCalendar.shifts.map((shift) => (
                <li
                  key={shift.label}
                  className="rounded-lg border border-[#D6D6D6] bg-white p-4"
                >
                  <p className="text-sm font-semibold text-[#24242E]">{shift.label}</p>
                  <p className="text-xs text-[#24242E]/70">{shift.start} – {shift.end}</p>
                  <p className="mt-2 text-sm text-[#24242E]">
                    <span className="font-medium">{shift.lead}</span>
                    {`: ${shift.focus}`}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );

  if (shouldReduceMotion) {
    return <div className="p-6">{content}</div>;
  }

  return (
    <MotionWrapper type="page" className="p-6">
      {content}
    </MotionWrapper>
  );
};

interface SummaryTileProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  hint: string;
}

const SummaryTile: React.FC<SummaryTileProps> = ({ icon: Icon, label, value, hint }) => {
  return (
    <div className="rounded-xl border border-[#D6D6D6] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#24242E]/70">{label}</p>
          <p className="text-2xl font-semibold text-[#24242E]">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(238,118,109,0.12)] text-[#EE766D]">
          <Icon size={18} aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-xs text-[#24242E]/60">{hint}</p>
    </div>
  );
};

interface MonthGridProps {
  days: CalendarDaySummary[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({ days, selectedDate, onSelectDate }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={cn(
              'group rounded-xl border bg-white p-4 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EE766D]/40',
              isSelected ? 'border-[#EE766D] shadow-md' : 'border-[#D6D6D6] hover:border-[#EE766D]/40'
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#24242E]">{day.dayLabel}</p>
              {day.isToday && (
                <span className="rounded-full bg-[#EE766D] px-2 py-0.5 text-xs font-semibold text-white">
                  Today
                </span>
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#24242E]">{day.reservations}</p>
            <p className="text-xs text-[#24242E]/60">Reservations</p>
            <div
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
                occupancyStyles[day.occupancy]
              )}
            >
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
              {day.occupancy === 'peak' ? 'Peak' : day.occupancy === 'steady' ? 'Steady' : 'Light'}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const WeekOccupancy: React.FC<{ slots: CalendarWeekSlot[] }> = ({ slots }) => {
  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div key={slot.time} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#24242E]">{slot.time}</span>
            <span className="text-[#24242E]/60">{slot.covers} covers</span>
          </div>
          <div className="h-3 rounded-full bg-[rgba(214,214,214,0.35)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, slot.occupancy * 100)}%`,
                backgroundColor: occupancyFill[slot.status]
              }}
            />
          </div>
          {slot.note && <p className="text-xs text-[#24242E]/60">{slot.note}</p>}
        </div>
      ))}
    </div>
  );
};

const ReservationList: React.FC<{ reservations: CalendarReservation[] }> = ({ reservations }) => {
  if (!reservations.length) {
    return (
      <p className="rounded-lg border border-dashed border-[#D6D6D6] bg-white p-6 text-center text-sm text-[#24242E]/60">
        No reservations scheduled for this day.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reservations.map((reservation) => (
        <li
          key={reservation.id}
          className="rounded-xl border border-[#D6D6D6] bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-[#24242E]">
                  {reservation.guestName}
                </span>
                {reservation.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[rgba(238,118,109,0.12)] px-2 py-0.5 text-xs font-medium text-[#EE766D]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#24242E]/70">
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} aria-hidden />
                  {reservation.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={14} aria-hidden />
                  {reservation.partySize} guests
                </span>
                <span className="inline-flex items-center gap-1">
                  <LayoutGrid size={14} aria-hidden />
                  {reservation.table}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={14} aria-hidden />
                  {reservation.duration} min stay
                </span>
              </div>
              {reservation.notes && (
                <p className="text-sm text-[#24242E]">{reservation.notes}</p>
              )}
            </div>
            <span
              className={cn(
                'self-start rounded-full px-3 py-1 text-sm font-medium',
                reservationBadgeStyles[reservation.status]
              )}
            >
              {reservation.status === 'confirmed'
                ? 'Confirmed'
                : reservation.status === 'seated'
                ? 'Seated'
                : reservation.status === 'completed'
                ? 'Completed'
                : reservation.status === 'cancelled'
                ? 'Cancelled'
                : 'Waitlist'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

const TableGrid: React.FC<{ tables: CalendarTableBlock[] }> = ({ tables }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tables.map((table) => {
        const isDark = table.status === 'reserved' || table.status === 'seated';
        const mutedText = isDark ? 'text-white/70' : 'text-[#24242E]/70';
        const accentText = isDark ? 'text-white' : 'text-[#24242E]';

        return (
          <div
            key={table.id}
            draggable
            tabIndex={0}
            aria-label={`${table.label} seats ${table.capacity} guests, status ${table.status}`}
            className={cn(
              'cursor-grab rounded-xl p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EE766D]/40 active:cursor-grabbing',
              tableStatusStyles[table.status]
            )}
          >
            <div className="flex items-center justify-between">
              <p className={cn('text-lg font-semibold', accentText)}>{table.label}</p>
              <span
                className={cn(
                  'text-xs uppercase tracking-wide',
                  isDark ? 'text-white/70' : 'text-[#24242E]/60'
                )}
              >
                {table.location}
              </span>
            </div>
            <p className={cn('mt-2 text-sm', mutedText)}>Seats {table.capacity}</p>
            {table.upcomingReservation && (
              <p className={cn('mt-3 text-sm', accentText)}>{table.upcomingReservation}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TaskList: React.FC<{ tasks: CalendarTask[] }> = ({ tasks }) => {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-lg border border-[#D6D6D6] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={cn('text-sm font-semibold text-[#24242E]', taskStatusAccent[task.status])}>
                {task.title}
              </p>
              <p className="mt-1 text-xs text-[#24242E]/70">
                Due {task.due} · {task.assignedTo}
              </p>
            </div>
            <span className="rounded-full bg-[rgba(238,118,109,0.12)] px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-[#EE766D]">
              {task.category}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};
