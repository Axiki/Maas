import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { differenceInSeconds } from 'date-fns';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, RefreshCcw, TimerReset } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import type {
  KdsLane,
  KdsOrderItem,
  KdsOrderStatus,
  KdsOrderTicket,
  KdsServiceType,
  KdsStationTag,
  KdsTimersConfig,
} from '../../types/kds';

interface KitchenDisplayProps {
  orders: KdsOrderTicket[];
  lanes: KdsLane[];
  timers: KdsTimersConfig;
  stationTags: KdsStationTag[];
}

type StationTagMap = Map<string, KdsStationTag>;

const statusSequence: KdsOrderStatus[] = ['new', 'in-progress', 'ready'];

const serviceTypeLabels: Record<KdsServiceType, string> = {
  'dine-in': 'Dine-In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  curbside: 'Curbside',
};

const statusChipStyles: Record<KdsOrderStatus, string> = {
  new: 'bg-[#EE766D]/20 text-[#24242E] border border-[#EE766D]/40',
  'in-progress': 'bg-[#24242E] text-[#D6D6D6]',
  ready: 'bg-[#D6D6D6] text-[#24242E]',
};

const serviceChipStyles: Record<KdsServiceType, string> = {
  'dine-in': 'bg-[#24242E] text-[#D6D6D6]',
  takeaway: 'bg-[#EE766D] text-[#24242E]',
  delivery: 'bg-[#D6D6D6] text-[#24242E]',
  curbside: 'bg-[#24242E] text-[#EE766D]',
};

const timerTone = (elapsedSeconds: number, timers: KdsTimersConfig) => {
  if (elapsedSeconds >= timers.dangerSeconds) {
    return 'text-danger';
  }

  if (elapsedSeconds >= timers.warningSeconds) {
    return 'text-warning';
  }

  return 'text-success';
};

