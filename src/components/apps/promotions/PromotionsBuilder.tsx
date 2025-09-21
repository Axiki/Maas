import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Filter, Layers, Plus, Search, Users, CalendarClock, Clock3 } from 'lucide-react';
import { Button, Card } from '@mas/ui';
import { cn } from '@mas/utils';
import {
  PromotionCampaign,
  PromotionChannel,
  PromotionReward,
  PromotionRewardType,
  PromotionStatus,
  PromotionWeekday
} from '../../../types/promotions';
import { mockPromotionCampaigns } from '../../../data/mockPromotions';

const inputClassName =
  'w-full rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500';
const textAreaClassName = `${inputClassName} min-h-[96px]`; // reuse base style

const channelOptions: Array<{ value: PromotionChannel; label: string; description: string }> = [
  { value: 'pos', label: 'POS', description: 'Front of house terminals' },
  { value: 'online', label: 'Online', description: 'Web and mobile ordering' },
  { value: 'kiosk', label: 'Kiosk', description: 'Self-service kiosks' },
  { value: 'delivery', label: 'Delivery', description: 'Third-party delivery partners' }
];

const weekdayOrder: PromotionWeekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const weekdayLabels: Record<PromotionWeekday, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun'
};

const statusStyles: Record<PromotionStatus, string> = {
  active: 'border-primary-200 bg-primary-50 text-primary-600',
  scheduled: 'border-amber-200 bg-amber-50 text-amber-600',
  draft: 'border-line bg-surface-200 text-muted',
  expired: 'border-rose-200 bg-rose-50 text-rose-600'
};

const exclusivityOptions = [
  { value: 'single-use', label: 'Single use per order' },
  { value: 'category-exclusive', label: 'Exclusive by category' },
  { value: 'no-limit', label: 'Stack with anything' }
];

