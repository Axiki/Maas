import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { cloneDefaultDiscountRules, defaultDiscountReasons } from '../config/permissions';
import { DiscountRule, UserRole } from '../types';

const clampPercent = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};

interface DiscountState {
  rules: Record<UserRole, DiscountRule>;
  reasons: string[];
  updateRule: (role: UserRole, updates: Partial<Omit<DiscountRule, 'role'>>) => void;
  addReason: (reason: string) => void;
  removeReason: (reason: string) => void;
}

const createInitialRules = (): Record<UserRole, DiscountRule> => cloneDefaultDiscountRules();

export const useDiscountStore = create<DiscountState>()(
  persist(
    (set) => ({
      rules: createInitialRules(),
      reasons: [...defaultDiscountReasons],
      updateRule: (role, updates) =>
        set((state) => {
          const currentRule = state.rules[role] ?? {
            role,
            maxSelfDiscountPercent: 0,
            maxManagerDiscountPercent: 0,
            approvalRoles:
              cloneDefaultDiscountRules()[role]?.approvalRoles.slice() ?? []
          };

          const nextSelf = updates.maxSelfDiscountPercent ?? currentRule.maxSelfDiscountPercent;
          const nextManager = updates.maxManagerDiscountPercent ?? currentRule.maxManagerDiscountPercent;

          const clampedSelf = clampPercent(nextSelf);
          let clampedManager = clampPercent(nextManager);
          if (clampedManager < clampedSelf) {
            clampedManager = clampedSelf;
          }

          const nextRule: DiscountRule = {
            ...currentRule,
            ...updates,
            role,
            maxSelfDiscountPercent: clampedSelf,
            maxManagerDiscountPercent: clampedManager,
            approvalRoles: [
              ...(updates.approvalRoles ?? currentRule.approvalRoles)
            ]
          };

          return {
            rules: {
              ...state.rules,
              [role]: nextRule
            }
          };
        }),
      addReason: (reason) =>
        set((state) => {
          const trimmed = reason.trim();
          if (!trimmed) {
            return {};
          }

          const exists = state.reasons.some(
            (item) => item.toLowerCase() === trimmed.toLowerCase()
          );
          if (exists) {
            return {};
          }

          return {
            reasons: [...state.reasons, trimmed]
          };
        }),
      removeReason: (reason) =>
        set((state) => ({
          reasons: state.reasons.filter((item) => item !== reason)
        }))
    }),
    {
      name: 'mas-discount-store',
      version: 1,
      partialize: (state) => ({
        rules: state.rules,
        reasons: state.reasons
      })
    }
  )
);
