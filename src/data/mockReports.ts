import { addDays, formatISO } from 'date-fns';

export interface TrendSnapshot {
  change: number; // decimal representation e.g. 0.05 = +5%
  label: string;
}

export interface DaybookSnapshot {
  period: string;
  grossSales: number;
  returns: number;
  tips: number;
  serviceCharges: number;
  taxes: number;
  netSales: number;
  trend: TrendSnapshot;
}

export interface TaxPayableSnapshot {
  collected: number;
  remitted: number;
  outstanding: number;
  nextFilingDate: string;
  status: 'on-track' | 'due-soon' | 'overdue';
  trend: TrendSnapshot;
}

export interface CashMovementSnapshot {
  openingFloat: number;
  cashSales: number;
  payouts: number;
  deposits: number;
  closingFloat: number;
  variance: number;
  trend: TrendSnapshot;
}

export interface ProfitAndLossSnapshot {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
  margin: number; // decimal e.g. 0.18 = 18%
  trend: TrendSnapshot;
}

export interface AccountingReportSummary {
  generatedAt: string;
  daybook: DaybookSnapshot;
  tax: TaxPayableSnapshot;
  cash: CashMovementSnapshot;
  profitAndLoss: ProfitAndLossSnapshot;
}

const generatedAt = formatISO(new Date());

export const mockAccountingReports: AccountingReportSummary = {
  generatedAt,
  daybook: {
    period: 'Today',
    grossSales: 15640.8,
    returns: 320.45,
    tips: 985.12,
    serviceCharges: 410.32,
    taxes: 1189.76,
    netSales: 13995.29,
    trend: {
      change: 0.048,
      label: 'vs. last 7 days'
    }
  },
  tax: {
    collected: 1189.76,
    remitted: 620.0,
    outstanding: 569.76,
    nextFilingDate: formatISO(addDays(new Date(), 12), { representation: 'date' }),
    status: 'on-track',
    trend: {
      change: -0.012,
      label: 'vs. last filing'
    }
  },
  cash: {
    openingFloat: 600,
    cashSales: 4320.55,
    payouts: 360.2,
    deposits: 3800.0,
    closingFloat: 625.35,
    variance: 15.15,
    trend: {
      change: 0.015,
      label: 'vs. last close'
    }
  },
  profitAndLoss: {
    revenue: 18650.32,
    costOfGoodsSold: 7450.21,
    grossProfit: 11200.11,
    operatingExpenses: 8120.78,
    netIncome: 3079.33,
    margin: 0.165,
    trend: {
      change: 0.076,
      label: 'vs. prior month'
    }
  }
};

export type { AccountingReportSummary as ReportsMock };
