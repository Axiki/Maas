export type ReportCategory = 'sales' | 'inventory' | 'purchasing' | 'loyalty';

export interface KPI {
  id: string;
  label: string;
  value: string;
  change: number;
  context: string;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface BreakdownEntry {
  id: string;
  name: string;
  value: string;
  percentage: number;
}

export interface Highlight {
  id: string;
  title: string;
  detail: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ReportDataset {
  title: string;
  period: string;
  kpis: KPI[];
  trend: TrendPoint[];
  breakdown: BreakdownEntry[];
  highlights: Highlight[];
}

export const mockReportData: Record<ReportCategory, ReportDataset> = {
  sales: {
    title: 'Sales Performance',
    period: 'Last 12 weeks',
    kpis: [
      {
        id: 'total-revenue',
        label: 'Total Revenue',
        value: '$124,580',
        change: 8.4,
        context: 'Compared to the previous 12 weeks.'
      },
      {
        id: 'avg-check',
        label: 'Average Check',
        value: '$42.75',
        change: 3.1,
        context: 'Driven by dinner specials and prix fixe menus.'
      },
      {
        id: 'net-sales',
        label: 'Net Sales',
        value: '$112,940',
        change: 6.7,
        context: 'After discounts, comps, and refunds.'
      },
      {
        id: 'online-share',
        label: 'Online Order Share',
        value: '37%',
        change: 12.5,
        context: 'Digital orders grew strongly after campaign launch.'
      }
    ],
    trend: [
      { label: 'Week 1', value: 8200 },
      { label: 'Week 2', value: 8650 },
      { label: 'Week 3', value: 9100 },
      { label: 'Week 4', value: 8800 },
      { label: 'Week 5', value: 9400 },
      { label: 'Week 6', value: 10120 },
      { label: 'Week 7', value: 10650 },
      { label: 'Week 8', value: 11040 },
      { label: 'Week 9', value: 11420 },
      { label: 'Week 10', value: 11870 },
      { label: 'Week 11', value: 12230 },
      { label: 'Week 12', value: 12650 }
    ],
    breakdown: [
      { id: 'dine-in', name: 'Dine-in', value: '$68,420', percentage: 55 },
      { id: 'delivery', name: 'Delivery', value: '$32,110', percentage: 26 },
      { id: 'takeaway', name: 'Takeaway', value: '$15,370', percentage: 12 },
      { id: 'catering', name: 'Catering', value: '$8,680', percentage: 7 }
    ],
    highlights: [
      {
        id: 'highlight-sales-1',
        title: 'Weekend brunch outperformed forecast',
        detail: 'Brunch sets sold out on 9 of 12 weekends after new email push.',
        impact: 'positive'
      },
      {
        id: 'highlight-sales-2',
        title: 'Delivery channel surge',
        detail: 'Third-party delivery partners added 340 new customers.',
        impact: 'positive'
      },
      {
        id: 'highlight-sales-3',
        title: 'Refund rate remained low',
        detail: 'Refunds accounted for just 0.6% of total orders.',
        impact: 'neutral'
      },
      {
        id: 'highlight-sales-4',
        title: 'Upcoming focus: upsell desserts',
        detail: 'Dessert attachment rate trails target by 4.2 points.',
        impact: 'negative'
      }
    ]
  },
  inventory: {
    title: 'Inventory Health',
    period: 'Current month to date',
    kpis: [
      {
        id: 'stock-turns',
        label: 'Stock Turns',
        value: '4.8x',
        change: 1.6,
        context: 'Increased after recipe-level portion controls.'
      },
      {
        id: 'on-hand',
        label: 'On-hand Value',
        value: '$28,400',
        change: -5.2,
        context: 'Lower cooler inventory following waste reduction pilot.'
      },
      {
        id: 'shrinkage',
        label: 'Shrinkage',
        value: '1.9%',
        change: -0.8,
        context: 'Down thanks to weekly variance checks.'
      },
      {
        id: 'critical-items',
        label: 'Critical Items',
        value: '6',
        change: 20,
        context: 'Vendors flagged temporary shortages on prime proteins.'
      }
    ],
    trend: [
      { label: 'Week 1', value: 3200 },
      { label: 'Week 2', value: 3000 },
      { label: 'Week 3', value: 3100 },
      { label: 'Week 4', value: 2950 },
      { label: 'Week 5', value: 2850 },
      { label: 'Week 6', value: 2780 },
      { label: 'Week 7', value: 2700 },
      { label: 'Week 8', value: 2650 },
      { label: 'Week 9', value: 2600 },
      { label: 'Week 10', value: 2580 },
      { label: 'Week 11', value: 2550 },
      { label: 'Week 12', value: 2520 }
    ],
    breakdown: [
      { id: 'produce', name: 'Produce', value: '$8,920', percentage: 31 },
      { id: 'proteins', name: 'Proteins', value: '$9,750', percentage: 34 },
      { id: 'dry-goods', name: 'Dry Goods', value: '$5,430', percentage: 19 },
      { id: 'beverage', name: 'Beverage', value: '$4,300', percentage: 16 }
    ],
    highlights: [
      {
        id: 'highlight-inv-1',
        title: 'Seafood replenishment delayed',
        detail: 'Storm-related shipping delays could impact weekend menu availability.',
        impact: 'negative'
      },
      {
        id: 'highlight-inv-2',
        title: 'New waste tracking in prep kitchen',
        detail: 'Daily logbooks identified 12% trimming opportunity.',
        impact: 'positive'
      },
      {
        id: 'highlight-inv-3',
        title: 'Vendor compliance steady',
        detail: 'All key suppliers delivered on spec for the third week running.',
        impact: 'neutral'
      },
      {
        id: 'highlight-inv-4',
        title: 'Seasonal produce in rotation',
        detail: 'Spring greens now have par levels adjusted for brunch demand.',
        impact: 'positive'
      }
    ]
  },
  purchasing: {
    title: 'Purchasing Insights',
    period: 'Quarter to date',
    kpis: [
      {
        id: 'po-volume',
        label: 'PO Volume',
        value: '$86,300',
        change: -2.4,
        context: 'Reduced after consolidating dry goods vendors.'
      },
      {
        id: 'on-time',
        label: 'On-time Delivery',
        value: '94%',
        change: 4.5,
        context: 'Logistics partner improved peak-hour routing.'
      },
      {
        id: 'contract-coverage',
        label: 'Contract Coverage',
        value: '78%',
        change: 6.2,
        context: 'Additional items negotiated under annual contracts.'
      },
      {
        id: 'savings',
        label: 'Identified Savings',
        value: '$12,450',
        change: 9.8,
        context: 'Menu engineering reduced high-cost SKUs.'
      }
    ],
    trend: [
      { label: 'Week 1', value: 7200 },
      { label: 'Week 2', value: 6900 },
      { label: 'Week 3', value: 7100 },
      { label: 'Week 4', value: 7050 },
      { label: 'Week 5', value: 6980 },
      { label: 'Week 6', value: 6820 },
      { label: 'Week 7', value: 6700 },
      { label: 'Week 8', value: 6600 },
      { label: 'Week 9', value: 6500 },
      { label: 'Week 10', value: 6400 },
      { label: 'Week 11', value: 6350 },
      { label: 'Week 12', value: 6280 }
    ],
    breakdown: [
      { id: 'broadline', name: 'Broadline', value: '$34,200', percentage: 40 },
      { id: 'specialty', name: 'Specialty', value: '$21,150', percentage: 25 },
      { id: 'beverage', name: 'Beverage', value: '$18,560', percentage: 21 },
      { id: 'non-food', name: 'Non-food', value: '$12,390', percentage: 14 }
    ],
    highlights: [
      {
        id: 'highlight-purchasing-1',
        title: 'Coffee supplier contract renewed',
        detail: 'Locked in 18-month pricing with just 1.5% escalation.',
        impact: 'positive'
      },
      {
        id: 'highlight-purchasing-2',
        title: 'Consolidated paper goods orders',
        detail: 'Combined shipments saved $1,200 in freight this quarter.',
        impact: 'positive'
      },
      {
        id: 'highlight-purchasing-3',
        title: 'Monitor dairy market volatility',
        detail: 'Butter and cream indexes trending upward for next cycle.',
        impact: 'negative'
      },
      {
        id: 'highlight-purchasing-4',
        title: 'Chef requests new local farms',
        detail: 'Evaluating proposals for summer tasting menu produce.',
        impact: 'neutral'
      }
    ]
  },
  loyalty: {
    title: 'Loyalty & Guest Retention',
    period: 'Rolling 90 days',
    kpis: [
      {
        id: 'active-members',
        label: 'Active Members',
        value: '8,420',
        change: 11.3,
        context: 'Growth from referral program and in-app signups.'
      },
      {
        id: 'repeat-visit',
        label: 'Repeat Visit Rate',
        value: '46%',
        change: 5.6,
        context: 'Steady improvements after targeted push notifications.'
      },
      {
        id: 'points-redeemed',
        label: 'Points Redeemed',
        value: '182,300',
        change: -3.2,
        context: 'Members saving points for summer seasonal menu.'
      },
      {
        id: 'nps',
        label: 'Net Promoter Score',
        value: '62',
        change: 7.1,
        context: 'High satisfaction with curbside pickup wait times.'
      }
    ],
    trend: [
      { label: 'Week 1', value: 520 },
      { label: 'Week 2', value: 560 },
      { label: 'Week 3', value: 610 },
      { label: 'Week 4', value: 640 },
      { label: 'Week 5', value: 660 },
      { label: 'Week 6', value: 700 },
      { label: 'Week 7', value: 720 },
      { label: 'Week 8', value: 760 },
      { label: 'Week 9', value: 800 },
      { label: 'Week 10', value: 840 },
      { label: 'Week 11', value: 870 },
      { label: 'Week 12', value: 910 }
    ],
    breakdown: [
      { id: 'email', name: 'Email', value: '32%', percentage: 32 },
      { id: 'mobile-app', name: 'Mobile App', value: '41%', percentage: 41 },
      { id: 'pos', name: 'POS Signup', value: '19%', percentage: 19 },
      { id: 'referrals', name: 'Referrals', value: '8%', percentage: 8 }
    ],
    highlights: [
      {
        id: 'highlight-loyalty-1',
        title: 'Referral bonus resonated',
        detail: 'New member signups doubled during double-points week.',
        impact: 'positive'
      },
      {
        id: 'highlight-loyalty-2',
        title: 'VIP tasting sold out',
        detail: 'Loyalty members claimed all 120 seats within 36 hours.',
        impact: 'positive'
      },
      {
        id: 'highlight-loyalty-3',
        title: 'Monitor inactive cohort',
        detail: '1,140 members have not visited in 6 months — launch re-engagement drip.',
        impact: 'negative'
      },
      {
        id: 'highlight-loyalty-4',
        title: 'Feedback theme: patio seating',
        detail: 'Guests request more shade coverage for afternoon visits.',
        impact: 'neutral'
      }
    ]
  }
};

export const reportTabs: Array<{ id: ReportCategory; label: string }> = [
  { id: 'sales', label: 'Sales' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'purchasing', label: 'Purchasing' },
  { id: 'loyalty', label: 'Loyalty' }
];
