import React from 'react';
import { ChefHat, Timer, CheckCircle2, Clock3 } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion.create(Card);

export const KDS: React.FC = () => {
  const mockStations = [
    { id: 'kitchen', name: 'Kitchen Pass', active: true, tickets: 6 },
    { id: 'bar', name: 'Bar', active: true, tickets: 3 },
    { id: 'dessert', name: 'Dessert', active: false, tickets: 0 }
  ];

  const mockTickets = [
    {
      id: 'ord-1045',
      table: 'Table 7',
      items: [
        { name: 'Charred Octopus', modifiers: ['No olives'] },
        { name: 'Burnt Basque Cheesecake', modifiers: ['Extra berries'] }
      ],
      status: 'firing',
      station: 'Kitchen Pass',
      duration: '06:12'
    },
    {
      id: 'ord-1046',
      table: 'Bar Pick-up',
      items: [
        { name: 'Signature Negroni', modifiers: ['Single ice'] },
        { name: 'Spiced Old Fashioned', modifiers: [] }
      ],
      status: 'plating',
      station: 'Bar',
      duration: '03:41'
    },
    {
      id: 'ord-1047',
      table: 'Table 3',
      items: [
        { name: 'Buttermilk Fried Chicken', modifiers: ['Sauce on side'] },
        { name: 'Truffle Mash', modifiers: [] }
      ],
      status: 'waiting',
      station: 'Kitchen Pass',
      duration: '01:18'
    }
  ];

  const statusPills: Record<string, string> = {
    firing: 'bg-warning/10 text-warning',
    plating: 'bg-primary-100 text-primary-600',
    waiting: 'bg-muted/10 text-muted'
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="heading-md">Kitchen Display</h1>
            <p className="body-md text-muted">Real-time view of orders across every station.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <ChefHat size={16} />
              Manage Stations
            </Button>
            <Button size="sm" className="gap-2">
              <Timer size={16} />
              Snooze Ticket
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AnimatePresence>
            {mockStations.map((station) => (
              <MotionCard
                key={station.id}
                className="p-4 space-y-3"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="heading-xs">{station.name}</h2>
                  <span
                    className={`body-xs font-medium px-2 py-1 rounded-full ${
                      station.active ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
                    }`}
                  >
                    {station.active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-3xl font-semibold text-ink">{station.tickets}</p>
                <p className="body-sm text-muted">Tickets in queue</p>
              </MotionCard>
            ))}
          </AnimatePresence>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnimatePresence>
            {mockTickets.map((ticket) => (
              <MotionCard
                key={ticket.id}
                className="p-5 space-y-4 border border-line"
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(0,0,0,0.12)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="body-xs text-muted uppercase tracking-wide">{ticket.station}</p>
                    <h3 className="heading-xs text-ink">{ticket.table}</h3>
                  </div>
                <div className="flex items-center gap-2">
                  <span className={`body-xs font-semibold px-3 py-1 rounded-full ${statusPills[ticket.status]}`}>
                    {ticket.status === 'firing' && 'Firing'}
                    {ticket.status === 'plating' && 'Plating'}
                    {ticket.status === 'waiting' && 'Waiting'}
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-full bg-surface-200 px-2 py-1 text-xs font-medium text-muted">
                    <Clock3 size={14} />
                    {ticket.duration}
                  </div>
                </div>
              </div>

              <ul className="space-y-3">
                {ticket.items.map((item) => (
                  <li key={item.name} className="rounded-lg border border-line/60 bg-surface-100 px-3 py-2">
                    <p className="body-sm font-medium text-ink">{item.name}</p>
                    {item.modifiers.length > 0 ? (
                      <p className="body-xs text-muted">{item.modifiers.join(', ')}</p>
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <CheckCircle2 size={14} />
                  Mark Ready
                </Button>
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  Bump Ticket
                </Button>
              </div>
              </MotionCard>
            ))}
          </AnimatePresence>
        </section>
      </div>
    </MotionWrapper>
  );
};