const sortChannels = (channels: PromotionChannel[]) => {
  const order = channelOptions.map((channel) => channel.value);
  return [...channels].sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

const sortWeekdays = (days: PromotionWeekday[]) => {
  return [...days].sort((a, b) => weekdayOrder.indexOf(a) - weekdayOrder.indexOf(b));
};

const createDefaultReward = (type: PromotionRewardType): PromotionReward => {
  switch (type) {
    case 'amount':
      return { type, value: 5, currency: 'USD', appliesTo: 'order' };
    case 'bogo':
      return {
        type,
        buyQuantity: 1,
        getQuantity: 1,
        productIds: [],
        discountType: 'percentage',
        discountValue: 100
      };
    case 'bundle':
      return { type, bundlePrice: 25, productIds: [], minimumItems: 2 };
    default:
      return { type: 'percentage', value: 10, appliesTo: 'order', maxDiscount: 0 };
  }
};

const rewardSummary = (reward: PromotionReward) => {
  switch (reward.type) {
    case 'percentage':
      return `${reward.value}% off ${reward.appliesTo}`;
    case 'amount':
      return `${reward.currency} ${reward.value.toFixed(2)} off ${reward.appliesTo}`;
    case 'bogo':
      return `Buy ${reward.buyQuantity} get ${reward.getQuantity} ${
        reward.discountType === 'percentage' ? `${reward.discountValue}%` : `$${reward.discountValue.toFixed(2)}`
      } off`;
    case 'bundle':
      return `Bundle price $${reward.bundlePrice.toFixed(2)}`;
    default:
      return 'Custom reward';
  }
};

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const parseCommaList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const PromotionsBuilder: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>(mockPromotionCampaigns);
  const [selectedId, setSelectedId] = useState<string>(mockPromotionCampaigns[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const selectedCampaign = useMemo(() => {
    if (!selectedId) {
      return campaigns[0] ?? null;
    }

    return campaigns.find((campaign) => campaign.id === selectedId) ?? campaigns[0] ?? null;
  }, [campaigns, selectedId]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD'
      }),
    []
  );

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return campaigns;
    }

    return campaigns.filter((campaign) =>
      [campaign.name, campaign.description, campaign.tags.join(' ')].some((field) =>
        field.toLowerCase().includes(query)
      )
    );
  }, [campaigns, search]);

  const campaignTransition = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 }, exit: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.28, ease: 'easeOut' }
      };

  const updateCampaignById = (
    campaignId: string,
    updater: (campaign: PromotionCampaign) => PromotionCampaign
  ) => {
    setCampaigns((previous) =>
      previous.map((campaign) => (campaign.id === campaignId ? updater(campaign) : campaign))
    );
  };

  const touchCampaign = (campaign: PromotionCampaign, updates: Partial<PromotionCampaign>) => ({
    ...campaign,
    ...updates,
    updatedAt: new Date().toISOString()
  });

  const handleChannelToggle = (channel: PromotionChannel) => {
    if (!selectedCampaign) return;

    updateCampaignById(selectedCampaign.id, (campaign) => {
      const channels = campaign.eligibility.channels;
      const exists = channels.includes(channel);
      const nextChannels = exists
        ? channels.filter((value) => value !== channel)
        : [...channels, channel];

      return touchCampaign(campaign, {
        eligibility: { ...campaign.eligibility, channels: sortChannels(nextChannels) }
      });
    });
  };

  const handleWeekdayToggle = (day: PromotionWeekday) => {
    if (!selectedCampaign) return;

    updateCampaignById(selectedCampaign.id, (campaign) => {
      const days = campaign.schedule.daysOfWeek;
      const nextDays = days.includes(day)
        ? days.filter((value) => value !== day)
        : [...days, day];

      return touchCampaign(campaign, {
        schedule: { ...campaign.schedule, daysOfWeek: sortWeekdays(nextDays) }
      });
    });
  };

  const handleRewardTypeChange = (type: PromotionRewardType) => {
    if (!selectedCampaign) return;

    updateCampaignById(selectedCampaign.id, (campaign) =>
      touchCampaign(campaign, {
        reward: createDefaultReward(type)
      })
    );
  };

  const handleRewardFieldChange = (changes: Partial<PromotionReward>) => {
    if (!selectedCampaign) return;

    updateCampaignById(selectedCampaign.id, (campaign) =>
      touchCampaign(campaign, {
        reward: { ...campaign.reward, ...changes } as PromotionReward
      })
    );
  };

  const updateEligibility = (changes: Partial<PromotionCampaign['eligibility']>) => {
    if (!selectedCampaign) return;

    updateCampaignById(selectedCampaign.id, (campaign) =>
      touchCampaign(campaign, {
        eligibility: { ...campaign.eligibility, ...changes }
      })
    );
  };

  const updateSchedule = (changes: Partial<PromotionCampaign['schedule']>) => {
    if (!selectedCampaign) return;

    updateCampaignById(selectedCampaign.id, (campaign) =>
      touchCampaign(campaign, {
        schedule: { ...campaign.schedule, ...changes }
      })
    );
  };

  const updateStacking = (changes: Partial<PromotionCampaign['stacking']>) => {
    if (!selectedCampaign) return;

    updateCampaignById(selectedCampaign.id, (campaign) =>
      touchCampaign(campaign, {
        stacking: { ...campaign.stacking, ...changes }
      })
    );
  };

  const selectedReward = selectedCampaign?.reward;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-surface-50">
      <aside className="w-full max-w-xs border-r border-line bg-surface-100/80 backdrop-blur-sm">
        <div className="flex h-full flex-col">
          <div className="border-b border-line p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h1 className="text-lg font-semibold text-ink">Campaigns</h1>
              <Button size="sm" variant="primary" className="whitespace-nowrap" type="button">
                <Plus size={16} />
                New
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search campaigns"
                  className="w-full rounded-lg border border-line bg-surface-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button size="sm" variant="outline" type="button" className="shrink-0">
                <Filter size={16} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredCampaigns.length === 0 && (
              <p className="rounded-lg border border-dashed border-line bg-surface-50 p-4 text-center text-sm text-muted">
                No campaigns match your filters.
              </p>
            )}

            {filteredCampaigns.map((campaign) => {
              const isActive = selectedCampaign?.id === campaign.id;
              const badgeClass = statusStyles[campaign.status];

              return (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => setSelectedId(campaign.id)}
                  className={cn(
                    'w-full rounded-xl border border-line bg-surface-100 p-4 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    isActive && 'border-primary-200 bg-primary-50/80 shadow-card'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-ink">{campaign.name}</h2>
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide',
                        badgeClass
                      )}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{campaign.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} />
                      Updated {formatDateTime(campaign.updatedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} />
                      {campaign.metrics.redemptionCount.toLocaleString()} redemptions
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers size={12} />
                      {rewardSummary(campaign.reward)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {campaign.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line bg-surface-200 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedCampaign ? (
            <motion.div
              key={selectedCampaign.id}
              className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6"
              {...campaignTransition}
            >
              <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <Card className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold text-ink">{selectedCampaign.name}</h2>
                      <p className="text-sm text-muted">{selectedCampaign.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide',
                          statusStyles[selectedCampaign.status]
                        )}
                      >
                        {selectedCampaign.status}
                      </span>
                      <span className="text-xs text-muted">Last edited by {selectedCampaign.lastEditedBy}</span>
                      <span className="text-xs text-muted">{formatDateTime(selectedCampaign.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-line bg-surface-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted">Reward</p>
                      <p className="mt-1 text-sm font-medium text-ink">{rewardSummary(selectedCampaign.reward)}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-surface-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted">Redemptions</p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {selectedCampaign.metrics.redemptionCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-line bg-surface-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted">Revenue impact</p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {currencyFormatter.format(selectedCampaign.metrics.revenueImpact)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-base font-semibold text-ink">Scheduling snapshot</h3>
                  <div className="flex flex-col gap-3 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <CalendarClock size={16} className="text-primary-500" />
                      <span>
                        {selectedCampaign.schedule.startDate} → {selectedCampaign.schedule.endDate ?? 'No end date'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} className="text-primary-500" />
                      <span>
                        {selectedCampaign.schedule.isAllDay
                          ? 'All day'
                          : `${selectedCampaign.schedule.startTime} – ${selectedCampaign.schedule.endTime}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Layers size={16} className="text-primary-500" />
                      <span className="font-medium text-ink">Eligible channels:</span>
                      <span>{selectedCampaign.eligibility.channels.join(', ')}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Reward configuration</h3>
                  <p className="text-sm text-muted">Define how the incentive is applied.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Reward type</span>
                    <select
                      value={selectedReward?.type}
                      onChange={(event) => handleRewardTypeChange(event.target.value as PromotionRewardType)}
                      className={inputClassName}
                    >
                      <option value="percentage">Percentage discount</option>
                      <option value="amount">Fixed amount</option>
                      <option value="bogo">Buy X get Y</option>
                      <option value="bundle">Bundle price</option>
                    </select>
                  </label>

                  {selectedReward?.type === 'percentage' && (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink">Discount (%)</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedReward.value}
                        onChange={(event) =>
                          handleRewardFieldChange({ value: Number(event.target.value) || 0 })
                        }
                        className={inputClassName}
                      />
                    </label>
                  )}

                  {selectedReward?.type === 'amount' && (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink">Amount</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedReward.value}
                        onChange={(event) =>
                          handleRewardFieldChange({ value: Number(event.target.value) || 0 })
                        }
                        className={inputClassName}
                      />
                    </label>
                  )}

                  {(selectedReward?.type === 'percentage' || selectedReward?.type === 'amount') && (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink">Applies to</span>
                      <select
                        value={selectedReward.appliesTo}
                        onChange={(event) =>
                          handleRewardFieldChange({ appliesTo: event.target.value as typeof selectedReward.appliesTo })
                        }
                        className={inputClassName}
                      >
                        <option value="order">Entire order</option>
                        <option value="category">Selected categories</option>
                        <option value="items">Specific items</option>
                      </select>
                    </label>
                  )}

                  {selectedReward?.type === 'percentage' && (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink">Max discount ($)</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedReward.maxDiscount ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          handleRewardFieldChange({
                            maxDiscount: value === '' ? undefined : Number(value) || 0
                          });
                        }}
                        className={inputClassName}
                      />
                    </label>
                  )}

                  {selectedReward?.type === 'amount' && (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink">Currency</span>
                      <input
                        type="text"
                        value={selectedReward.currency}
                        onChange={(event) => handleRewardFieldChange({ currency: event.target.value })}
                        className={inputClassName}
                      />
                    </label>
                  )}

                  {selectedReward?.type === 'bogo' && (
                    <>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Buy quantity</span>
                        <input
                          type="number"
                          min={1}
                          value={selectedReward.buyQuantity}
                          onChange={(event) =>
                            handleRewardFieldChange({ buyQuantity: Number(event.target.value) || 1 })
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Get quantity</span>
                        <input
                          type="number"
                          min={1}
                          value={selectedReward.getQuantity}
                          onChange={(event) =>
                            handleRewardFieldChange({ getQuantity: Number(event.target.value) || 1 })
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Discount type</span>
                        <select
                          value={selectedReward.discountType}
                          onChange={(event) =>
                            handleRewardFieldChange({
                              discountType: event.target.value as typeof selectedReward.discountType
                            })
                          }
                          className={inputClassName}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="amount">Amount</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Discount value</span>
                        <input
                          type="number"
                          min={0}
                          value={selectedReward.discountValue}
                          onChange={(event) =>
                            handleRewardFieldChange({ discountValue: Number(event.target.value) || 0 })
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="md:col-span-2 flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Product IDs</span>
                        <input
                          type="text"
                          value={selectedReward.productIds.join(', ')}
                          onChange={(event) =>
                            handleRewardFieldChange({ productIds: parseCommaList(event.target.value) })
                          }
                          className={inputClassName}
                          placeholder="prod-1, prod-2"
                        />
                      </label>
                    </>
                  )}

                  {selectedReward?.type === 'bundle' && (
                    <>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Bundle price ($)</span>
                        <input
                          type="number"
                          min={0}
                          value={selectedReward.bundlePrice}
                          onChange={(event) =>
                            handleRewardFieldChange({ bundlePrice: Number(event.target.value) || 0 })
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Minimum items</span>
                        <input
                          type="number"
                          min={1}
                          value={selectedReward.minimumItems}
                          onChange={(event) =>
                            handleRewardFieldChange({ minimumItems: Number(event.target.value) || 1 })
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="md:col-span-2 flex flex-col gap-2">
                        <span className="text-sm font-medium text-ink">Product IDs</span>
                        <input
                          type="text"
                          value={selectedReward.productIds.join(', ')}
                          onChange={(event) =>
                            handleRewardFieldChange({ productIds: parseCommaList(event.target.value) })
                          }
                          className={inputClassName}
                          placeholder="bundle-item-1, bundle-item-2"
                        />
                      </label>
                    </>
                  )}
                </div>
              </Card>

              <Card className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Eligibility</h3>
                  <p className="text-sm text-muted">Select who can redeem this campaign.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-ink">Sales channels</p>
                    <div className="flex flex-wrap gap-2">
                      {channelOptions.map((channel) => {
                        const isSelected = selectedCampaign.eligibility.channels.includes(channel.value);
                        return (
                          <Button
                            key={channel.value}
                            size="sm"
                            variant={isSelected ? 'primary' : 'outline'}
                            onClick={() => handleChannelToggle(channel.value)}
                            type="button"
                            aria-pressed={isSelected}
                          >
                            {channel.label}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted">{selectedCampaign.eligibility.channels.length} channels selected.</p>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Audience</span>
                    <select
                      value={selectedCampaign.eligibility.audience}
                      onChange={(event) =>
                        updateEligibility({ audience: event.target.value as PromotionCampaign['eligibility']['audience'] })
                      }
                      className={inputClassName}
                    >
                      <option value="all">All guests</option>
                      <option value="loyalty">Loyalty members</option>
                      <option value="new-customers">New customers</option>
                      <option value="staff">Internal/staff</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Minimum spend ($)</span>
                    <input
                      type="number"
                      min={0}
                      value={selectedCampaign.eligibility.minimumSpend ?? ''}
                      onChange={(event) => {
                        const { value } = event.target;
                        if (value === '') {
                          updateEligibility({ minimumSpend: undefined });
                          return;
                        }
                        const amount = Number(value);
                        updateEligibility({ minimumSpend: Number.isNaN(amount) ? undefined : amount });
                      }}
                      className={inputClassName}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Max redemptions</span>
                    <input
                      type="number"
                      min={0}
                      value={selectedCampaign.eligibility.maximumRedemptions ?? ''}
                      onChange={(event) => {
                        const { value } = event.target;
                        if (value === '') {
                          updateEligibility({ maximumRedemptions: undefined });
                          return;
                        }
                        const amount = Number(value);
                        updateEligibility({
                          maximumRedemptions: Number.isNaN(amount) ? undefined : Math.max(0, amount)
                        });
                      }}
                      className={inputClassName}
                    />
                  </label>

                  <label className="md:col-span-2 flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Required tags</span>
                    <input
                      type="text"
                      value={selectedCampaign.eligibility.requiredTags.join(', ')}
                      onChange={(event) => updateEligibility({ requiredTags: parseCommaList(event.target.value) })}
                      className={inputClassName}
                      placeholder="happy-hour, loyalty"
                    />
                  </label>

                  <label className="md:col-span-2 flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Excluded tags</span>
                    <input
                      type="text"
                      value={selectedCampaign.eligibility.excludedTags.join(', ')}
                      onChange={(event) => updateEligibility({ excludedTags: parseCommaList(event.target.value) })}
                      className={inputClassName}
                      placeholder="alcohol"
                    />
                  </label>

                  <label className="md:col-span-2 flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Included products</span>
                    <input
                      type="text"
                      value={selectedCampaign.eligibility.includedProducts.join(', ')}
                      onChange={(event) =>
                        updateEligibility({ includedProducts: parseCommaList(event.target.value) })
                      }
                      className={inputClassName}
                      placeholder="prod-1, prod-2"
                    />
                  </label>

                  <label className="md:col-span-2 flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Excluded products</span>
                    <input
                      type="text"
                      value={selectedCampaign.eligibility.excludedProducts.join(', ')}
                      onChange={(event) =>
                        updateEligibility({ excludedProducts: parseCommaList(event.target.value) })
                      }
                      className={inputClassName}
                      placeholder="alcohol, catering"
                    />
                  </label>
                </div>
              </Card>

              <Card className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Scheduling</h3>
                  <p className="text-sm text-muted">Control when the promotion is available.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Start date</span>
                    <input
                      type="date"
                      value={selectedCampaign.schedule.startDate}
                      onChange={(event) => updateSchedule({ startDate: event.target.value })}
                      className={inputClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">End date</span>
                    <input
                      type="date"
                      value={selectedCampaign.schedule.endDate ?? ''}
                      onChange={(event) => updateSchedule({ endDate: event.target.value || undefined })}
                      className={inputClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Start time</span>
                    <input
                      type="time"
                      value={selectedCampaign.schedule.startTime ?? ''}
                      onChange={(event) => updateSchedule({ startTime: event.target.value || undefined })}
                      className={inputClassName}
                      disabled={selectedCampaign.schedule.isAllDay}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">End time</span>
                    <input
                      type="time"
                      value={selectedCampaign.schedule.endTime ?? ''}
                      onChange={(event) => updateSchedule({ endTime: event.target.value || undefined })}
                      className={inputClassName}
                      disabled={selectedCampaign.schedule.isAllDay}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Timezone</span>
                    <input
                      type="text"
                      value={selectedCampaign.schedule.timezone}
                      onChange={(event) => updateSchedule({ timezone: event.target.value })}
                      className={inputClassName}
                      placeholder="America/New_York"
                    />
                  </label>
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-ink">Repeat on</span>
                    <div className="flex flex-wrap gap-2">
                      {weekdayOrder.map((day) => {
                        const isSelected = selectedCampaign.schedule.daysOfWeek.includes(day);
                        return (
                          <Button
                            key={day}
                            size="sm"
                            variant={isSelected ? 'primary' : 'outline'}
                            onClick={() => handleWeekdayToggle(day)}
                            type="button"
                            aria-pressed={isSelected}
                          >
                            {weekdayLabels[day]}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedCampaign.schedule.isAllDay ? 'primary' : 'outline'}
                      onClick={() =>
                        updateSchedule({ isAllDay: !selectedCampaign.schedule.isAllDay })
                      }
                      aria-pressed={selectedCampaign.schedule.isAllDay}
                      className="self-start"
                    >
                      Run all day
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Stacking & conflicts</h3>
                  <p className="text-sm text-muted">Manage priority and exclusivity.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <span className="text-sm font-medium text-ink">Stacking behaviour</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedCampaign.stacking.stackable ? 'primary' : 'outline'}
                        onClick={() => updateStacking({ stackable: true })}
                        aria-pressed={selectedCampaign.stacking.stackable}
                      >
                        Stackable
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!selectedCampaign.stacking.stackable ? 'primary' : 'outline'}
                        onClick={() => updateStacking({ stackable: false })}
                        aria-pressed={!selectedCampaign.stacking.stackable}
                      >
                        Exclusive
                      </Button>
                    </div>
                    <p className="text-xs text-muted">
                      Stackable promotions evaluate in the order of their priority score.
                    </p>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Exclusivity level</span>
                    <select
                      value={selectedCampaign.stacking.exclusivityLevel}
                      onChange={(event) =>
                        updateStacking({
                          exclusivityLevel: event.target.value as PromotionCampaign['stacking']['exclusivityLevel']
                        })
                      }
                      className={inputClassName}
                    >
                      {exclusivityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Priority (0-100)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedCampaign.stacking.priority}
                      onChange={(event) =>
                        updateStacking({ priority: Math.min(100, Math.max(0, Number(event.target.value) || 0)) })
                      }
                      className={inputClassName}
                    />
                  </label>

                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm font-medium text-ink">Conflicts with campaign IDs</span>
                    <input
                      type="text"
                      value={selectedCampaign.stacking.conflictsWith.join(', ')}
                      onChange={(event) =>
                        updateStacking({ conflictsWith: parseCommaList(event.target.value) })
                      }
                      className={inputClassName}
                      placeholder="promo-123, promo-456"
                    />
                  </label>

                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm font-medium text-ink">Notes</span>
                    <textarea
                      value={selectedCampaign.stacking.notes ?? ''}
                      onChange={(event) => updateStacking({ notes: event.target.value || undefined })}
                      className={textAreaClassName}
                      placeholder="Document why stacking is restricted or allowed."
                    />
                  </label>
                </div>
              </Card>

              <div className="sticky bottom-0 left-0 right-0 flex justify-end gap-3 rounded-xl border border-line bg-surface-100/90 p-4 backdrop-blur">
                <Button variant="outline" type="button">
                  Save draft
                </Button>
                <Button type="button">Review & publish</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="flex h-full items-center justify-center p-6"
              {...campaignTransition}
            >
              <Card className="max-w-md text-center">
                <h2 className="text-xl font-semibold text-ink">Create your first promotion</h2>
                <p className="mt-2 text-sm text-muted">
                  Build campaigns with eligibility, rewards, schedules, and stacking rules tailored to your brand.
                </p>
                <Button className="mt-4" type="button">
                  <Plus size={16} />
                  Create campaign
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
