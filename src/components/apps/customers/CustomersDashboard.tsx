import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Gift,
  Search,
  Sparkles,
  UserRound,
  Users,
  Wallet2,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Card } from '@mas/ui';

import { MotionWrapper } from '../../ui/MotionWrapper';
import {
  CustomerLoyaltySummary,
  CustomerProfileSummary,
  CustomerStoreCreditSummary,
  GiftCardSummary,
  mockCustomers,
  useCustomerById,
  useCustomerProfiles,
  useGiftCardDetails,
  useGiftCardSummaries,
  useLoyaltyAccounts,
  useStoreCreditAccounts,
  useVisitHistory,
} from '../../../data/mockCustomers';

type ActiveTab = 'profiles' | 'loyalty' | 'credit' | 'giftCards';

type DrawerState =
  | { type: 'profiles'; customerId: string }
  | { type: 'loyalty'; customerId: string }
  | { type: 'credit'; customerId: string }
  | { type: 'gift'; customerId: string; giftCode: string };

const ACCENT = '#EE766D';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'MMM d, yyyy');
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'MMM d, yyyy • h:mm a');
};

const formatRelative = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return formatDistanceToNow(date, { addSuffix: true });
};

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    type="button"
    aria-pressed={isActive}
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
      isActive
        ? 'border-transparent bg-[#EE766D] text-white shadow-sm'
        : 'border-[#D6D6D6] text-[#24242E] hover:border-transparent hover:bg-[#EE766D]/10'
    }`}
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
  </button>
);

const StatusPill: React.FC<{ label: string; tone?: 'neutral' | 'success' | 'danger' | 'accent' } & React.HTMLAttributes<HTMLSpanElement>> = ({
  label,
  tone = 'neutral',
  className = '',
  ...props
}) => {
  const toneStyles: Record<typeof tone, string> = {
    neutral: 'bg-[#D6D6D6]/60 text-[#24242E]',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    accent: 'bg-[#EE766D]/15 text-[#EE766D]',
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneStyles[tone]} ${className}`.trim()}
      {...props}
    >
      {label}
    </span>
  );
};

const metricCards = [
  { key: 'customers', label: 'Total Customers', icon: <Users size={18} />, accent: ACCENT },
  { key: 'loyalty', label: 'Loyalty Points', icon: <Sparkles size={18} />, accent: '#FFB347' },
  { key: 'credit', label: 'Store Credit', icon: <Wallet2 size={18} />, accent: '#7AC4A8' },
  { key: 'giftcards', label: 'Gift Card Balance', icon: <Gift size={18} />, accent: '#9A9AD6' },
] as const;