const formatSeconds = (value: number) => {
  const absolute = Math.max(0, Math.abs(value));
  const minutes = Math.floor(absolute / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(absolute % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const getNextStatus = (status: KdsOrderStatus): KdsOrderStatus | null => {
  const index = statusSequence.indexOf(status);
  if (index === -1 || index === statusSequence.length - 1) {
    return null;
  }

  return statusSequence[index + 1];
};

const getPreviousStatus = (status: KdsOrderStatus): KdsOrderStatus | null => {
  const index = statusSequence.indexOf(status);
  if (index <= 0) {
    return null;
  }

  return statusSequence[index - 1];
};

interface LaneColumnProps {
  lane: KdsLane;
  tickets: KdsOrderTicket[];
  timers: KdsTimersConfig;
  stationTagMap: StationTagMap;
  onBump: (ticketId: string) => void;
  onRecall: (ticketId: string) => void;
}

const LaneColumn: React.FC<LaneColumnProps> = ({
  lane,
  tickets,
  timers,
  stationTagMap,
  onBump,
  onRecall,
}) => {
  const reduceMotion = useReducedMotion();

  const headerAccent = {
    new: 'border-[#EE766D]/40',
    'in-progress': 'border-[#24242E]/30',
    ready: 'border-[#D6D6D6]/80',
  }[lane.status];

  const containerClass = `flex flex-col gap-4 rounded-lg bg-surface-100 border border-line/60 shadow-card p-4 min-h-[28rem] ${
    headerAccent ?? ''
  }`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#24242E] flex items-center gap-2">
            {lane.title}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusChipStyles[lane.status]}`}
            >
              {tickets.length} active
            </span>
          </h3>
          {lane.description && (
            <p className="text-sm text-muted mt-1 leading-snug">{lane.description}</p>
          )}
        </div>
        <div className="text-right text-sm text-muted">
          <p className="font-medium text-[#24242E]">{tickets.length}</p>
          <p>Tickets</p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {tickets.map((ticket) => (
            reduceMotion ? (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                timers={timers}
                stationTagMap={stationTagMap}
                onBump={onBump}
                onRecall={onRecall}
              />
            ) : (
              <MotionWrapper key={ticket.id} type="card" layoutId={ticket.id} className="bg-white">
                <TicketCard
                  ticket={ticket}
                  timers={timers}
                  stationTagMap={stationTagMap}
                  onBump={onBump}
                  onRecall={onRecall}
                />
              </MotionWrapper>
            )
          ))}
        </AnimatePresence>

        {tickets.length === 0 && (
          <div className="rounded-md border border-dashed border-line/70 bg-white/60 p-6 text-center text-sm text-muted">
            No tickets in this lane.
          </div>
        )}
      </div>
    </>
  );

  if (reduceMotion) {
    return <div className={containerClass}>{content}</div>;
  }

  return (
    <MotionWrapper type="card" className={containerClass} layoutId={`lane-${lane.id}`}>
      {content}
    </MotionWrapper>
  );
};

interface TicketCardProps {
  ticket: KdsOrderTicket;
  timers: KdsTimersConfig;
  stationTagMap: StationTagMap;
  onBump: (ticketId: string) => void;
  onRecall: (ticketId: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  timers,
  stationTagMap,
  onBump,
  onRecall,
}) => {
  const elapsedSeconds = Math.max(0, differenceInSeconds(new Date(), new Date(ticket.startedAt)));
  const remaining = ticket.prepSeconds - elapsedSeconds;
  const tone = timerTone(elapsedSeconds, timers);
  const formattedElapsed = formatSeconds(elapsedSeconds);
  const formattedGoal = formatSeconds(ticket.prepSeconds);
  const formattedRemaining = formatSeconds(Math.abs(remaining));

  const showRecall = ticket.status === 'ready';

  return (
    <div className="rounded-lg border border-line/70 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-[#24242E]">#{ticket.orderNumber}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${serviceChipStyles[ticket.serviceType]}`}
            >
              {serviceTypeLabels[ticket.serviceType]}
            </span>
            {ticket.isRush && (
              <span className="text-xs font-semibold uppercase tracking-wide text-[#EE766D]">Rush</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            {ticket.tableNumber && <span>Table {ticket.tableNumber}</span>}
            {ticket.destination && <span>{ticket.destination}</span>}
            {ticket.guestName && <span>Guest: {ticket.guestName}</span>}
          </div>
        </div>

        <div className={`flex items-center gap-2 text-sm font-medium ${tone}`}>
          <Clock size={16} />
          <span>{formattedElapsed}</span>
          <span className="text-muted">/ {formattedGoal}</span>
        </div>
      </div>

      {ticket.notes && (
        <p className="mt-3 rounded-md bg-[#EE766D]/10 px-3 py-2 text-sm text-[#24242E]">
          <TimerReset size={14} className="mr-2 inline text-[#EE766D]" />
          {ticket.notes}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {ticket.stationTags.map((tagId) => {
          const tag = stationTagMap.get(tagId);
          if (!tag) {
            return null;
          }

          return (
            <span
              key={`${ticket.id}-${tagId}`}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: tag.background,
                color: tag.foreground,
              }}
            >
              {tag.label}
            </span>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {ticket.items.map((item) => (
          <ItemRow key={item.id} item={item} stationTagMap={stationTagMap} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted">
          <ArrowRight size={16} className="text-[#EE766D]" />
          <span className={remaining < 0 ? 'text-danger font-medium' : 'text-muted'}>
            {remaining < 0 ? `Over by ${formattedRemaining}` : `Time left ${formattedRemaining}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onBump(ticket.id)}
            className="flex items-center gap-2 rounded-md bg-[#EE766D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d85f58] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24242E]"
          >
            Bump
            <ArrowRight size={16} />
          </button>
          {showRecall && (
            <button
              type="button"
              onClick={() => onRecall(ticket.id)}
              className="flex items-center gap-2 rounded-md border border-[#EE766D] px-4 py-2 text-sm font-medium text-[#EE766D] transition-colors hover:bg-[#EE766D]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24242E]"
            >
              <RefreshCcw size={16} />
              Recall
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ItemRowProps {
  item: KdsOrderItem;
  stationTagMap: StationTagMap;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, stationTagMap }) => {
  const tag = item.stationTag ? stationTagMap.get(item.stationTag) : undefined;
  return (
    <div className="rounded-md border border-line/50 bg-surface-200/40 p-3 text-sm text-[#24242E]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {item.quantity}× {item.name}
          </p>
          {item.modifiers && item.modifiers.length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted">
              {item.modifiers.map((modifier) => (
                <li key={modifier}>{modifier}</li>
              ))}
            </ul>
          )}
          {item.notes && <p className="mt-2 text-xs text-muted">{item.notes}</p>}
        </div>
        {tag && (
          <span
            className="rounded-full px-2 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: tag.background,
              color: tag.foreground,
            }}
          >
            {tag.label}
          </span>
        )}
      </div>
    </div>
  );
};

export const KDS: React.FC<KitchenDisplayProps> = ({ orders, lanes, timers, stationTags }) => {
  const [tickets, setTickets] = useState<KdsOrderTicket[]>(orders);

  useEffect(() => {
    setTickets(orders);
  }, [orders]);

  const stationTagMap = useMemo<StationTagMap>(() => {
    return new Map(stationTags.map((tag) => [tag.id, tag]));
  }, [stationTags]);

  const ticketsByStatus = useMemo(() => {
    const groups: Record<KdsOrderStatus, KdsOrderTicket[]> = {
      new: [],
      'in-progress': [],
      ready: [],
    };

    tickets.forEach((ticket) => {
      groups[ticket.status]?.push(ticket);
    });

    return groups;
  }, [tickets]);

  const countsByStatus = useMemo(() => {
    const counts: Record<KdsOrderStatus, number> = {
      new: 0,
      'in-progress': 0,
      ready: 0,
    };

    tickets.forEach((ticket) => {
      counts[ticket.status] += 1;
    });

    return counts;
  }, [tickets]);

  const rushCount = useMemo(() => tickets.filter((ticket) => ticket.isRush).length, [tickets]);

  const longestWaitingTicket = useMemo(() => {
    if (tickets.length === 0) {
      return null;
    }

    return tickets.reduce((longest, current) => {
      if (!longest) {
        return current;
      }

      const longestElapsed = differenceInSeconds(new Date(), new Date(longest.startedAt));
      const currentElapsed = differenceInSeconds(new Date(), new Date(current.startedAt));

      return currentElapsed > longestElapsed ? current : longest;
    });
  }, [tickets]);

  const longestWaitSeconds = longestWaitingTicket
    ? Math.max(0, differenceInSeconds(new Date(), new Date(longestWaitingTicket.startedAt)))
    : 0;

  const handleBump = useCallback((ticketId: string) => {
    setTickets((prev) => {
      const updated: KdsOrderTicket[] = [];

      prev.forEach((ticket) => {
        if (ticket.id !== ticketId) {
          updated.push(ticket);
          return;
        }

        const nextStatus = getNextStatus(ticket.status);
        if (!nextStatus) {
          return;
        }

        updated.push({
          ...ticket,
          status: nextStatus,
          bumpedAt: nextStatus === 'ready' ? new Date().toISOString() : ticket.bumpedAt,
        });
      });

      return updated;
    });
  }, []);

  const handleRecall = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        const previous = getPreviousStatus(ticket.status);
        if (!previous) {
          return ticket;
        }

        return {
          ...ticket,
          status: previous,
          bumpedAt: previous === 'ready' ? ticket.bumpedAt : undefined,
        };
      }),
    );
  }, []);

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-line/60 bg-surface-100 p-6 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#24242E]">Kitchen Display</h1>
            <p className="text-sm text-muted">Monitor the entire line at a glance and keep orders moving.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {lanes.map((lane) => (
              <div
                key={lane.id}
                className="flex min-w-[120px] flex-col rounded-lg border border-line/50 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-muted">{lane.title}</span>
                <span className="text-2xl font-semibold text-[#24242E]">
                  {countsByStatus[lane.status] ?? 0}
                </span>
              </div>
            ))}
            <div className="flex min-w-[120px] flex-col rounded-lg border border-[#EE766D]/40 bg-[#EE766D]/10 px-4 py-3 text-sm shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-[#24242E]">Rush</span>
              <span className="text-2xl font-semibold text-[#EE766D]">{rushCount}</span>
            </div>
            <div className="flex min-w-[140px] flex-col rounded-lg border border-line/50 bg-white px-4 py-3 text-sm shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">Longest Wait</span>
              <span className="flex items-center gap-2 text-2xl font-semibold text-[#24242E]">
                <Clock size={18} className="text-[#EE766D]" />
                {formatSeconds(longestWaitSeconds)}
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {lanes.map((lane) => (
            <LaneColumn
              key={lane.id}
              lane={lane}
              tickets={ticketsByStatus[lane.status] ?? []}
              timers={timers}
              stationTagMap={stationTagMap}
              onBump={handleBump}
              onRecall={handleRecall}
            />
          ))}
        </div>
      </div>
    </MotionWrapper>
  );
};
