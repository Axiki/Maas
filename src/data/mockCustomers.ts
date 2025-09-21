import { useMemo } from 'react';
import { Customer, CustomerVisit, GiftCard } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Smith',
    phone: '555-0101',
    email: 'john.smith@email.com',
    birthday: '1985-06-18',
    tags: ['VIP', 'Wine Club'],
    notes: 'Prefers window seating and is allergic to peanuts.',
    loyaltyPoints: 1250,
    storeCreditBalance: 15.5,
    visits: [
      {
        date: '2024-03-12T19:45:00Z',
        storeId: 'store-1',
        orderId: 'ord-5124',
        channel: 'dine-in',
        totalSpend: 142.35,
        pointsEarned: 250,
      },
      {
        date: '2024-02-18T20:10:00Z',
        storeId: 'store-1',
        orderId: 'ord-4932',
        channel: 'dine-in',
        totalSpend: 118.2,
        pointsEarned: 220,
        pointsRedeemed: 120,
      },
      {
        date: '2024-01-14T17:15:00Z',
        storeId: 'store-1',
        orderId: 'ord-4610',
        channel: 'takeaway',
        totalSpend: 96.5,
        pointsEarned: 180,
      },
      {
        date: '2023-12-22T18:40:00Z',
        storeId: 'store-1',
        orderId: 'ord-4419',
        channel: 'dine-in',
        totalSpend: 153.9,
        pointsEarned: 280,
      },
    ],
    loyalty: {
      tier: 'Gold',
      lifetimePoints: 14250,
      pointsToNextReward: 250,
      lastEarnedOn: '2024-03-12T19:45:00Z',
      lastRedeemedOn: '2024-02-05T18:00:00Z',
      expiring: [
        { points: 120, expiresOn: '2024-09-30T23:59:59Z' },
        { points: 80, expiresOn: '2024-12-31T23:59:59Z' },
      ],
      history: [
        {
          id: 'loy-1001',
          type: 'earn',
          points: 280,
          balanceAfter: 1080,
          date: '2023-12-22T18:40:00Z',
          reference: 'ord-4419',
          note: 'Dinner for 4 - Table 6',
        },
        {
          id: 'loy-1002',
          type: 'earn',
          points: 180,
          balanceAfter: 1260,
          date: '2024-01-14T17:15:00Z',
          reference: 'ord-4610',
        },
        {
          id: 'loy-1003',
          type: 'redeem',
          points: -120,
          balanceAfter: 1140,
          date: '2024-02-05T18:00:00Z',
          reference: 'reward-455',
          note: 'Redeemed for $12 dessert comp',
        },
        {
          id: 'loy-1004',
          type: 'earn',
          points: 220,
          balanceAfter: 1360,
          date: '2024-02-18T20:10:00Z',
          reference: 'ord-4932',
        },
        {
          id: 'loy-1005',
          type: 'earn',
          points: 250,
          balanceAfter: 1610,
          date: '2024-03-12T19:45:00Z',
          reference: 'ord-5124',
        },
        {
          id: 'loy-1006',
          type: 'adjust',
          points: -360,
          balanceAfter: 1250,
          date: '2024-03-15T15:30:00Z',
          reference: 'audit-2024-03',
          note: 'Manual adjustment after double posting fix',
        },
      ],
    },
    storeCredits: [
      {
        id: 'credit-1001',
        balance: 15.5,
        issuedOn: '2023-12-18T00:00:00Z',
        expiresOn: '2024-12-31T23:59:59Z',
        lastUsedOn: '2024-03-12T19:45:00Z',
        ledger: [
          {
            id: 'cred-ledger-1001',
            type: 'issue',
            amount: 25,
            balanceAfter: 25,
            date: '2023-12-18T00:00:00Z',
            reference: 'promo-holiday',
            note: 'Holiday goodwill credit',
          },
          {
            id: 'cred-ledger-1002',
            type: 'redeem',
            amount: -9.5,
            balanceAfter: 15.5,
            date: '2024-03-12T19:45:00Z',
            reference: 'ord-5124',
            note: 'Applied to dinner check',
          },
        ],
      },
    ],
    giftCards: [
      {
        code: 'GC-1001',
        originalValue: 75,
        balance: 35,
        status: 'active',
        issuedOn: '2023-11-20T00:00:00Z',
        expiresOn: '2025-11-20T23:59:59Z',
        lastUsedOn: '2024-01-14T17:15:00Z',
        purchaseStoreId: 'store-1',
        recipientName: 'John Smith',
        transactions: [
          {
            id: 'gift-txn-1001',
            type: 'issue',
            amount: 75,
            balanceAfter: 75,
            date: '2023-11-20T00:00:00Z',
            reference: 'gc-sale-884',
          },
          {
            id: 'gift-txn-1002',
            type: 'redeem',
            amount: -40,
            balanceAfter: 35,
            date: '2024-01-14T17:15:00Z',
            reference: 'ord-4610',
            note: 'Applied to takeaway order',
          },
        ],
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'Emily Davis',
    phone: '555-0102',
    email: 'emily.davis@email.com',
    birthday: '1990-09-03',
    tags: ['Vegan', 'Newsletter'],
    notes: 'Enjoys seasonal tasting menu and plant-based options.',
    loyaltyPoints: 760,
    storeCreditBalance: 30,
    visits: [
      {
        date: '2024-03-08T18:20:00Z',
        storeId: 'store-1',
        orderId: 'ord-5088',
        channel: 'dine-in',
        totalSpend: 82.75,
        pointsEarned: 160,
      },
      {
        date: '2024-02-02T19:05:00Z',
        storeId: 'store-1',
        orderId: 'ord-4870',
        channel: 'dine-in',
        totalSpend: 95.4,
        pointsEarned: 190,
        pointsRedeemed: 80,
      },
      {
        date: '2024-01-05T12:40:00Z',
        storeId: 'store-1',
        orderId: 'ord-4552',
        channel: 'takeaway',
        totalSpend: 54.1,
        pointsEarned: 110,
      },
      {
        date: '2023-11-17T20:05:00Z',
        storeId: 'store-1',
        orderId: 'ord-4304',
        channel: 'dine-in',
        totalSpend: 101.2,
        pointsEarned: 205,
      },
    ],
    loyalty: {
      tier: 'Silver',
      lifetimePoints: 6870,
      pointsToNextReward: 240,
      lastEarnedOn: '2024-03-08T18:20:00Z',
      lastRedeemedOn: '2024-02-02T19:05:00Z',
      expiring: [
        { points: 60, expiresOn: '2024-06-30T23:59:59Z' },
      ],
      history: [
        {
          id: 'loy-2001',
          type: 'earn',
          points: 205,
          balanceAfter: 640,
          date: '2023-11-17T20:05:00Z',
          reference: 'ord-4304',
        },
        {
          id: 'loy-2002',
          type: 'earn',
          points: 110,
          balanceAfter: 750,
          date: '2024-01-05T12:40:00Z',
          reference: 'ord-4552',
        },
        {
          id: 'loy-2003',
          type: 'redeem',
          points: -80,
          balanceAfter: 670,
          date: '2024-02-02T19:05:00Z',
          reference: 'reward-512',
          note: 'Redeemed for free appetizer',
        },
        {
          id: 'loy-2004',
          type: 'earn',
          points: 190,
          balanceAfter: 860,
          date: '2024-02-02T19:05:00Z',
          reference: 'ord-4870',
        },
        {
          id: 'loy-2005',
          type: 'earn',
          points: 160,
          balanceAfter: 1020,
          date: '2024-03-08T18:20:00Z',
          reference: 'ord-5088',
        },
        {
          id: 'loy-2006',
          type: 'adjust',
          points: -260,
          balanceAfter: 760,
          date: '2024-03-09T10:00:00Z',
          reference: 'audit-2024-02',
          note: 'Expired points auto-deducted',
        },
      ],
    },
    storeCredits: [
      {
        id: 'credit-2001',
        balance: 20,
        issuedOn: '2024-02-14T00:00:00Z',
        expiresOn: '2024-05-31T23:59:59Z',
        lastUsedOn: '2024-02-18T20:10:00Z',
        ledger: [
          {
            id: 'cred-ledger-2001',
            type: 'issue',
            amount: 20,
            balanceAfter: 20,
            date: '2024-02-14T00:00:00Z',
            reference: 'service-recovery-77',
            note: 'Delayed order make-good',
          },
        ],
      },
      {
        id: 'credit-2002',
        balance: 10,
        issuedOn: '2023-10-05T00:00:00Z',
        expiresOn: '2024-03-31T23:59:59Z',
        ledger: [
          {
            id: 'cred-ledger-2002',
            type: 'issue',
            amount: 10,
            balanceAfter: 10,
            date: '2023-10-05T00:00:00Z',
            reference: 'promo-fall-harvest',
          },
        ],
      },
    ],
    giftCards: [
      {
        code: 'GC-2045',
        originalValue: 50,
        balance: 12.5,
        status: 'active',
        issuedOn: '2023-12-01T00:00:00Z',
        expiresOn: '2024-12-01T23:59:59Z',
        lastUsedOn: '2024-02-02T19:05:00Z',
        purchaseStoreId: 'store-1',
        recipientName: 'Emily Davis',
        transactions: [
          {
            id: 'gift-txn-2045-1',
            type: 'issue',
            amount: 50,
            balanceAfter: 50,
            date: '2023-12-01T00:00:00Z',
            reference: 'gc-sale-992',
          },
          {
            id: 'gift-txn-2045-2',
            type: 'redeem',
            amount: -37.5,
            balanceAfter: 12.5,
            date: '2024-02-02T19:05:00Z',
            reference: 'ord-4870',
          },
        ],
      },
    ],
  },
  {
    id: 'cust-3',
    name: 'Michael Johnson',
    phone: '555-0103',
    email: 'michael.johnson@email.com',
    birthday: '1978-02-11',
    tags: ['Corporate', 'Sommelier'],
    notes: 'Hosts quarterly executive dinners; appreciates curated wine pairings.',
    loyaltyPoints: 2100,
    storeCreditBalance: 45,
    visits: [
      {
        date: '2024-03-15T21:10:00Z',
        storeId: 'store-1',
        orderId: 'ord-5155',
        channel: 'dine-in',
        totalSpend: 248.4,
        pointsEarned: 420,
      },
      {
        date: '2024-02-20T20:30:00Z',
        storeId: 'store-1',
        orderId: 'ord-4951',
        channel: 'dine-in',
        totalSpend: 302.9,
        pointsEarned: 520,
        pointsRedeemed: 200,
      },
      {
        date: '2024-01-22T19:50:00Z',
        storeId: 'store-1',
        orderId: 'ord-4705',
        channel: 'dine-in',
        totalSpend: 275.6,
        pointsEarned: 480,
      },
      {
        date: '2023-12-10T18:35:00Z',
        storeId: 'store-1',
        orderId: 'ord-4389',
        channel: 'dine-in',
        totalSpend: 198.5,
        pointsEarned: 350,
      },
    ],
    loyalty: {
      tier: 'Platinum',
      lifetimePoints: 18420,
      pointsToNextReward: 100,
      lastEarnedOn: '2024-03-15T21:10:00Z',
      lastRedeemedOn: '2024-02-20T20:30:00Z',
      expiring: [
        { points: 240, expiresOn: '2024-08-31T23:59:59Z' },
        { points: 180, expiresOn: '2025-01-31T23:59:59Z' },
      ],
      history: [
        {
          id: 'loy-3001',
          type: 'earn',
          points: 350,
          balanceAfter: 1680,
          date: '2023-12-10T18:35:00Z',
          reference: 'ord-4389',
        },
        {
          id: 'loy-3002',
          type: 'earn',
          points: 480,
          balanceAfter: 2160,
          date: '2024-01-22T19:50:00Z',
          reference: 'ord-4705',
        },
        {
          id: 'loy-3003',
          type: 'redeem',
          points: -200,
          balanceAfter: 1960,
          date: '2024-02-20T20:30:00Z',
          reference: 'reward-640',
          note: 'Redeemed for $20 off wine pairing',
        },
        {
          id: 'loy-3004',
          type: 'earn',
          points: 520,
          balanceAfter: 2480,
          date: '2024-02-20T20:30:00Z',
          reference: 'ord-4951',
        },
        {
          id: 'loy-3005',
          type: 'earn',
          points: 420,
          balanceAfter: 2900,
          date: '2024-03-15T21:10:00Z',
          reference: 'ord-5155',
        },
        {
          id: 'loy-3006',
          type: 'adjust',
          points: -800,
          balanceAfter: 2100,
          date: '2024-03-18T14:20:00Z',
          reference: 'audit-2024-03',
          note: 'Converted expiring promo points',
        },
      ],
    },
    storeCredits: [
      {
        id: 'credit-3001',
        balance: 25,
        issuedOn: '2024-01-01T00:00:00Z',
        expiresOn: '2024-09-30T23:59:59Z',
        lastUsedOn: '2024-02-20T20:30:00Z',
        ledger: [
          {
            id: 'cred-ledger-3001',
            type: 'issue',
            amount: 25,
            balanceAfter: 25,
            date: '2024-01-01T00:00:00Z',
            reference: 'vip-bonus-q1',
          },
        ],
      },
      {
        id: 'credit-3002',
        balance: 20,
        issuedOn: '2023-09-10T00:00:00Z',
        expiresOn: '2024-04-15T23:59:59Z',
        ledger: [
          {
            id: 'cred-ledger-3002',
            type: 'issue',
            amount: 20,
            balanceAfter: 20,
            date: '2023-09-10T00:00:00Z',
            reference: 'corporate-invoice-adj',
            note: 'Round down invoice credit',
          },
        ],
      },
    ],
    giftCards: [
      {
        code: 'GC-3050',
        originalValue: 100,
        balance: 0,
        status: 'redeemed',
        issuedOn: '2023-06-15T00:00:00Z',
        expiresOn: '2024-06-15T23:59:59Z',
        lastUsedOn: '2024-01-22T19:50:00Z',
        purchaseStoreId: 'store-1',
        recipientName: 'Michael Johnson',
        transactions: [
          {
            id: 'gift-txn-3050-1',
            type: 'issue',
            amount: 100,
            balanceAfter: 100,
            date: '2023-06-15T00:00:00Z',
            reference: 'gc-sale-720',
          },
          {
            id: 'gift-txn-3050-2',
            type: 'redeem',
            amount: -100,
            balanceAfter: 0,
            date: '2024-01-22T19:50:00Z',
            reference: 'ord-4705',
            note: 'Redeemed in full',
          },
        ],
      },
      {
        code: 'GC-3051',
        originalValue: 150,
        balance: 150,
        status: 'active',
        issuedOn: '2024-03-01T00:00:00Z',
        expiresOn: '2025-03-01T23:59:59Z',
        purchaseStoreId: 'store-1',
        recipientName: 'Michael Johnson',
        transactions: [
          {
            id: 'gift-txn-3051-1',
            type: 'issue',
            amount: 150,
            balanceAfter: 150,
            date: '2024-03-01T00:00:00Z',
            reference: 'gc-sale-1044',
            note: 'Corporate thank you gift',
          },
        ],
      },
    ],
  },
  {
    id: 'cust-4',
    name: 'Sofia Patel',
    phone: '555-0104',
    email: 'sofia.patel@email.com',
    birthday: '1994-12-27',
    tags: ['Takeaway Regular'],
    notes: 'Prefers text notifications; gluten-free dietary preference.',
    loyaltyPoints: 320,
    storeCreditBalance: 0,
    visits: [
      {
        date: '2024-03-10T12:05:00Z',
        storeId: 'store-1',
        orderId: 'ord-5061',
        channel: 'delivery',
        totalSpend: 48.2,
        pointsEarned: 90,
      },
      {
        date: '2024-02-16T13:20:00Z',
        storeId: 'store-1',
        orderId: 'ord-4912',
        channel: 'takeaway',
        totalSpend: 36.75,
        pointsEarned: 70,
      },
      {
        date: '2024-01-28T18:10:00Z',
        storeId: 'store-1',
        orderId: 'ord-4766',
        channel: 'delivery',
        totalSpend: 42.3,
        pointsEarned: 80,
      },
      {
        date: '2023-12-05T19:25:00Z',
        storeId: 'store-1',
        orderId: 'ord-4361',
        channel: 'takeaway',
        totalSpend: 39.95,
        pointsEarned: 80,
      },
    ],
    loyalty: {
      tier: 'Bronze',
      lifetimePoints: 2480,
      pointsToNextReward: 180,
      lastEarnedOn: '2024-03-10T12:05:00Z',
      lastRedeemedOn: '2023-11-02T17:00:00Z',
      expiring: [
        { points: 45, expiresOn: '2024-05-15T23:59:59Z' },
      ],
      history: [
        {
          id: 'loy-4001',
          type: 'earn',
          points: 80,
          balanceAfter: 260,
          date: '2023-12-05T19:25:00Z',
          reference: 'ord-4361',
        },
        {
          id: 'loy-4002',
          type: 'earn',
          points: 80,
          balanceAfter: 340,
          date: '2024-01-28T18:10:00Z',
          reference: 'ord-4766',
        },
        {
          id: 'loy-4003',
          type: 'earn',
          points: 70,
          balanceAfter: 410,
          date: '2024-02-16T13:20:00Z',
          reference: 'ord-4912',
        },
        {
          id: 'loy-4004',
          type: 'earn',
          points: 90,
          balanceAfter: 500,
          date: '2024-03-10T12:05:00Z',
          reference: 'ord-5061',
        },
        {
          id: 'loy-4005',
          type: 'adjust',
          points: -180,
          balanceAfter: 320,
          date: '2024-03-11T08:30:00Z',
          reference: 'auto-expiry',
          note: 'Expired November points',
        },
      ],
    },
    storeCredits: [],
    giftCards: [],
  },
];

