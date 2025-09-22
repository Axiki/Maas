import React from 'react';
import { CalendarDays, ListTodo, Plus, Clock, Users } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';

const upcomingEvents = [
  { id: 'event-001', title: 'PO Arrival — Urban Produce', time: '08:30 AM', location: 'Receiving Bay', type: 'PO', assignee: 'Nina' },
  { id: 'event-002', title: 'Reservation — Harper Family', time: '07:00 PM', location: 'Table 12', type: 'Reservation', assignee: 'Front Desk' }
];

const tasks = [
  { id: 'task-001', title: 'Inventory Count — Walk-in', due: 'Today • 10:00 PM', owner: 'Caleb', status: 'In Progress' },
  { id: 'task-002', title: 'Staff Meeting — FOH', due: 'Tomorrow • 3:00 PM', owner: 'Lane', status: 'Scheduled' }
];

export const Calendar: React.FC = () => (
  <MotionWrapper type="page" className="p-6">
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="heading-md">Calendar & Tasks</h1>
          <p className="body-md text-muted">Coordinate reservations, stock counts, arrivals, and key milestones.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ListTodo size={16} />
            Add Task
          </Button>
          <Button size="sm" className="gap-2">
            <Plus size={16} />
            New Event
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-4 xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-primary-600">
            <CalendarDays size={18} />
            <h2 className="heading-xs">Week at a glance</h2>
          </div>
          <div className="rounded-xl border border-dashed border-line/80 bg-surface-100 p-6 text-center text-muted">
            <p className="body-sm">Calendar component placeholder — integrate scheduling provider.</p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="heading-xs">Upcoming Events</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <ul className="space-y-2">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="rounded-lg border border-line/70 bg-surface-100 px-3 py-2">
                  <p className="body-sm font-medium text-ink">{event.title}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} />
                      {event.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={14} />
                      {event.assignee}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="heading-xs">Task Board</h2>
              <Button variant="ghost" size="sm">Assign</Button>
            </div>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="rounded-lg border border-line/70 bg-surface-100 px-3 py-2">
                  <p className="body-sm font-medium text-ink">{task.title}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span>{task.due}</span>
                    <span className="text-primary-600 font-semibold">{task.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </div>
  </MotionWrapper>
);
