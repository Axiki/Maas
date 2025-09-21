export interface DaybookEntry {
  id: string;
  reference: string;
  description: string;
  counterparty: string;
  debit: number;
  credit: number;
  balance: number;
  postedAt: string;
}

export interface DaybookAlert {
  type: 'warning' | 'danger';
  message: string;
}

export interface DaybookSummary {
  totalDebit: number;
  totalCredit: number;
  netPosition: number;
  netTrend: number;
}

export interface AccountingDaybook {
  asOf: string;
  summary: DaybookSummary;
  entries: DaybookEntry[];
  alerts: DaybookAlert[];
}

export interface TaxAlert {
  type: 'warning' | 'danger';
  message: string;
}

export interface TaxPayableSummary {
  period: string;
  dueDate: string;
  collected: number;
  remitted: number;
  balanceDue: number;
  change: number;
  complianceScore: number;
  alerts: TaxAlert[];
}

export interface CashMovementStream {
  label: string;
  amount: number;
}

export interface CashMovementSummary {
  period: string;
  openingBalance: number;
  closingBalance: number;
  netChange: number;
  trend: number;
  inflows: CashMovementStream[];
  outflows: CashMovementStream[];
}

export interface ProfitAndLossHighlight {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'danger';
}

export interface MiniProfitAndLoss {
  period: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  netIncome: number;
  margin: number;
  marginTrend: number;
  highlights: ProfitAndLossHighlight[];
}

export interface AccountingExportOption {
  id: string;
  label: string;
  format: 'csv' | 'xlsx' | 'pdf';
  dataset: 'daybook' | 'tax' | 'cash' | 'pnl';
}

export const accountingDaybook: AccountingDaybook = {
  asOf: '2024-09-20',
  summary: {
    totalDebit: 28430.12,
    totalCredit: 31210.42,
    netPosition: 2780.3,
    netTrend: 0.07,
  },
  entries: [
    {
      id: 'db-1058',
      reference: 'INV-3721',
      description: 'Evening POS sales',
      counterparty: 'Sales - Dine In',
      debit: 0,
      credit: 14820.5,
      balance: 14820.5,
      postedAt: '2024-09-20T22:15:00Z',
    },
    {
      id: 'db-1059',
      reference: 'PMT-4410',
      description: 'Supplier settlement - Fresh Farms',
      counterparty: 'Accounts Payable',
      debit: 6120.25,
      credit: 0,
      balance: 8700.25,
      postedAt: '2024-09-20T18:05:00Z',
    },
    {
      id: 'db-1060',
      reference: 'ADJ-0042',
      description: 'Inventory adjustment - Waste',
      counterparty: 'Cost of Goods Sold',
      debit: 1240.0,
      credit: 0,
      balance: 7460.25,
      postedAt: '2024-09-20T14:10:00Z',
    },
    {
      id: 'db-1061',
      reference: 'INV-3722',
      description: 'Delivery app settlements',
      counterparty: 'Sales - Delivery',
      debit: 0,
      credit: 8640.4,
      balance: 16100.65,
      postedAt: '2024-09-20T11:45:00Z',
    },
    {
      id: 'db-1062',
      reference: 'PMT-4411',
      description: 'Payroll disbursement - Weekly',
      counterparty: 'Payroll Clearing',
      debit: 9200.0,
      credit: 0,
      balance: 6900.65,
      postedAt: '2024-09-20T08:30:00Z',
    },
  ],
  alerts: [
    {
      type: 'warning',
      message: 'Two manual adjustments awaiting approval from the weekend shift.',
    },
  ],
};

export const taxPayableSummary: TaxPayableSummary = {
  period: 'September 2024',
  dueDate: '2024-10-20',
  collected: 12980.45,
  remitted: 10840.0,
  balanceDue: 2140.45,
  change: -0.03,
  complianceScore: 92,
  alerts: [
    {
      type: 'warning',
      message: 'GST filing due in 4 days. Prepare remittance batch.',
    },
  ],
};

export const cashMovementSummary: CashMovementSummary = {
  period: 'Week ending 20 Sep 2024',
  openingBalance: 15840.0,
  closingBalance: 16490.0,
  netChange: 650.0,
  trend: 0.04,
  inflows: [
    { label: 'POS deposits', amount: 14230.0 },
    { label: 'Delivery payouts', amount: 3820.0 },
    { label: 'Other receipts', amount: 620.0 },
  ],
  outflows: [
    { label: 'Supplier payments', amount: 9680.0 },
    { label: 'Payroll', amount: 4820.0 },
    { label: 'Utilities & rent', amount: 520.0 },
  ],
};

export const miniProfitAndLoss: MiniProfitAndLoss = {
  period: 'September 2024 MTD',
  revenue: 68450.0,
  costOfGoodsSold: 25890.0,
  grossProfit: 42560.0,
  operatingExpenses: 19870.0,
  ebitda: 22690.0,
  netIncome: 18720.0,
  margin: 0.2735,
  marginTrend: 0.02,
  highlights: [
    { label: 'Food cost ratio', value: '37%', status: 'warning' },
    { label: 'Labour efficiency', value: '92%', status: 'success' },
    { label: 'Prime cost variance', value: '+1.4%', status: 'danger' },
  ],
};

export const accountingExportOptions: AccountingExportOption[] = [
  { id: 'daybook-csv', label: 'Daybook CSV', format: 'csv', dataset: 'daybook' },
  { id: 'tax-pdf', label: 'Tax Summary PDF', format: 'pdf', dataset: 'tax' },
  { id: 'cash-xlsx', label: 'Cash Movement XLSX', format: 'xlsx', dataset: 'cash' },
  { id: 'pnl-pdf', label: 'Mini P&L PDF', format: 'pdf', dataset: 'pnl' },
];
