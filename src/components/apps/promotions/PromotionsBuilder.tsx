import React, { useMemo, useState } from 'react';
import {
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Percent,
  Search,
  Sparkles,
  Users
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { MotionWrapper } from '../../ui/MotionWrapper';
import { mockPromotionCampaigns } from '../../../data/promotions';
import {
  PromotionCampaign,
  PromotionOrderType,
  PromotionPreviewBadge,
  PromotionRule,
  PromotionWeekday
} from '../../../types/promotions';

const statusStyles: Record<PromotionCampaign['status'], string> = {
  draft: 'bg-surface-200 text-muted border border-line',
  scheduled: 'bg-warning/10 text-warning border border-warning/40',
  active: 'bg-success/10 text-success border border-success/40',
  expired: 'bg-muted/10 text-muted border border-line',
  archived: 'bg-muted/10 text-muted border border-line'
};

const badgeToneStyles: Record<PromotionPreviewBadge['tone'], string> = {
  discount: 'bg-primary-100 text-primary-600 border border-primary-200',
  reward: 'bg-success/10 text-success border border-success/40',
  info: 'bg-surface-200 text-ink border border-line'
};

const badgeIconToneStyles: Record<PromotionPreviewBadge['tone'], string> = {
  discount: 'text-primary-600',
  reward: 'text-success',
  info: 'text-muted'
};

const weekdayLabels: Record<PromotionWeekday, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun'
};

const orderTypeLabels: Record<PromotionOrderType, string> = {
  'dine-in': 'Dine in',
  takeaway: 'Takeaway',
  delivery: 'Delivery'
};

interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ icon, title, description, children }) => (
  <Card className="space-y-6">
    <div className="flex items-start gap-3">
      <div className="mt-1 text-primary-600">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  </Card>
);

interface FormFieldProps {
  label: string;
  helper?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, helper, children }) => (
  <label className="flex flex-col gap-2 text-sm text-ink">
    <span className="font-medium">{label}</span>
    {children}
    {helper ? <span className="text-xs text-muted">{helper}</span> : null}
  </label>
);

interface ToggleFieldProps {
  label: string;
  helper?: string;
  name: string;
  defaultChecked?: boolean;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, helper, name, defaultChecked }) => (
  <label className="flex items-start gap-3 rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm">
    <input
      type="checkbox"
      name={name}
      defaultChecked={defaultChecked}
      className="mt-1 h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500"
    />
    <span>
      <span className="font-medium text-ink block">{label}</span>
      {helper ? <span className="text-xs text-muted">{helper}</span> : null}
    </span>
  </label>
);

