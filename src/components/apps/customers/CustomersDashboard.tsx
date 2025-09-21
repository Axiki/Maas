import React, { useCallback, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  CirclePlus,
  Clock,
  Gift,
  History,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
  UserRound,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';

import { MotionWrapper } from '../../ui/MotionWrapper';
import {
  CustomerGiftCard,
  CustomerProfile,
  CustomerTransaction,
  mockCustomerProfiles
} from '../../../data/mockCustomers';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

type TabKey = 'profiles' | 'loyalty' | 'store-credit' | 'gift-cards';

const tabs: Array<{ id: TabKey; label: string; description: string }> = [
  { id: 'profiles', label: 'Profiles', description: 'Contact & visits' },
  { id: 'loyalty', label: 'Loyalty', description: 'Points & rewards' },
  { id: 'store-credit', label: 'Store Credit', description: 'Balances & adjustments' },
  { id: 'gift-cards', label: 'Gift Cards', description: 'Issued cards' }
];

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatDate = (value: string) => format(new Date(value), 'MMM d, yyyy');
const formatPoints = (value: number) => `${value >= 0 ? '+' : ''}${value}`;

const getStatusBadgeStyles = (status: CustomerGiftCard['status']) => {
  switch (status) {
    case 'active':
      return 'bg-primary-100 text-primary-600';
    case 'redeemed':
      return 'bg-surface-200 text-muted';
    case 'expired':
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-surface-200 text-muted';
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomerSelector = (
  initialCustomerId?: string,
  initialTab: TabKey = 'profiles'
) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => {
    if (initialCustomerId) {
      return initialCustomerId;
    }
    return mockCustomerProfiles[0]?.id ?? null;
  });

  const customers = mockCustomerProfiles;

  const selectCustomerById = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId);
  }, []);

  const selectedCustomer = useMemo<CustomerProfile | null>(() => {
    return customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  }, [customers, selectedCustomerId]);

  const getCustomerById = useCallback(
    (customerId: string) => customers.find((customer) => customer.id === customerId) ?? null,
    [customers]
  );

  return {
    customers,
    activeTab,
    setActiveTab,
    selectedCustomer,
    selectedCustomerId,
    selectCustomerById,
    getCustomerById
  };
};

