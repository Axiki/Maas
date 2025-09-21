import { Customer } from '../types';

export type CustomerTransactionType = 'purchase' | 'refund' | 'adjustment' | 'reward' | 'redemption';
export type CustomerTransactionChannel = 'POS' | 'Online' | 'Phone';

export interface CustomerTransaction {
  id: string;
  customerId: string;
  type: CustomerTransactionType;
  amount: number;
  pointsEarned: number;
  createdAt: string;
  channel: CustomerTransactionChannel;
  note?: string;
}

export interface LoyaltyHistoryEntry {
  id: string;
  change: number;
  reason: string;
  createdAt: string;
  balanceAfter: number;
}

export interface CustomerLoyaltyProfile {
  balance: number;
  tier: string;
  nextTier?: string;
  pointsToNextTier?: number;
  expiryDate: string;
  lastEarned: string;
  history: LoyaltyHistoryEntry[];
}

export interface StoreCreditHistoryEntry {
  id: string;
  change: number;
  reason: string;
  createdAt: string;
  user: string;
}

export interface CustomerStoreCreditProfile {
  balance: number;
  currency: string;
  lastUpdated: string;
  history: StoreCreditHistoryEntry[];
}

export type GiftCardStatus = 'active' | 'redeemed' | 'expired';

export interface CustomerGiftCard {
  id: string;
  cardNumber: string;
  balance: number;
  issuedOn: string;
  expiresOn: string;
  status: GiftCardStatus;
}

export interface CustomerProfile extends Customer {
  tier: string;
  visits: number;
  totalSpend: number;
  lastVisit: string;
  tags: string[];
  loyalty: CustomerLoyaltyProfile;
  storeCredit: CustomerStoreCreditProfile;
  giftCards: CustomerGiftCard[];
  transactions: CustomerTransaction[];
}

