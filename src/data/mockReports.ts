export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface SalesTrendPoint {
  label: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  margin: number;
}

export interface InventoryTrendPoint {
  label: string;
  onHand: number;
  turnover: number;
  stockouts: number;
}

export interface PurchasingTrendPoint {
  label: string;
  spend: number;
  deliveries: number;
  leadTime: number;
  fillRate: number;
}

export type InsightImpact = 'positive' | 'neutral' | 'warning';

export interface ReportInsight {
  category: 'sales' | 'inventory' | 'purchasing';
  title: string;
  detail: string;
  impact: InsightImpact;
}

export const periodRanges: Record<ReportPeriod, string> = {
  daily: 'Past 7 days',
  weekly: 'Past 8 weeks',
  monthly: 'January – June 2024',
  quarterly: 'FY 2023 – FY 2024 year-to-date'
};

export const salesTrends: Record<ReportPeriod, SalesTrendPoint[]> = {
  daily: [
    { label: 'Mon', revenue: 11250, orders: 215, avgOrderValue: 52.3, margin: 0.57 },
    { label: 'Tue', revenue: 11890, orders: 228, avgOrderValue: 52.2, margin: 0.58 },
    { label: 'Wed', revenue: 12340, orders: 236, avgOrderValue: 52.3, margin: 0.57 },
    { label: 'Thu', revenue: 12980, orders: 244, avgOrderValue: 53.2, margin: 0.58 },
    { label: 'Fri', revenue: 15670, orders: 296, avgOrderValue: 52.9, margin: 0.59 },
    { label: 'Sat', revenue: 17840, orders: 312, avgOrderValue: 57.2, margin: 0.6 },
    { label: 'Sun', revenue: 16210, orders: 284, avgOrderValue: 57.1, margin: 0.6 }
  ],
  weekly: [
    { label: 'WK 19', revenue: 61230, orders: 1228, avgOrderValue: 49.9, margin: 0.55 },
    { label: 'WK 20', revenue: 63140, orders: 1264, avgOrderValue: 50.0, margin: 0.55 },
    { label: 'WK 21', revenue: 64520, orders: 1286, avgOrderValue: 50.2, margin: 0.55 },
    { label: 'WK 22', revenue: 66210, orders: 1312, avgOrderValue: 50.5, margin: 0.56 },
    { label: 'WK 23', revenue: 68450, orders: 1348, avgOrderValue: 50.8, margin: 0.56 },
    { label: 'WK 24', revenue: 70120, orders: 1384, avgOrderValue: 50.6, margin: 0.57 },
    { label: 'WK 25', revenue: 71590, orders: 1416, avgOrderValue: 50.5, margin: 0.57 },
    { label: 'WK 26', revenue: 73980, orders: 1452, avgOrderValue: 50.9, margin: 0.58 }
  ],
  monthly: [
    { label: 'Jan', revenue: 248900, orders: 4980, avgOrderValue: 49.9, margin: 0.53 },
    { label: 'Feb', revenue: 258400, orders: 5120, avgOrderValue: 50.5, margin: 0.54 },
    { label: 'Mar', revenue: 268900, orders: 5256, avgOrderValue: 51.2, margin: 0.55 },
    { label: 'Apr', revenue: 275600, orders: 5340, avgOrderValue: 51.6, margin: 0.55 },
    { label: 'May', revenue: 284500, orders: 5468, avgOrderValue: 52.0, margin: 0.56 },
    { label: 'Jun', revenue: 297800, orders: 5624, avgOrderValue: 53.0, margin: 0.57 }
  ],
  quarterly: [
    { label: 'Q3 FY23', revenue: 705200, orders: 14280, avgOrderValue: 49.4, margin: 0.52 },
    { label: 'Q4 FY23', revenue: 728400, orders: 14620, avgOrderValue: 49.9, margin: 0.52 },
    { label: 'Q1 FY24', revenue: 774600, orders: 15360, avgOrderValue: 50.4, margin: 0.54 },
    { label: 'Q2 FY24', revenue: 857200, orders: 16540, avgOrderValue: 51.8, margin: 0.56 }
  ]
};

