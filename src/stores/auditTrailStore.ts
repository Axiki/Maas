import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { DiscountApprovalEvent } from '../types';

interface AuditTrailState {
  approvals: DiscountApprovalEvent[];
  logApproval: (
    event: Omit<DiscountApprovalEvent, 'id' | 'timestamp'> & { timestamp?: Date }
  ) => void;
  clear: () => void;
}

export const useAuditTrailStore = create<AuditTrailState>((set) => ({
  approvals: [],
  logApproval: (event) =>
    set((state) => ({
      approvals: [
        {
          id: uuidv4(),
          timestamp: event.timestamp ?? new Date(),
          ...event
        },
        ...state.approvals
      ]
    })),
  clear: () => set({ approvals: [] })
}));
