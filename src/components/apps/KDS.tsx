import React, { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChefHat, Clock, RefreshCcw, Timer } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { PageContainer } from '../layout/PageContainer';
import { mockKdsTickets } from '../../data/mockData';
import type { KdsTicket } from '../../types';

const laneDefinitions: Array<{
  id: 'new' | 'in-progress' | 'done';
  title: string;
  description: string;
  statuses: KdsTicket['status'][];
}> = [
  {
    id: 'new',
    title: 'Fresh Orders',
    description: 'Tickets waiting to be fired',
    statuses: ['new']
  },
  {
    id: 'in-progress',
    title: 'Cooking',
    description: 'Currently being prepared on the line',
    statuses: ['in-progress']
  },
  {
    id: 'done',
    title: 'Ready to Serve',
    description: 'Completed tickets awaiting pickup',
    statuses: ['done']
  }
];

const statusMeta: Record<
  KdsTicket['status'],
  { label: string; badgeClass: string; description: string }
> = {
  new: {
    label: 'New',
    badgeClass: 'bg-primary-500 text-white',
    description: 'Just received from POS'
  },
  'in-progress': {
    label: 'In Progress',
    badgeClass: 'bg-warning text-ink',
    description: 'Actively being prepared'
  },
  done: {
    label: 'Ready',
    badgeClass: 'bg-success text-white',
    description: 'Completed and ready for pickup'
  }
};

const formatStationTag = (stationTag: string) => {
  return stationTag
    .split('-')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const KDS: React.FC = () => {
  const tickets = mockKdsTickets;

  const statusTotals = useMemo(() => {
    return tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] += 1;
        return acc;
      },
      { new: 0, 'in-progress': 0, done: 0 } as Record<KdsTicket['status'], number>
    );
  }, [tickets]);

  const lanes = useMemo(
    () =>
      laneDefinitions.map(lane => ({
        ...lane,
        tickets: tickets.filter(ticket => lane.statuses.includes(ticket.status))
      })),
    [tickets]
  );

  const summaryCards = useMemo(
    () => [
      {
        id: 'total',
        label: 'Active Tickets',
        value: tickets.length,
        helper: 'Across all kitchen stations',
        icon: ChefHat
      },
      {
        id: 'in-progress',
        label: 'Cooking Now',
        value: statusTotals['in-progress'],
        helper: 'Currently on the line',
        icon: Timer
      },
      {
        id: 'done',
        label: 'Ready for Pickup',
        value: statusTotals.done,
        helper: 'Waiting for runners',
        icon: Clock
      }
    ],
    [statusTotals, tickets.length]
  );

  return (
    <MotionWrapper type="page">
      <PageContainer
        title="Kitchen Display System"
        subtitle="Monitor and advance live order tickets with clear kitchen lanes."
        actions={(
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
              aria-label="Refresh kitchen tickets"
            >
              <RefreshCcw size={16} aria-hidden="true" />
              Refresh
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              aria-label="Open kitchen station settings"
            >
              <ChefHat size={16} aria-hidden="true" />
              Manage Stations
            </button>
          </>
        )}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaryCards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-2xl border border-line/70 bg-surface-100 p-4 shadow-card"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{card.value}</p>
                  <p className="mt-1 text-sm text-muted">{card.helper}</p>
                </div>
                <div className="rounded-xl bg-primary-100 p-3 text-primary-600">
                  <Icon size={24} aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {lanes.map(lane => (
            <section
              key={lane.id}
              className="flex h-full flex-col rounded-3xl border border-line/80 bg-surface-100/80 shadow-card"
              aria-label={`${lane.title} lane`}
            >
              <header className="border-b border-line/70 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-ink">{lane.title}</h2>
                    <p className="text-sm text-muted">{lane.description}</p>
                  </div>
                  <span className="rounded-full bg-surface-200 px-3 py-1 text-xs font-semibold text-ink-70">
                    {lane.tickets.length} ticket{lane.tickets.length === 1 ? '' : 's'}
                  </span>
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {lane.tickets.length === 0 ? (
                  <div className="flex h-full min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-line/60 bg-surface-200/50 p-6 text-center text-sm text-muted">
                    <p>No tickets in this lane.</p>
                    <p className="mt-1 text-xs">{statusMeta[lane.statuses[0]].description}</p>
                  </div>
                ) : (
                  lane.tickets.map((ticket, index) => (
                    <MotionWrapper
                      key={ticket.id}
                      type="card"
                      delay={index * 0.05}
                      className="rounded-2xl border border-line/60 bg-surface-200/70 p-4 shadow-card"
                    >
                      <article className="space-y-4">
                        <header className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-ink">
                              Order {ticket.orderId}
                            </h3>
                            <p className="text-xs text-muted">
                              Placed {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusMeta[ticket.status].badgeClass}`}
                            >
                              {statusMeta[ticket.status].label}
                            </span>
                            <span className="rounded-full border border-line/60 bg-surface-100 px-3 py-1 text-xs font-medium text-muted">
                              {formatStationTag(ticket.stationTag)}
                            </span>
                          </div>
                        </header>

                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>ETA {ticket.estimatedTime ? `${ticket.estimatedTime} min` : '—'}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} aria-hidden="true" />
                            {formatDistanceToNow(ticket.createdAt, { addSuffix: false })}
                          </span>
                        </div>

                        <ul className="space-y-3 text-sm" aria-label="Ticket items">
                          {ticket.items.map((item, itemIndex) => (
                            <li
                              key={`${ticket.id}-${item.productName}-${itemIndex}`}
                              className="rounded-xl border border-line/60 bg-surface-100 px-3 py-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-ink">
                                    {item.quantity}× {item.productName}
                                  </p>
                                  {item.variantName && (
                                    <p className="text-xs text-muted">{item.variantName}</p>
                                  )}
                                </div>
                                {item.modifiers.length > 0 && (
                                  <div className="text-right">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                                      Modifiers
                                    </p>
                                    <p className="text-xs text-ink">
                                      {item.modifiers.join(', ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {item.notes && (
                                <p className="mt-2 text-xs font-medium text-warning">Note: {item.notes}</p>
                              )}
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                          <button
                            type="button"
                            className="flex-1 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                            aria-label={`Bump order ${ticket.orderId}`}
                          >
                            {ticket.status === 'done' ? 'Serve' : 'Bump'}
                          </button>
                          <button
                            type="button"
                            className="flex-1 rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
                            aria-label={`Recall order ${ticket.orderId}`}
                          >
                            Recall
                          </button>
                        </div>
                      </article>
                    </MotionWrapper>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </PageContainer>
    </MotionWrapper>
  );
};