export const inventoryTrends: Record<ReportPeriod, InventoryTrendPoint[]> = {
  daily: [
    { label: 'Mon', onHand: 820, turnover: 1.52, stockouts: 3 },
    { label: 'Tue', onHand: 840, turnover: 1.55, stockouts: 2 },
    { label: 'Wed', onHand: 835, turnover: 1.59, stockouts: 2 },
    { label: 'Thu', onHand: 842, turnover: 1.61, stockouts: 1 },
    { label: 'Fri', onHand: 798, turnover: 1.68, stockouts: 2 },
    { label: 'Sat', onHand: 756, turnover: 1.74, stockouts: 3 },
    { label: 'Sun', onHand: 792, turnover: 1.7, stockouts: 1 }
  ],
  weekly: [
    { label: 'WK 19', onHand: 910, turnover: 1.44, stockouts: 12 },
    { label: 'WK 20', onHand: 892, turnover: 1.47, stockouts: 11 },
    { label: 'WK 21', onHand: 876, turnover: 1.51, stockouts: 10 },
    { label: 'WK 22', onHand: 862, turnover: 1.56, stockouts: 9 },
    { label: 'WK 23', onHand: 846, turnover: 1.6, stockouts: 8 },
    { label: 'WK 24', onHand: 821, turnover: 1.66, stockouts: 8 },
    { label: 'WK 25', onHand: 798, turnover: 1.69, stockouts: 7 },
    { label: 'WK 26', onHand: 760, turnover: 1.72, stockouts: 9 }
  ],
  monthly: [
    { label: 'Jan', onHand: 1040, turnover: 1.32, stockouts: 18 },
    { label: 'Feb', onHand: 998, turnover: 1.35, stockouts: 16 },
    { label: 'Mar', onHand: 968, turnover: 1.4, stockouts: 15 },
    { label: 'Apr', onHand: 936, turnover: 1.45, stockouts: 14 },
    { label: 'May', onHand: 882, turnover: 1.52, stockouts: 13 },
    { label: 'Jun', onHand: 834, turnover: 1.62, stockouts: 12 }
  ],
  quarterly: [
    { label: 'Q3 FY23', onHand: 1180, turnover: 1.26, stockouts: 56 },
    { label: 'Q4 FY23', onHand: 1124, turnover: 1.31, stockouts: 48 },
    { label: 'Q1 FY24', onHand: 1046, turnover: 1.39, stockouts: 43 },
    { label: 'Q2 FY24', onHand: 892, turnover: 1.58, stockouts: 38 }
  ]
};