export const CustomersDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [drawer, setDrawer] = useState<DrawerState | null>(null);

  const profileSummaries = useCustomerProfiles(searchTerm);
  const loyaltySummaries = useLoyaltyAccounts(searchTerm);
  const creditSummaries = useStoreCreditAccounts(searchTerm);
  const giftCardSummaries = useGiftCardSummaries(searchTerm);

  const selectedCustomer = useCustomerById(drawer ? drawer.customerId : null);
  const visitHistory = useVisitHistory(drawer ? drawer.customerId : null);
  const giftCardDetails = useGiftCardDetails(drawer?.type === 'gift' ? drawer.giftCode : null);

  const totals = useMemo(() => {
    const totalCustomers = mockCustomers.length;
    const totalLoyaltyPoints = mockCustomers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0);
    const totalCredit = mockCustomers.reduce(
      (sum, customer) => sum + customer.storeCredits.reduce((creditSum, credit) => creditSum + credit.balance, 0),
      0,
    );
    const totalGiftBalance = mockCustomers.reduce(
      (sum, customer) => sum + customer.giftCards.reduce((cardSum, card) => cardSum + card.balance, 0),
      0,
    );
    const visitsLast30 = mockCustomers
      .flatMap((customer) => customer.visits)
      .filter((visit) => {
        const date = new Date(visit.date);
        if (Number.isNaN(date.getTime())) return false;
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        return diff <= thirtyDays;
      }).length;

    return {
      totalCustomers,
      totalLoyaltyPoints,
      totalCredit,
      totalGiftBalance,
      visitsLast30,
    };
  }, []);

  const openDrawer = (state: DrawerState) => setDrawer(state);
  const closeDrawer = () => setDrawer(null);

  const renderProfiles = (rows: CustomerProfileSummary[]) => (
    <Card className="border border-[#D6D6D6]/70 bg-surface-100 shadow-sm">
      {rows.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-muted">
          <UserRound size={28} className="text-[#EE766D]" />
          <p>No customer profiles match that search yet.</p>
          <p className="text-xs text-muted">Try searching by name, email, phone, or tag.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#D6D6D6] text-xs uppercase tracking-wide text-[#24242E]/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Visits</th>
                <th className="px-4 py-3 font-semibold">Last Visit</th>
                <th className="px-4 py-3 font-semibold">Loyalty</th>
                <th className="px-4 py-3 font-semibold">Lifetime Spend</th>
                <th className="px-4 py-3" aria-label="Inspect" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6]/60">
              {rows.map((profile) => (
                <tr
                  key={profile.id}
                  className="transition-colors hover:bg-[#EE766D]/10 focus-within:bg-[#EE766D]/15"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#24242E]">{profile.name}</div>
                    <div className="text-xs text-muted">
                      {profile.email || 'No email on file'}
                      {profile.phone && <span className="ml-2">• {profile.phone}</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.tags.map((tag) => (
                        <StatusPill key={tag} label={tag} tone="neutral" />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#24242E]">{profile.totalVisits}</div>
                    <div className="text-xs text-muted">avg spend {currencyFormatter.format(profile.averageSpend)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#24242E]">{formatDate(profile.lastVisit)}</div>
                    {formatRelative(profile.lastVisit) && (
                      <div className="text-xs text-muted">{formatRelative(profile.lastVisit)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#24242E]">{profile.loyaltyPoints} pts</div>
                    <StatusPill label={profile.loyaltyTier} tone="accent" />
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#24242E]">
                    {currencyFormatter.format(profile.lifetimeSpend)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDrawer({ type: 'profiles', customerId: profile.id })}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#EE766D] transition hover:text-[#D3544C]"
                    >
                      Inspect
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const renderLoyalty = (rows: CustomerLoyaltySummary[]) => (
    <Card className="border border-[#D6D6D6]/70 bg-surface-100 shadow-sm">
      {rows.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted">
          <Sparkles size={28} className="text-[#EE766D]" />
          <p>No loyalty accounts found for that filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#D6D6D6] text-xs uppercase tracking-wide text-[#24242E]/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold">Points</th>
                <th className="px-4 py-3 font-semibold">Next Reward</th>
                <th className="px-4 py-3 font-semibold">Next Expiration</th>
                <th className="px-4 py-3" aria-label="Inspect" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6]/60">
              {rows.map((account) => (
                <tr key={account.customerId} className="transition-colors hover:bg-[#EE766D]/10">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#24242E]">{account.name}</div>
                    {account.lastEarnedOn && (
                      <div className="text-xs text-muted">Earned {formatRelative(account.lastEarnedOn)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill label={account.tier} tone="accent" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#24242E]">{account.points} pts</div>
                    <div className="text-xs text-muted">Lifetime {account.lifetimePoints.toLocaleString()} pts</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#24242E]">
                    {account.pointsToNextReward} pts
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#24242E]">
                      {account.nextExpiration ? formatDate(account.nextExpiration) : '—'}
                    </div>
                    {account.expiringPoints && (
                      <div className="text-xs text-muted">{account.expiringPoints} pts at risk</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDrawer({ type: 'loyalty', customerId: account.customerId })}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#EE766D] transition hover:text-[#D3544C]"
                    >
                      View history
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const renderCredit = (rows: CustomerStoreCreditSummary[]) => (
    <Card className="border border-[#D6D6D6]/70 bg-surface-100 shadow-sm">
      {rows.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted">
          <Wallet2 size={28} className="text-[#EE766D]" />
          <p>No store credit balances in this filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#D6D6D6] text-xs uppercase tracking-wide text-[#24242E]/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Available Credit</th>
                <th className="px-4 py-3 font-semibold">Accounts</th>
                <th className="px-4 py-3 font-semibold">Next Expiration</th>
                <th className="px-4 py-3" aria-label="Inspect" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6]/60">
              {rows.map((account) => (
                <tr key={account.customerId} className="transition-colors hover:bg-[#EE766D]/10">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#24242E]">{account.name}</div>
                    {account.lastUsedOn && (
                      <div className="text-xs text-muted">Last used {formatRelative(account.lastUsedOn)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#24242E]">
                    {currencyFormatter.format(account.totalBalance)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill label={`${account.accountCount} ledger${account.accountCount === 1 ? '' : 's'}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#24242E]">
                      {account.nextExpirationDate ? formatDate(account.nextExpirationDate) : '—'}
                    </div>
                    {account.nextExpirationAmount !== undefined && (
                      <div className="text-xs text-muted">
                        {currencyFormatter.format(account.nextExpirationAmount)} at risk
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDrawer({ type: 'credit', customerId: account.customerId })}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#EE766D] transition hover:text-[#D3544C]"
                    >
                      Ledger
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const renderGiftCards = (rows: GiftCardSummary[]) => (
    <Card className="border border-[#D6D6D6]/70 bg-surface-100 shadow-sm">
      {rows.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted">
          <Gift size={28} className="text-[#EE766D]" />
          <p>No gift cards found for that search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#D6D6D6] text-xs uppercase tracking-wide text-[#24242E]/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Card</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Expires</th>
                <th className="px-4 py-3" aria-label="Inspect" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6]/60">
              {rows.map((card) => (
                <tr key={card.code} className="transition-colors hover:bg-[#EE766D]/10">
                  <td className="px-4 py-3 font-semibold text-[#24242E]">{card.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#24242E]">{card.customerName}</div>
                    {card.lastUsedOn && (
                      <div className="text-xs text-muted">Used {formatRelative(card.lastUsedOn)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#24242E]">
                    {currencyFormatter.format(card.balance)}
                    <div className="text-xs text-muted">
                      of {currencyFormatter.format(card.originalValue)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={card.status === 'active' ? 'Active' : card.status === 'redeemed' ? 'Redeemed' : 'Void'}
                      tone={
                        card.status === 'active'
                          ? 'accent'
                          : card.status === 'redeemed'
                          ? 'neutral'
                          : 'danger'
                      }
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-[#24242E]">
                    {card.expiresOn ? formatDate(card.expiresOn) : 'No expiry'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDrawer({ type: 'gift', customerId: card.customerId, giftCode: card.code })}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#EE766D] transition hover:text-[#D3544C]"
                    >
                      Details
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const renderDrawerContent = () => {
    if (!drawer || !selectedCustomer) return null;

    if (drawer.type === 'profiles') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#24242E]">Customer Profile</h3>
            <p className="text-sm text-muted">{selectedCustomer.notes || 'No notes on file.'}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="rounded-xl border border-[#D6D6D6]/80 bg-white p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Contact</h4>
              <p className="font-medium text-[#24242E]">{selectedCustomer.name}</p>
              <p className="text-muted">{selectedCustomer.email || 'No email provided'}</p>
              <p className="text-muted">{selectedCustomer.phone || 'No phone provided'}</p>
              {selectedCustomer.birthday && (
                <p className="mt-2 text-muted">Birthday • {formatDate(selectedCustomer.birthday)}</p>
              )}
            </div>

            <div className="rounded-xl border border-[#D6D6D6]/80 bg-white p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Loyalty Snapshot</h4>
              <p className="text-2xl font-semibold text-[#24242E]">{selectedCustomer.loyaltyPoints} pts</p>
              <p className="text-sm text-muted">
                Tier {selectedCustomer.loyalty.tier} • {selectedCustomer.loyalty.pointsToNextReward} pts to next reward
              </p>
              {selectedCustomer.loyalty.expiring && selectedCustomer.loyalty.expiring.length > 0 && (
                <p className="mt-2 text-xs text-[#EE766D]">
                  {selectedCustomer.loyalty.expiring[0].points} pts expire {formatRelative(selectedCustomer.loyalty.expiring[0].expiresOn)}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#24242E]">Recent Visits</h4>
            <ul className="space-y-3 text-sm">
              {visitHistory.slice(0, 6).map((visit) => (
                <li
                  key={visit.orderId}
                  className="rounded-xl border border-[#D6D6D6]/70 bg-surface-100 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#24242E]">
                        {formatDateTime(visit.date)} • {visit.channel.replace('-', ' ')}
                      </p>
                      <p className="text-xs text-muted">Order {visit.orderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#24242E]">{currencyFormatter.format(visit.totalSpend)}</p>
                      <p className="text-xs text-muted">{visit.pointsEarned} pts earned</p>
                    </div>
                  </div>
                </li>
              ))}
              {visitHistory.length === 0 && <li className="text-sm text-muted">No visits recorded yet.</li>}
            </ul>
          </div>
        </div>
      );
    }

    if (drawer.type === 'loyalty') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#24242E]">Loyalty History</h3>
            <p className="text-sm text-muted">Track accruals, redemptions, and adjustments.</p>
          </div>

          <div className="rounded-xl border border-[#D6D6D6]/80 bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Current balance</p>
                <p className="text-2xl font-semibold text-[#24242E]">{selectedCustomer.loyaltyPoints} pts</p>
              </div>
              <StatusPill label={selectedCustomer.loyalty.tier} tone="accent" />
            </div>
            <p className="mt-3 text-sm text-muted">
              {selectedCustomer.loyalty.pointsToNextReward} pts to next reward • Lifetime {selectedCustomer.loyalty.lifetimePoints.toLocaleString()} pts
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#24242E]">Expiring Balances</h4>
            <div className="space-y-2 text-sm">
              {selectedCustomer.loyalty.expiring?.length ? (
                selectedCustomer.loyalty.expiring.map((entry) => (
                  <div
                    key={`${entry.points}-${entry.expiresOn}`}
                    className="flex items-center justify-between rounded-xl border border-[#D6D6D6]/80 bg-surface-100 px-4 py-3"
                  >
                    <span className="font-medium text-[#24242E]">{entry.points} pts</span>
                    <span className="text-sm text-muted">{formatDate(entry.expiresOn)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No expirations scheduled.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#24242E]">Ledger</h4>
            <ul className="space-y-3 text-sm">
              {selectedCustomer.loyalty.history.slice().reverse().map((entry) => (
                <li key={entry.id} className="rounded-xl border border-[#D6D6D6]/70 bg-surface-100 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#24242E]">{formatDateTime(entry.date)}</p>
                      <p className="text-xs text-muted">{entry.reference || 'Manual entry'}</p>
                      {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${entry.points >= 0 ? 'text-success' : 'text-danger'}`}>
                        {entry.points >= 0 ? '+' : ''}
                        {entry.points} pts
                      </p>
                      <p className="text-xs text-muted">Balance {entry.balanceAfter} pts</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (drawer.type === 'credit') {
      return (
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="text-lg font-semibold text-[#24242E]">Store Credit Accounts</h3>
            <p className="text-sm text-muted">Track issued balances, expirations, and usage.</p>
          </div>

          {selectedCustomer.storeCredits.length === 0 ? (
            <p className="text-sm text-muted">No store credit accounts for this customer.</p>
          ) : (
            selectedCustomer.storeCredits.map((credit) => (
              <div key={credit.id} className="rounded-xl border border-[#D6D6D6]/70 bg-surface-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Balance</p>
                    <p className="text-xl font-semibold text-[#24242E]">{currencyFormatter.format(credit.balance)}</p>
                    <p className="text-xs text-muted">Issued {formatDate(credit.issuedOn)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Expires</p>
                    <p className="text-sm font-medium text-[#24242E]">
                      {credit.expiresOn ? formatDate(credit.expiresOn) : 'No expiry'}
                    </p>
                    {credit.expiresOn && <p className="text-xs text-muted">{formatRelative(credit.expiresOn)}</p>}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Ledger</h5>
                  {credit.ledger.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between rounded-lg border border-[#D6D6D6]/60 bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#24242E]">{formatDateTime(entry.date)}</p>
                        <p className="text-xs text-muted">{entry.reference || 'Adjustment'}</p>
                        {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${entry.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                          {entry.amount >= 0 ? '+' : ''}
                          {currencyFormatter.format(entry.amount)}
                        </p>
                        <p className="text-xs text-muted">Balance {currencyFormatter.format(entry.balanceAfter)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    if (drawer.type === 'gift' && giftCardDetails) {
      const { card, customer } = giftCardDetails;
      return (
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="text-lg font-semibold text-[#24242E]">Gift Card Details</h3>
            <p className="text-sm text-muted">{card.code} • Issued to {customer.name}</p>
          </div>

          <div className="rounded-xl border border-[#D6D6D6]/70 bg-surface-100 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Balance</p>
                <p className="text-xl font-semibold text-[#24242E]">{currencyFormatter.format(card.balance)}</p>
                <p className="text-xs text-muted">Original {currencyFormatter.format(card.originalValue)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">Status</p>
                <StatusPill
                  label={card.status === 'active' ? 'Active' : card.status === 'redeemed' ? 'Redeemed' : 'Void'}
                  tone={card.status === 'active' ? 'accent' : card.status === 'redeemed' ? 'neutral' : 'danger'}
                />
                <p className="mt-2 text-xs text-muted">
                  {card.expiresOn ? `Expires ${formatDate(card.expiresOn)}` : 'No expiration'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#24242E]">Transactions</h4>
            <ul className="space-y-3">
              {card.transactions.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-[#D6D6D6]/60 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#24242E]">{formatDateTime(entry.date)}</p>
                      <p className="text-xs text-muted">{entry.reference || 'Adjustment'}</p>
                      {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${entry.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                        {entry.amount >= 0 ? '+' : ''}
                        {currencyFormatter.format(entry.amount)}
                      </p>
                      <p className="text-xs text-muted">Balance {currencyFormatter.format(entry.balanceAfter)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  const activeContent = {
    profiles: renderProfiles(profileSummaries),
    loyalty: renderLoyalty(loyaltySummaries),
    credit: renderCredit(creditSummaries),
    giftCards: renderGiftCards(giftCardSummaries),
  }[activeTab];

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#24242E]">Customer Relationship Hub</h1>
            <p className="mt-1 text-sm text-muted">
              Understand guests, monitor loyalty health, and manage balances from a single view.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#24242E]/50" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-full border border-[#D6D6D6] bg-white py-2 pl-10 pr-4 text-sm text-[#24242E] shadow-sm transition focus:border-[#EE766D] focus:ring-2 focus:ring-[#EE766D]/40"
              placeholder="Search by name, tag, or card code"
              type="search"
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => {
            const value = {
              customers: totals.totalCustomers,
              loyalty: totals.totalLoyaltyPoints,
              credit: totals.totalCredit,
              giftcards: totals.totalGiftBalance,
            }[metric.key as 'customers' | 'loyalty' | 'credit' | 'giftcards'];

            const formattedValue =
              metric.key === 'loyalty'
                ? value.toLocaleString()
                : metric.key === 'customers'
                ? value.toLocaleString()
                : currencyFormatter.format(value);

            return (
              <Card
                key={metric.key}
                className="paper-card flex flex-col gap-2 border border-[#D6D6D6]/80 bg-white p-5 shadow-sm"
                style={{ borderTopColor: metric.accent, borderTopWidth: '4px' }}
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#24242E]/70">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: metric.accent }}
                  >
                    {metric.icon}
                  </span>
                  {metric.label}
                </span>
                <span className="text-2xl font-semibold text-[#24242E]">{formattedValue}</span>
                {metric.key === 'customers' && (
                  <span className="text-xs text-muted">{totals.visitsLast30} visits in the past 30 days</span>
                )}
              </Card>
            );
          })}
        </section>

        <nav className="flex flex-wrap gap-2">
          <TabButton
            label="Profiles"
            icon={<UserRound size={16} />}
            isActive={activeTab === 'profiles'}
            onClick={() => setActiveTab('profiles')}
          />
          <TabButton
            label="Loyalty"
            icon={<Sparkles size={16} />}
            isActive={activeTab === 'loyalty'}
            onClick={() => setActiveTab('loyalty')}
          />
          <TabButton
            label="Store Credit"
            icon={<Wallet2 size={16} />}
            isActive={activeTab === 'credit'}
            onClick={() => setActiveTab('credit')}
          />
          <TabButton
            label="Gift Cards"
            icon={<Gift size={16} />}
            isActive={activeTab === 'giftCards'}
            onClick={() => setActiveTab('giftCards')}
          />
        </nav>

        <section>{activeContent}</section>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-[#D6D6D6] bg-surface-100 p-6 shadow-lg"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#24242E]">
                    {drawer.type === 'profiles' && 'Profile details'}
                    {drawer.type === 'loyalty' && 'Loyalty ledger'}
                    {drawer.type === 'credit' && 'Store credit ledger'}
                    {drawer.type === 'gift' && 'Gift card ledger'}
                  </h2>
                  <p className="text-sm text-muted">{selectedCustomer?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full border border-[#D6D6D6] p-2 text-[#24242E] transition hover:bg-[#EE766D] hover:text-white"
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>
              {renderDrawerContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </MotionWrapper>
  );
};

export default CustomersDashboard;