const CheckboxPill: React.FC<{
  label: string;
  checked?: boolean;
  name: string;
  value: string;
}> = ({ label, checked, name, value }) => (
  <label
    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
      checked
        ? 'border-primary-200 bg-primary-100 text-primary-600'
        : 'border-line bg-surface-100 text-muted hover:text-ink'
    }`}
  >
    <input type="checkbox" name={name} value={value} defaultChecked={checked} className="sr-only" />
    <span>{label}</span>
  </label>
);

const RuleEditor: React.FC<{ rule: PromotionRule }> = ({ rule }) => (
  <div className="space-y-5">
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">{rule.name}</h2>
          {rule.description ? (
            <p className="text-sm text-muted max-w-2xl">{rule.description}</p>
          ) : null}
        </div>
        <span className="rounded-full border border-line bg-surface-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {rule.id}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {typeof rule.eligibility.minimumSubtotal === 'number' ? (
          <div className="rounded-lg border border-line bg-surface-200/60 p-3">
            <p className="text-xs text-muted uppercase tracking-wide">Min spend</p>
            <p className="text-sm font-semibold text-ink">${rule.eligibility.minimumSubtotal.toFixed(2)}</p>
          </div>
        ) : null}
        {typeof rule.eligibility.minimumQuantity === 'number' ? (
          <div className="rounded-lg border border-line bg-surface-200/60 p-3">
            <p className="text-xs text-muted uppercase tracking-wide">Min items</p>
            <p className="text-sm font-semibold text-ink">{rule.eligibility.minimumQuantity}</p>
          </div>
        ) : null}
        <div className="rounded-lg border border-line bg-surface-200/60 p-3">
          <p className="text-xs text-muted uppercase tracking-wide">Reward</p>
          <p className="text-sm font-semibold text-ink">
            {rule.reward.type === 'percentage' && rule.reward.value
              ? `${rule.reward.value}% off`
              : rule.reward.type === 'amount' && rule.reward.value
              ? `$${rule.reward.value.toFixed(2)} off`
              : rule.reward.type === 'bogo' && rule.reward.buyQuantity && rule.reward.getQuantity
              ? `Buy ${rule.reward.buyQuantity} get ${rule.reward.getQuantity}`
              : 'Custom reward'}
          </p>
        </div>
      </div>
    </Card>

    <FormSection
      icon={<Users size={18} />}
      title="Eligibility"
      description="Define who can trigger the rule and what needs to be in the basket."
    >
      <FormField label="Minimum subtotal" helper="Orders must meet this amount to qualify.">
        <input
          type="number"
          min={0}
          step={0.5}
          defaultValue={rule.eligibility.minimumSubtotal ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Minimum quantity" helper="Minimum combined quantity of qualifying items.">
        <input
          type="number"
          min={0}
          step={1}
          defaultValue={rule.eligibility.minimumQuantity ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Customer segments" helper="Comma-separated segments or tags that are eligible.">
        <textarea
          rows={3}
          defaultValue={rule.eligibility.customerSegments.join(', ')}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Order types" helper="Choose which fulfilment modes qualify.">
        <div className="flex flex-wrap gap-2">
          {Object.entries(orderTypeLabels).map(([key, label]) => (
            <CheckboxPill
              key={key}
              label={label}
              name={`order-type-${rule.id}`}
              value={key}
              checked={rule.eligibility.orderTypes.includes(key as PromotionOrderType)}
            />
          ))}
        </div>
      </FormField>
      <FormField label="Required product IDs" helper="Use product IDs to pin the rule to specific items.">
        <input
          type="text"
          defaultValue={(rule.eligibility.requiredProductIds ?? []).join(', ')}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Excluded product IDs" helper="Items here will never trigger the rule.">
        <input
          type="text"
          defaultValue={(rule.eligibility.excludedProductIds ?? []).join(', ')}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
    </FormSection>

    <FormSection
      icon={<Percent size={18} />}
      title="Reward"
      description="Control how the benefit is calculated and which items are discounted."
    >
      <FormField label="Reward type" helper="Percentage, fixed amount, BOGO or custom reward.">
        <select
          defaultValue={rule.reward.type}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="percentage">Percentage</option>
          <option value="amount">Fixed amount</option>
          <option value="bogo">Buy X Get Y</option>
          <option value="free-item">Free item</option>
        </select>
      </FormField>
      <FormField label="Discount value" helper="For percentage/amount rewards provide the value.">
        <input
          type="number"
          step={0.5}
          min={0}
          defaultValue={rule.reward.value ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Buy quantity" helper="For BOGO style rewards, set the quantity customers must buy.">
        <input
          type="number"
          step={1}
          min={0}
          defaultValue={rule.reward.buyQuantity ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Get quantity" helper="Number of items received as part of the reward.">
        <input
          type="number"
          step={1}
          min={0}
          defaultValue={rule.reward.getQuantity ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Applies to" helper="Whether the reward targets the order, category, or specific products.">
        <select
          defaultValue={rule.reward.appliesTo}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="entire-order">Entire order</option>
          <option value="category">Category</option>
          <option value="product">Specific products</option>
        </select>
      </FormField>
      <FormField label="Target IDs" helper="Comma-separated product or category IDs depending on the scope.">
        <input
          type="text"
          defaultValue={
            rule.reward.targetProductIds?.join(', ') ?? rule.reward.targetCategoryIds?.join(', ') ?? ''
          }
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
    </FormSection>

    <FormSection
      icon={<CalendarRange size={18} />}
      title="Scheduling"
      description="Plan when the rule is active and which service windows it should respect."
    >
      <FormField label="Start date" helper="Promotion activates on this date.">
        <input
          type="date"
          defaultValue={rule.schedule.startDate ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="End date" helper="Leave blank for open-ended promotions.">
        <input
          type="date"
          defaultValue={rule.schedule.endDate ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Timezone" helper="Times are evaluated using this timezone.">
        <input
          type="text"
          defaultValue={rule.schedule.timezone}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Always on" helper="If enabled, overrides individual windows.">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked={Boolean(rule.schedule.isAlwaysOn)}
            className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-ink">Run continuously</span>
        </div>
      </FormField>
      <div className="md:col-span-2 space-y-3">
        <p className="text-sm font-medium text-ink">Service windows</p>
        <div className="space-y-3">
          {rule.schedule.windows.map((window) => (
            <Card key={window.id} className="flex flex-col gap-3 border-dashed border-line bg-surface-100/60 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {window.days.map((day) => (
                  <span
                    key={day}
                    className="rounded-full bg-surface-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    {weekdayLabels[day]}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-sm text-ink">
                <Clock size={16} className="text-muted" />
                <span>
                  {window.startTime} – {window.endTime}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </FormSection>

    <FormSection
      icon={<Layers size={18} />}
      title="Stacking & limits"
      description="Control how this rule behaves alongside other discounts."
    >
      <ToggleField
        name={`stack-other-${rule.id}`}
        label="Allow stacking with other campaigns"
        helper="If disabled the reward is exclusive."
        defaultChecked={rule.stacking.allowWithOtherCampaigns}
      />
      <ToggleField
        name={`stack-self-${rule.id}`}
        label="Allow multiple uses per order"
        helper="Enable if the same reward can apply more than once."
        defaultChecked={rule.stacking.stackWithSameCampaign}
      />
      <FormField label="Max uses per order" helper="Cap how many times the rule fires on a single ticket.">
        <input
          type="number"
          min={0}
          step={1}
          defaultValue={rule.stacking.maxUsesPerOrder ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Max uses per customer" helper="Control how many times a guest can redeem.">
        <input
          type="number"
          min={0}
          step={1}
          defaultValue={rule.stacking.maxUsesPerCustomer ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Blocked campaigns" helper="IDs of promotions that cannot combine with this rule.">
        <input
          type="text"
          defaultValue={(rule.stacking.blockedCampaignIds ?? []).join(', ')}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
      <FormField label="Internal notes" helper="Share rollout details or reminders for your team.">
        <textarea
          rows={3}
          defaultValue={rule.stacking.notes ?? ''}
          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </FormField>
    </FormSection>
  </div>
);

export const PromotionsBuilder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    mockPromotionCampaigns[0]?.id ?? null
  );

  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return mockPromotionCampaigns;
    }
    return mockPromotionCampaigns.filter((campaign) =>
      [campaign.name, campaign.summary, ...campaign.tags].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [searchTerm]);

  const selectedCampaign = useMemo(() => {
    const fallback = selectedCampaignId
      ? mockPromotionCampaigns.find((campaign) => campaign.id === selectedCampaignId)
      : null;
    if (!fallback) {
      return filteredCampaigns[0] ?? null;
    }
    const stillVisible = filteredCampaigns.find((campaign) => campaign.id === fallback.id);
    return stillVisible ?? fallback;
  }, [filteredCampaigns, selectedCampaignId]);

  return (
    <MotionWrapper type="page" className="h-[calc(100vh-4rem)] bg-surface-100/40">
      <div className="flex h-full">
        <aside className="w-full max-w-xs border-r border-line bg-surface-100/80 shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h1 className="text-lg font-semibold text-ink">Campaigns</h1>
              <p className="text-xs text-muted">Manage active and upcoming promotions</p>
            </div>
            <Button size="sm" variant="primary" className="h-9 px-3 text-xs font-semibold uppercase tracking-wide">
              <Sparkles size={14} />
              <span>New</span>
            </Button>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search campaigns"
                className="w-full rounded-lg border border-line bg-surface-100 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center gap-2 text-xs uppercase tracking-wide"
            >
              <Filter size={14} /> Filters
            </Button>
          </div>

          <div className="h-[calc(100%-164px)] overflow-y-auto px-3 pb-6">
            <div className="space-y-2">
              {filteredCampaigns.map((campaign) => {
                const isActive = selectedCampaign?.id === campaign.id;
                return (
                  <button
                    key={campaign.id}
                    type="button"
                    onClick={() => setSelectedCampaignId(campaign.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'border-primary-200 bg-primary-100/60 shadow-card'
                        : 'border-transparent bg-surface-100 hover:border-line'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{campaign.name}</p>
                        <p className="text-xs text-muted">{campaign.summary}</p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`mt-1 transition-colors ${isActive ? 'text-primary-600' : 'text-muted'}`}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[campaign.status]}`}>
                        {campaign.status}
                      </span>
                      <span className="rounded-full bg-surface-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Priority {campaign.priority}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {campaign.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-200 px-2.5 py-1 text-[11px] font-medium text-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
              {filteredCampaigns.length === 0 ? (
                <Card className="space-y-2 text-center">
                  <Layers size={20} className="mx-auto text-muted" />
                  <p className="text-sm font-semibold text-ink">No campaigns match</p>
                  <p className="text-xs text-muted">
                    Try adjusting your search term or clearing filters.
                  </p>
                </Card>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto p-6">
          {selectedCampaign ? (
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
              <Card className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">{selectedCampaign.name}</h2>
                    <p className="text-sm text-muted max-w-2xl">{selectedCampaign.summary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                        statusStyles[selectedCampaign.status]
                      }`}
                    >
                      {selectedCampaign.status}
                    </span>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CheckCircle2 size={14} /> Save draft
                    </Button>
                    <Button variant="primary" size="sm" className="gap-2">
                      <Sparkles size={14} /> Activate
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                    <p className="text-xs text-muted uppercase tracking-wide">Owner</p>
                    <p className="text-sm font-semibold text-ink">{selectedCampaign.owner}</p>
                  </div>
                  <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                    <p className="text-xs text-muted uppercase tracking-wide">Last updated</p>
                    <p className="text-sm font-semibold text-ink">
                      {new Date(selectedCampaign.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                    <p className="text-xs text-muted uppercase tracking-wide">Rules</p>
                    <p className="text-sm font-semibold text-ink">{selectedCampaign.rules.length}</p>
                  </div>
                </div>

                {selectedCampaign.previewBadges ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.previewBadges.map((badge) => (
                      <span
                        key={badge.id}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          badgeToneStyles[badge.tone]
                        }`}
                      >
                        <Sparkles size={14} className={badgeIconToneStyles[badge.tone]} />
                        {badge.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>

              {selectedCampaign.rules.map((rule) => (
                <RuleEditor key={rule.id} rule={rule} />
              ))}
            </div>
          ) : (
            <Card className="mx-auto flex h-64 max-w-2xl flex-col items-center justify-center gap-2 text-center">
              <Layers size={24} className="text-muted" />
              <p className="text-base font-semibold text-ink">Select or create a campaign to begin</p>
              <p className="text-sm text-muted">
                Campaign rules will appear here once you choose one from the list.
              </p>
            </Card>
          )}
        </section>
      </div>
    </MotionWrapper>
  );
};

export default PromotionsBuilder;