export const purchasingTrends: Record<ReportPeriod, PurchasingTrendPoint[]> = {
  daily: [
    { label: 'Mon', spend: 4280, deliveries: 3, leadTime: 6.4, fillRate: 0.94 },
    { label: 'Tue', spend: 3860, deliveries: 2, leadTime: 6.1, fillRate: 0.95 },
    { label: 'Wed', spend: 4120, deliveries: 3, leadTime: 5.8, fillRate: 0.96 },
    { label: 'Thu', spend: 3980, deliveries: 2, leadTime: 5.9, fillRate: 0.95 },
    { label: 'Fri', spend: 4520, deliveries: 4, leadTime: 5.7, fillRate: 0.97 },
    { label: 'Sat', spend: 3650, deliveries: 2, leadTime: 6.2, fillRate: 0.93 },
    { label: 'Sun', spend: 3380, deliveries: 2, leadTime: 6.5, fillRate: 0.92 }
  ],
  weekly: [
    { label: 'WK 19', spend: 23980, deliveries: 16, leadTime: 6.8, fillRate: 0.91 },
    { label: 'WK 20', spend: 24890, deliveries: 17, leadTime: 6.4, fillRate: 0.92 },
    { label: 'WK 21', spend: 24560, deliveries: 18, leadTime: 6.2, fillRate: 0.93 },
    { label: 'WK 22', spend: 25340, deliveries: 19, leadTime: 6.1, fillRate: 0.94 },
    { label: 'WK 23', spend: 26280, deliveries: 20, leadTime: 5.9, fillRate: 0.95 },
    { label: 'WK 24', spend: 27140, deliveries: 21, leadTime: 5.8, fillRate: 0.96 },
    { label: 'WK 25', spend: 27960, deliveries: 21, leadTime: 5.6, fillRate: 0.96 },
    { label: 'WK 26', spend: 28820, deliveries: 22, leadTime: 5.4, fillRate: 0.97 }
  ],
  monthly: [
    { label: 'Jan', spend: 101200, deliveries: 68, leadTime: 7.1, fillRate: 0.9 },
    { label: 'Feb', spend: 104850, deliveries: 70, leadTime: 6.7, fillRate: 0.91 },
    { label: 'Mar', spend: 108420, deliveries: 72, leadTime: 6.4, fillRate: 0.92 },
    { label: 'Apr', spend: 112380, deliveries: 74, leadTime: 6.2, fillRate: 0.93 },
    { label: 'May', spend: 118640, deliveries: 78, leadTime: 6.0, fillRate: 0.94 },
    { label: 'Jun', spend: 125480, deliveries: 81, leadTime: 5.7, fillRate: 0.95 }
  ],
  quarterly: [
    { label: 'Q3 FY23', spend: 289400, deliveries: 200, leadTime: 7.4, fillRate: 0.89 },
    { label: 'Q4 FY23', spend: 302860, deliveries: 208, leadTime: 7.0, fillRate: 0.9 },
    { label: 'Q1 FY24', spend: 317240, deliveries: 216, leadTime: 6.5, fillRate: 0.92 },
    { label: 'Q2 FY24', spend: 356500, deliveries: 228, leadTime: 6.0, fillRate: 0.94 }
  ]
};

export const reportInsights: Record<ReportPeriod, ReportInsight[]> = {
  daily: [
    {
      category: 'sales',
      title: 'Weekend uplift',
      detail: 'Weekend revenue grew 8.2% versus the prior week driven by brunch combos.',
      impact: 'positive'
    },
    {
      category: 'inventory',
      title: 'Cold brew concentrate low',
      detail: 'Two stockouts recorded this week; reorder before Wednesday to avoid lost sales.',
      impact: 'warning'
    },
    {
      category: 'purchasing',
      title: 'Supplier fill rate steady',
      detail: 'Fill rate averaged 95% with lead times holding under 6.5 days.',
      impact: 'neutral'
    }
  ],
  weekly: [
    {
      category: 'sales',
      title: 'Growth streak at 6 weeks',
      detail: 'Weekly revenue has increased 6 consecutive weeks with AOV up 2.6%.',
      impact: 'positive'
    },
    {
      category: 'inventory',
      title: 'Aging stock clearing',
      detail: 'On-hand quantity dropped 16% while turnover improved to 1.69x.',
      impact: 'positive'
    },
    {
      category: 'purchasing',
      title: 'Negotiated savings opportunity',
      detail: 'Lead times down to 5.4 days; consider volume rebate with top supplier.',
      impact: 'neutral'
    }
  ],
  monthly: [
    {
      category: 'sales',
      title: 'Summer menu traction',
      detail: 'Revenue up 19% since January with margin improving 4 points.',
      impact: 'positive'
    },
    {
      category: 'inventory',
      title: 'Back-of-house efficiency',
      detail: 'Inventory turnover reached 1.62x while stockouts trended down 33%.',
      impact: 'positive'
    },
    {
      category: 'purchasing',
      title: 'Cost pressure easing',
      detail: 'Average lead time now 5.7 days thanks to consolidated suppliers.',
      impact: 'positive'
    }
  ],
  quarterly: [
    {
      category: 'sales',
      title: 'Record quarter delivered',
      detail: 'Q2 FY24 revenue beat the previous high by 9.5% with strong weekend trade.',
      impact: 'positive'
    },
    {
      category: 'inventory',
      title: 'Lean inventory posture',
      detail: 'On-hand levels fell 23% year over year without impacting service levels.',
      impact: 'positive'
    },
    {
      category: 'purchasing',
      title: 'Supplier reliability trending up',
      detail: 'Fill rates climbed to 94% while lead times shortened by 1.4 days.',
      impact: 'neutral'
    }
  ]
};
