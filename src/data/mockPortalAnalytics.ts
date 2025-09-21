export interface PortalSummaryMetrics {
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

export interface PortalQuickStats {
  activeTables: number;
  totalTables: number;
  kitchenQueue: number;
  lowStockItems: number;
}

export interface PortalMetrics {
  summary: PortalSummaryMetrics;
  quickStats: PortalQuickStats;
}

export interface FetchPortalMetricsOptions {
  signal?: AbortSignal;
}

const BASE_METRICS: PortalMetrics = {
  summary: {
    orders: 24,
    revenue: 1245.5,
    averageOrderValue: 51.9
  },
  quickStats: {
    activeTables: 8,
    totalTables: 12,
    kitchenQueue: 3,
    lowStockItems: 5
  }
};

const createAbortError = () => {
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(createAbortError());
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });

const randomizeMetric = (base: number, variance: number, decimals = 0) => {
  const offset = (Math.random() * 2 - 1) * variance;
  const raw = base + offset;

  if (decimals > 0) {
    const factor = 10 ** decimals;
    return Math.max(0, Math.round(raw * factor) / factor);
  }

  return Math.max(0, Math.round(raw));
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getPortalMetricsSnapshot = (): PortalMetrics => ({
  summary: { ...BASE_METRICS.summary },
  quickStats: { ...BASE_METRICS.quickStats }
});

export const fetchPortalMetrics = async (
  options: FetchPortalMetricsOptions = {}
): Promise<PortalMetrics> => {
  const { signal } = options;

  await delay(450 + Math.random() * 300, signal);

  const baseSummary = BASE_METRICS.summary;
  const baseQuickStats = BASE_METRICS.quickStats;

  const orders = randomizeMetric(baseSummary.orders, 6);
  const averageOrderValue = randomizeMetric(baseSummary.averageOrderValue, 5, 2);
  const revenueMultiplier = 0.92 + Math.random() * 0.16;
  const revenue = Math.max(0, Number((orders * averageOrderValue * revenueMultiplier).toFixed(2)));

  const activeTables = clamp(randomizeMetric(baseQuickStats.activeTables, 3), 0, baseQuickStats.totalTables);
  const kitchenQueue = randomizeMetric(baseQuickStats.kitchenQueue, 2);
  const lowStockItems = randomizeMetric(baseQuickStats.lowStockItems, 3);

  return {
    summary: {
      orders,
      revenue,
      averageOrderValue
    },
    quickStats: {
      activeTables,
      totalTables: baseQuickStats.totalTables,
      kitchenQueue,
      lowStockItems
    }
  };
};