const normalizeSearch = (value: string) => value.trim().toLowerCase();

export interface CustomerProfileSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tags: string[];
  loyaltyTier: string;
  loyaltyPoints: number;
  storeCreditBalance: number;
  totalVisits: number;
  lastVisit?: string;
  averageSpend: number;
  lifetimeSpend: number;
  birthday?: string;
  notes?: string;
}

export const useCustomerProfiles = (searchTerm = ''): CustomerProfileSummary[] => {
  return useMemo(() => {
    const query = normalizeSearch(searchTerm);

    return mockCustomers
      .filter((customer) => {
        if (!query) return true;

        const haystack = [
          customer.name,
          customer.email ?? '',
          customer.phone ?? '',
          customer.tags?.join(' ') ?? '',
          customer.notes ?? '',
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      })
      .map<CustomerProfileSummary>((customer) => {
        const sortedVisits = [...customer.visits].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        const lifetimeSpend = customer.visits.reduce((sum, visit) => sum + visit.totalSpend, 0);
        const totalVisits = customer.visits.length;

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          tags: customer.tags ?? [],
          loyaltyTier: customer.loyalty.tier,
          loyaltyPoints: customer.loyaltyPoints,
          storeCreditBalance: customer.storeCreditBalance,
          totalVisits,
          lastVisit: sortedVisits[0]?.date,
          averageSpend: totalVisits ? lifetimeSpend / totalVisits : 0,
          lifetimeSpend,
          birthday: customer.birthday,
          notes: customer.notes,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm]);
};

export interface CustomerLoyaltySummary {
  customerId: string;
  name: string;
  tier: string;
  points: number;
  lifetimePoints: number;
  pointsToNextReward: number;
  lastEarnedOn?: string;
  lastRedeemedOn?: string;
  expiringPoints?: number;
  nextExpiration?: string;
}

export const useLoyaltyAccounts = (searchTerm = ''): CustomerLoyaltySummary[] => {
  return useMemo(() => {
    const query = normalizeSearch(searchTerm);

    return mockCustomers
      .filter((customer) => {
        if (!query) return true;
        const haystack = [customer.name, customer.loyalty.tier]
          .concat(customer.tags ?? [])
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .map<CustomerLoyaltySummary>((customer) => {
        const upcoming = customer.loyalty.expiring
          ?.slice()
          .sort((a, b) => new Date(a.expiresOn).getTime() - new Date(b.expiresOn).getTime())[0];

        return {
          customerId: customer.id,
          name: customer.name,
          tier: customer.loyalty.tier,
          points: customer.loyaltyPoints,
          lifetimePoints: customer.loyalty.lifetimePoints,
          pointsToNextReward: customer.loyalty.pointsToNextReward,
          lastEarnedOn: customer.loyalty.lastEarnedOn,
          lastRedeemedOn: customer.loyalty.lastRedeemedOn,
          expiringPoints: upcoming?.points,
          nextExpiration: upcoming?.expiresOn,
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [searchTerm]);
};

export interface CustomerStoreCreditSummary {
  customerId: string;
  name: string;
  totalBalance: number;
  accountCount: number;
  nextExpirationAmount?: number;
  nextExpirationDate?: string;
  lastUsedOn?: string;
}

export const useStoreCreditAccounts = (searchTerm = ''): CustomerStoreCreditSummary[] => {
  return useMemo(() => {
    const query = normalizeSearch(searchTerm);

    return mockCustomers
      .filter((customer) => {
        if (!query) return true;
        const haystack = [customer.name, customer.email ?? '', customer.phone ?? '']
          .concat(customer.tags ?? [])
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .map<CustomerStoreCreditSummary>((customer) => {
        const totalBalance = customer.storeCredits.reduce((sum, credit) => sum + credit.balance, 0);
        const upcoming = customer.storeCredits
          .filter((credit) => Boolean(credit.expiresOn))
          .sort((a, b) =>
            new Date(a.expiresOn ?? 0).getTime() - new Date(b.expiresOn ?? 0).getTime(),
          )[0];
        const lastUsedOn = customer.storeCredits
          .map((credit) => credit.lastUsedOn)
          .filter(Boolean)
          .sort((a, b) => new Date(b ?? 0).getTime() - new Date(a ?? 0).getTime())[0];

        return {
          customerId: customer.id,
          name: customer.name,
          totalBalance,
          accountCount: customer.storeCredits.length,
          nextExpirationAmount: upcoming?.balance,
          nextExpirationDate: upcoming?.expiresOn,
          lastUsedOn,
        };
      })
      .filter((summary) => summary.accountCount > 0)
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }, [searchTerm]);
};

export interface GiftCardSummary {
  code: string;
  customerId: string;
  customerName: string;
  balance: number;
  originalValue: number;
  status: GiftCard['status'];
  issuedOn: string;
  expiresOn?: string;
  lastUsedOn?: string;
}

export const useGiftCardSummaries = (searchTerm = ''): GiftCardSummary[] => {
  return useMemo(() => {
    const query = normalizeSearch(searchTerm);

    const cards = mockCustomers.flatMap((customer) =>
      customer.giftCards.map<GiftCardSummary>((card) => ({
        code: card.code,
        customerId: customer.id,
        customerName: customer.name,
        balance: card.balance,
        originalValue: card.originalValue,
        status: card.status,
        issuedOn: card.issuedOn,
        expiresOn: card.expiresOn,
        lastUsedOn: card.lastUsedOn,
      })),
    );

    return cards
      .filter((card) => {
        if (!query) return true;
        const haystack = [card.code, card.customerName]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [searchTerm]);
};

export const useCustomerById = (customerId?: string | null): Customer | undefined => {
  return useMemo(() => {
    if (!customerId) return undefined;
    return mockCustomers.find((customer) => customer.id === customerId);
  }, [customerId]);
};

export const useVisitHistory = (customerId?: string | null): CustomerVisit[] => {
  const customer = useCustomerById(customerId);

  return useMemo(() => {
    if (!customer) return [];
    return [...customer.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer]);
};

export const useGiftCardDetails = (
  code?: string | null,
): { customer: Customer; card: GiftCard } | undefined => {
  return useMemo(() => {
    if (!code) return undefined;

    for (const customer of mockCustomers) {
      const card = customer.giftCards.find((gift) => gift.code === code);
      if (card) {
        return { customer, card };
      }
    }

    return undefined;
  }, [code]);
};

export const getCustomerById = (customerId: string): Customer | undefined =>
  mockCustomers.find((customer) => customer.id === customerId);