export const mockCustomerProfiles: CustomerProfile[] = [
  {
    id: 'cust-100',
    name: 'Ava Martinez',
    phone: '(555) 010-0164',
    email: 'ava.martinez@example.com',
    loyaltyPoints: 1420,
    storeCreditBalance: 45.5,
    tier: 'Ember',
    visits: 18,
    totalSpend: 1298.45,
    lastVisit: '2024-08-12T14:20:00Z',
    tags: ['Patio dining', 'Shellfish allergy'],
    loyalty: {
      balance: 1420,
      tier: 'Ember',
      nextTier: 'Inferno',
      pointsToNextTier: 580,
      expiryDate: '2025-02-01T00:00:00Z',
      lastEarned: '2024-08-12T14:20:00Z',
      history: [
        {
          id: 'ava-loy-1',
          change: 120,
          reason: 'Dinner for two',
          createdAt: '2024-08-12T14:20:00Z',
          balanceAfter: 1420
        },
        {
          id: 'ava-loy-2',
          change: 180,
          reason: 'Birthday celebration package',
          createdAt: '2024-06-28T18:10:00Z',
          balanceAfter: 1300
        },
        {
          id: 'ava-loy-3',
          change: -40,
          reason: 'Redeemed welcome dessert',
          createdAt: '2024-05-19T19:45:00Z',
          balanceAfter: 1120
        }
      ]
    },
    storeCredit: {
      balance: 45.5,
      currency: 'USD',
      lastUpdated: '2024-07-22T10:10:00Z',
      history: [
        {
          id: 'ava-credit-1',
          change: 20,
          reason: 'Manager adjustment for wait time',
          createdAt: '2024-07-22T10:10:00Z',
          user: 'Sarah Johnson'
        },
        {
          id: 'ava-credit-2',
          change: -15,
          reason: 'Applied to check #3815',
          createdAt: '2024-06-02T20:12:00Z',
          user: 'POS Checkout'
        },
        {
          id: 'ava-credit-3',
          change: 40.5,
          reason: 'Refund from catering deposit',
          createdAt: '2024-04-18T11:55:00Z',
          user: 'Finance Desk'
        }
      ]
    },
    giftCards: [
      {
        id: 'ava-gift-1',
        cardNumber: '5274 8890',
        balance: 25,
        issuedOn: '2024-05-05T12:00:00Z',
        expiresOn: '2025-05-05T00:00:00Z',
        status: 'active'
      },
      {
        id: 'ava-gift-2',
        cardNumber: '4411 0934',
        balance: 0,
        issuedOn: '2023-12-10T08:30:00Z',
        expiresOn: '2024-12-10T00:00:00Z',
        status: 'redeemed'
      }
    ],
    transactions: [
      {
        id: 'ava-txn-1',
        customerId: 'cust-100',
        type: 'purchase',
        amount: 128.5,
        pointsEarned: 120,
        createdAt: '2024-08-12T14:20:00Z',
        channel: 'POS',
        note: 'Dinner for two - patio seating'
      },
      {
        id: 'ava-txn-2',
        customerId: 'cust-100',
        type: 'reward',
        amount: 0,
        pointsEarned: -40,
        createdAt: '2024-05-19T19:45:00Z',
        channel: 'POS',
        note: 'Complimentary dessert redemption'
      },
      {
        id: 'ava-txn-3',
        customerId: 'cust-100',
        type: 'adjustment',
        amount: 0,
        pointsEarned: 0,
        createdAt: '2024-04-18T11:55:00Z',
        channel: 'Phone',
        note: 'Catering deposit refund applied to store credit'
      }
    ]
  },
  {
    id: 'cust-204',
    name: 'Logan Chen',
    phone: '(555) 010-2229',
    email: 'logan.chen@example.com',
    loyaltyPoints: 820,
    storeCreditBalance: 10,
    tier: 'Spark',
    visits: 9,
    totalSpend: 684.1,
    lastVisit: '2024-07-30T17:05:00Z',
    tags: ['Gluten-friendly requests'],
    loyalty: {
      balance: 820,
      tier: 'Spark',
      nextTier: 'Ember',
      pointsToNextTier: 180,
      expiryDate: '2024-11-15T00:00:00Z',
      lastEarned: '2024-07-30T17:05:00Z',
      history: [
        {
          id: 'logan-loy-1',
          change: 95,
          reason: 'Happy hour small plates',
          createdAt: '2024-07-30T17:05:00Z',
          balanceAfter: 820
        },
        {
          id: 'logan-loy-2',
          change: 210,
          reason: 'Family dinner for four',
          createdAt: '2024-06-14T19:30:00Z',
          balanceAfter: 725
        },
        {
          id: 'logan-loy-3',
          change: -80,
          reason: 'Points redeemed toward entree',
          createdAt: '2024-04-09T18:45:00Z',
          balanceAfter: 515
        }
      ]
    },
    storeCredit: {
      balance: 10,
      currency: 'USD',
      lastUpdated: '2024-05-02T09:18:00Z',
      history: [
        {
          id: 'logan-credit-1',
          change: 10,
          reason: 'Courtesy credit for to-go delay',
          createdAt: '2024-05-02T09:18:00Z',
          user: 'Store Manager'
        }
      ]
    },
    giftCards: [
      {
        id: 'logan-gift-1',
        cardNumber: '7745 2901',
        balance: 50,
        issuedOn: '2024-03-01T15:00:00Z',
        expiresOn: '2025-03-01T00:00:00Z',
        status: 'active'
      }
    ],
    transactions: [
      {
        id: 'logan-txn-1',
        customerId: 'cust-204',
        type: 'purchase',
        amount: 78.9,
        pointsEarned: 95,
        createdAt: '2024-07-30T17:05:00Z',
        channel: 'POS',
        note: 'Shared plates and cocktails'
      },
      {
        id: 'logan-txn-2',
        customerId: 'cust-204',
        type: 'purchase',
        amount: 162.4,
        pointsEarned: 210,
        createdAt: '2024-06-14T19:30:00Z',
        channel: 'POS',
        note: 'Family dinner (table 12)'
      },
      {
        id: 'logan-txn-3',
        customerId: 'cust-204',
        type: 'reward',
        amount: -15,
        pointsEarned: -80,
        createdAt: '2024-04-09T18:45:00Z',
        channel: 'POS',
        note: 'Applied loyalty discount'
      }
    ]
  },
  {
    id: 'cust-305',
    name: 'Priya Patel',
    phone: '(555) 010-3408',
    email: 'priya.patel@example.com',
    loyaltyPoints: 1980,
    storeCreditBalance: 0,
    tier: 'Inferno',
    visits: 24,
    totalSpend: 1856.74,
    lastVisit: '2024-08-02T20:40:00Z',
    tags: ['Chef specials enthusiast'],
    loyalty: {
      balance: 1980,
      tier: 'Inferno',
      expiryDate: '2025-03-22T00:00:00Z',
      lastEarned: '2024-08-02T20:40:00Z',
      history: [
        {
          id: 'priya-loy-1',
          change: 220,
          reason: 'Chef tasting menu',
          createdAt: '2024-08-02T20:40:00Z',
          balanceAfter: 1980
        },
        {
          id: 'priya-loy-2',
          change: 340,
          reason: 'Private dining event',
          createdAt: '2024-06-21T21:15:00Z',
          balanceAfter: 1760
        },
        {
          id: 'priya-loy-3',
          change: -120,
          reason: 'Redeemed chef table upgrade',
          createdAt: '2024-03-22T19:00:00Z',
          balanceAfter: 1420
        }
      ]
    },
    storeCredit: {
      balance: 0,
      currency: 'USD',
      lastUpdated: '2024-02-11T12:00:00Z',
      history: [
        {
          id: 'priya-credit-1',
          change: -30,
          reason: 'Applied toward wine pairing',
          createdAt: '2024-02-11T12:00:00Z',
          user: 'POS Checkout'
        }
      ]
    },
    giftCards: [
      {
        id: 'priya-gift-1',
        cardNumber: '9822 4411',
        balance: 0,
        issuedOn: '2023-11-05T10:00:00Z',
        expiresOn: '2024-11-05T00:00:00Z',
        status: 'expired'
      },
      {
        id: 'priya-gift-2',
        cardNumber: '6601 7719',
        balance: 75,
        issuedOn: '2024-07-10T13:30:00Z',
        expiresOn: '2025-07-10T00:00:00Z',
        status: 'active'
      }
    ],
    transactions: [
      {
        id: 'priya-txn-1',
        customerId: 'cust-305',
        type: 'purchase',
        amount: 245.75,
        pointsEarned: 220,
        createdAt: '2024-08-02T20:40:00Z',
        channel: 'POS',
        note: 'Chef tasting experience'
      },
      {
        id: 'priya-txn-2',
        customerId: 'cust-305',
        type: 'purchase',
        amount: 480.25,
        pointsEarned: 340,
        createdAt: '2024-06-21T21:15:00Z',
        channel: 'POS',
        note: 'Private dining event'
      },
      {
        id: 'priya-txn-3',
        customerId: 'cust-305',
        type: 'reward',
        amount: -60,
        pointsEarned: -120,
        createdAt: '2024-03-22T19:00:00Z',
        channel: 'POS',
        note: 'Chef table upgrade redemption'
      }
    ]
  }
];
