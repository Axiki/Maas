import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AuditActor, AuditEntryStatus, AuditTrailEntry } from '../types';

export interface DiscountApprovalLogInput {
  itemId: string;
  discountAmount: number;
  discountPercent: number;
  status: AuditEntryStatus;
  requiresApproval: boolean;
  requestedBy?: AuditActor | null;
  approver?: AuditActor | null;
  reason?: string;
  source?: AuditTrailEntry['source'];
}

interface AuditTrailState {
  entries: AuditTrailEntry[];
  logDiscountApproval: (payload: DiscountApprovalLogInput) => void;
  clear: () => void;
}

export const useAuditTrailStore = create<AuditTrailState>((set) => ({
  entries: [],
  logDiscountApproval: ({
    itemId,
    discountAmount,
    discountPercent,
    status,
    requiresApproval,
    requestedBy = null,
    approver = null,
    reason,
    source = 'pos'
  }) => {
    const entry: AuditTrailEntry = {
      id: uuidv4(),
      type: 'discount-approval',
      status,
      actor: requestedBy,
      approver,
      target: {
        type: 'cart-item',
        id: itemId
      },
      metadata: {
        discountAmount,
        discountPercent,
        requiresApproval,
        reason: reason ?? null
      },
      timestamp: new Date().toISOString(),
      source
    };

    set((state) => ({ entries: [entry, ...state.entries] }));
  },
  clear: () => set({ entries: [] })
}));