export const CustomersDashboard: React.FC = () => {
  const {
    customers,
    activeTab,
    setActiveTab,
    selectedCustomer,
    selectedCustomerId,
    selectCustomerById
  } = useCustomerSelector();

  return (
    <MotionWrapper type="page">
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Customer intelligence</p>
            <h1 className="text-3xl font-bold text-ink">Engage loyal guests</h1>
            <p className="max-w-3xl text-sm text-muted">
              View loyalty, store credit, and issued gift cards in one place. Quickly act on balances so
              your POS team can resolve questions at the table without leaving the flow.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-2xl border border-line bg-surface-100 shadow-card">
              <div className="border-b border-line/70 p-5">
                <h2 className="text-lg font-semibold text-ink">Guest profiles</h2>
                <p className="text-sm text-muted">Select a customer to inspect transactions and rewards.</p>
              </div>
              <div className="max-h-[480px] overflow-y-auto">
                <ul className="divide-y divide-line/70">
                  {customers.map((customer) => {
                    const isActive = selectedCustomerId === customer.id;
                    const initials = customer.name
                      .split(' ')
                      .map((segment) => segment[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <li key={customer.id}>
                        <button
                          type="button"
                          onClick={() => selectCustomerById(customer.id)}
                          className={`flex w-full items-center gap-4 px-5 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                            isActive
                              ? 'bg-primary-500/10 text-ink'
                              : 'hover:bg-surface-200'
                          }`}
                          aria-pressed={isActive}
                        >
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl font-semibold ${
                              isActive
                                ? 'bg-primary-500 text-white shadow-card'
                                : 'bg-surface-200 text-ink'
                            }`}
                            aria-hidden
                          >
                            {initials}
                          </div>
                          <div className="flex flex-1 flex-col gap-1">
                            <span className="text-sm font-semibold text-ink">{customer.name}</span>
                            <span className="text-xs text-muted">
                              {customer.loyalty.tier}
                              <span aria-hidden className="mx-1">•</span>
                              {customer.loyalty.balance.toLocaleString()} pts
                            </span>
                          </div>
                          <ArrowUpRight size={16} className="text-muted" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            <section className="rounded-2xl border border-line bg-surface-100 shadow-card">
              {selectedCustomer ? (
                <div className="flex h-full flex-col">
                  <div className="border-b border-line/70 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-lg font-semibold text-white shadow-card">
                          {selectedCustomer.name
                            .split(' ')
                            .map((segment) => segment[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold text-ink">{selectedCustomer.name}</h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-600">
                              <Award size={14} aria-hidden />
                              {selectedCustomer.tier}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                            <span className="inline-flex items-center gap-1"><Phone size={14} aria-hidden />{selectedCustomer.phone}</span>
                            <span className="inline-flex items-center gap-1"><Mail size={14} aria-hidden />{selectedCustomer.email}</span>
                            <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden />Last visit {formatDate(selectedCustomer.lastVisit)}</span>
                          </div>
                          {selectedCustomer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {selectedCustomer.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full bg-surface-200 px-2.5 py-1 text-xs font-medium text-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-3 sm:text-left">
                        <div className="rounded-xl border border-line bg-surface-200/70 p-3 text-left">
                          <p className="text-xs text-muted">Lifetime spend</p>
                          <p className="mt-1 text-lg font-semibold text-ink">{formatCurrency(selectedCustomer.totalSpend)}</p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface-200/70 p-3 text-left">
                          <p className="text-xs text-muted">Visits</p>
                          <p className="mt-1 text-lg font-semibold text-ink">{selectedCustomer.visits}</p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface-200/70 p-3 text-left sm:col-span-1">
                          <p className="text-xs text-muted">Current credit</p>
                          <p className="mt-1 text-lg font-semibold text-ink">{formatCurrency(selectedCustomer.storeCredit.balance)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Customer details">
                      {tabs.map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`${tab.id}-panel`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-xl border px-4 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                              isActive
                                ? 'border-primary-500 bg-primary-500 text-white shadow-card'
                                : 'border-line bg-surface-200 text-muted hover:text-ink'
                            }`}
                          >
                            <span className="block text-sm font-semibold">{tab.label}</span>
                            <span className={`text-xs ${isActive ? 'text-white/80' : 'text-muted'}`}>
                              {tab.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6" role="tabpanel" id={`${activeTab}-panel`}>
                    {activeTab === 'profiles' && selectedCustomer && (
                      <ProfilesPanel transactions={selectedCustomer.transactions} />
                    )}
                    {activeTab === 'loyalty' && selectedCustomer && (
                      <LoyaltyPanel customer={selectedCustomer} />
                    )}
                    {activeTab === 'store-credit' && selectedCustomer && (
                      <StoreCreditPanel customer={selectedCustomer} />
                    )}
                    {activeTab === 'gift-cards' && selectedCustomer && (
                      <GiftCardsPanel customer={selectedCustomer} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-12 text-muted">
                  <p className="text-sm">Select a customer to view loyalty insights.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
};

type ProfilesPanelProps = {
  transactions: CustomerTransaction[];
};

const ProfilesPanel: React.FC<ProfilesPanelProps> = ({ transactions }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <TrendingUp size={16} aria-hidden />
            <span>Recent spend</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatCurrency(transactions[0]?.amount ?? 0)}
          </p>
          <p className="text-xs text-muted">Most recent ticket value</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <History size={16} aria-hidden />
            <span>Transactions tracked</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{transactions.length}</p>
          <p className="text-xs text-muted">Stored in the MAS timeline</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sparkles size={16} aria-hidden />
            <span>Rewards earned</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatPoints(transactions.reduce((acc, item) => acc + item.pointsEarned, 0))} pts
          </p>
          <p className="text-xs text-muted">Across recorded visits</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-200/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Transaction history</h3>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
            <History size={14} aria-hidden />
            Syncs from POS in real time
          </span>
        </div>
        <div className="divide-y divide-line/70">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-ink">{transaction.note ?? 'Activity recorded'}</p>
                <p className="text-xs text-muted">
                  {formatDate(transaction.createdAt)}
                  <span aria-hidden className="mx-1">•</span>
                  {transaction.channel}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-ink">{formatCurrency(transaction.amount)}</span>
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-600">
                  {formatPoints(transaction.pointsEarned)} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type LoyaltyPanelProps = {
  customer: CustomerProfile;
};

const LoyaltyPanel: React.FC<LoyaltyPanelProps> = ({ customer }) => {
  const { loyalty } = customer;
  const progressLabel = loyalty.pointsToNextTier != null
    ? `${loyalty.pointsToNextTier.toLocaleString()} pts to ${loyalty.nextTier}`
    : 'Top tier achieved';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-primary-200 bg-primary-100/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Points balance</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{loyalty.balance.toLocaleString()} pts</p>
            </div>
            <Sparkles className="text-primary-600" size={24} aria-hidden />
          </div>
          <p className="mt-3 text-xs text-muted">Expires {formatDate(loyalty.expiryDate)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tier progress</p>
          <p className="mt-2 text-lg font-semibold text-ink">{progressLabel}</p>
          <p className="text-xs text-muted">Last earned {formatDate(loyalty.lastEarned)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Current tier</p>
          <p className="mt-2 text-lg font-semibold text-ink">{loyalty.tier}</p>
          <p className="text-xs text-muted">Reward thresholds sync with POS</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-200/60 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Points timeline</h3>
        <div className="mt-4 space-y-4">
          {loyalty.history.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-2 rounded-xl bg-surface-100/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">{entry.reason}</p>
                <p className="text-xs text-muted">{formatDate(entry.createdAt)}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold ${entry.change >= 0 ? 'text-primary-600' : 'text-muted'}`}>
                  {formatPoints(entry.change)} pts
                </span>
                <p className="text-xs text-muted">Balance {entry.balanceAfter.toLocaleString()} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type StoreCreditPanelProps = {
  customer: CustomerProfile;
};

const StoreCreditPanel: React.FC<StoreCreditPanelProps> = ({ customer }) => {
  const { storeCredit } = customer;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Wallet size={16} aria-hidden />
            <span>Current balance</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatCurrency(storeCredit.balance)}</p>
          <p className="text-xs text-muted">Currency {storeCredit.currency}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock size={16} aria-hidden />
            <span>Last updated</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-ink">{formatDate(storeCredit.lastUpdated)}</p>
          <p className="text-xs text-muted">Logged by MAS audit</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-200/70 p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <UserRound size={16} aria-hidden />
            <span>Adjustments</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-ink">{storeCredit.history.length}</p>
          <p className="text-xs text-muted">Tracked for compliance</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => console.log('Adjust credit for', customer.name)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary-500 bg-white/70 px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <CirclePlus size={16} aria-hidden />
          Adjust credit
        </button>
        <button
          type="button"
          onClick={() => console.log('Open credit history for', customer.name)}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <History size={16} aria-hidden />
          View audit trail
        </button>
      </div>

      <div className="rounded-xl border border-line bg-surface-200/60 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Credit history</h3>
        <div className="mt-4 space-y-4">
          {storeCredit.history.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-2 rounded-xl bg-surface-100/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">{entry.reason}</p>
                <p className="text-xs text-muted">{formatDate(entry.createdAt)}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold ${entry.change >= 0 ? 'text-primary-600' : 'text-muted'}`}>
                  {formatPoints(entry.change)}
                </span>
                <p className="text-xs text-muted">By {entry.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type GiftCardsPanelProps = {
  customer: CustomerProfile;
};

const GiftCardsPanel: React.FC<GiftCardsPanelProps> = ({ customer }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">Issued gift cards</h3>
          <p className="text-sm text-muted">Balances sync instantly to the POS tender screen.</p>
        </div>
        <button
          type="button"
          onClick={() => console.log('Issue new gift card for', customer.name)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <Gift size={16} aria-hidden />
          Issue card
        </button>
      </div>

      <div className="space-y-4">
        {customer.giftCards.map((card) => (
          <article
            key={card.id}
            className="rounded-xl border border-line bg-surface-200/70 p-4"
            aria-label={`Gift card ending ${card.cardNumber.slice(-4)}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Card #{card.cardNumber}</p>
                <p className="text-xs text-muted">
                  Issued {formatDate(card.issuedOn)}
                  <span aria-hidden className="mx-1">•</span>
                  Expires {formatDate(card.expiresOn)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-ink">{formatCurrency(card.balance)}</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeStyles(card.status)}`}>
                  {card.status === 'active' && 'Active'}
                  {card.status === 'redeemed' && 'Redeemed'}
                  {card.status === 'expired' && 'Expired'}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
