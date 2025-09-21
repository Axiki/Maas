import { DiscountRule, UserRole } from '../types';

export const defaultDiscountReasons: string[] = [
  'Customer Recovery',
  'Promotional Match',
  'Service Recovery',
  'Manager Discretion',
  'Staff Hospitality'
];

const buildRule = (rule: DiscountRule): DiscountRule => rule;

export const defaultDiscountRules: Record<UserRole, DiscountRule> = {
  cashier: buildRule({
    role: 'cashier',
    maxSelfDiscountPercent: 10,
    maxManagerDiscountPercent: 40,
    approvalRoles: ['manager', 'owner']
  }),
  waiter: buildRule({
    role: 'waiter',
    maxSelfDiscountPercent: 15,
    maxManagerDiscountPercent: 45,
    approvalRoles: ['manager', 'owner']
  }),
  bartender: buildRule({
    role: 'bartender',
    maxSelfDiscountPercent: 12,
    maxManagerDiscountPercent: 40,
    approvalRoles: ['manager', 'owner']
  }),
  supervisor: buildRule({
    role: 'supervisor',
    maxSelfDiscountPercent: 20,
    maxManagerDiscountPercent: 55,
    approvalRoles: ['manager', 'owner']
  }),
  manager: buildRule({
    role: 'manager',
    maxSelfDiscountPercent: 50,
    maxManagerDiscountPercent: 100,
    approvalRoles: ['manager', 'owner']
  }),
  owner: buildRule({
    role: 'owner',
    maxSelfDiscountPercent: 100,
    maxManagerDiscountPercent: 100,
    approvalRoles: ['owner']
  })
};

export const approverPins: Partial<Record<UserRole, string>> = {
  manager: '1234',
  owner: '0000'
};

export const validateApprovalPin = (
  pin: string,
  allowedRoles: UserRole[]
): UserRole | null => {
  const sanitizedPin = pin.trim();
  if (!sanitizedPin) {
    return null;
  }

  const matchedRole = allowedRoles.find((role) => approverPins[role] === sanitizedPin);
  return matchedRole ?? null;
};

export const cloneDefaultDiscountRules = (): Record<UserRole, DiscountRule> => {
  const entries = Object.entries(defaultDiscountRules) as Array<[
    UserRole,
    DiscountRule
  ]>;

  return entries.reduce<Record<UserRole, DiscountRule>>((acc, [role, rule]) => {
    acc[role] = { ...rule, approvalRoles: [...rule.approvalRoles] };
    return acc;
  }, {} as Record<UserRole, DiscountRule>);
};
