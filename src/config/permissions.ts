import { AuditActor, UserRole } from '../types';

export interface DiscountThreshold {
  maxPercentageWithoutApproval: number;
  maxPercentageWithApproval: number;
  approvalRole: UserRole;
}

const DEFAULT_ROLE: UserRole = 'cashier';

const ROLE_ORDER: UserRole[] = [
  'cashier',
  'waiter',
  'bartender',
  'supervisor',
  'manager',
  'owner'
];

export const DISCOUNT_THRESHOLDS: Record<UserRole, DiscountThreshold> = {
  cashier: {
    maxPercentageWithoutApproval: 10,
    maxPercentageWithApproval: 30,
    approvalRole: 'manager'
  },
  waiter: {
    maxPercentageWithoutApproval: 10,
    maxPercentageWithApproval: 30,
    approvalRole: 'manager'
  },
  bartender: {
    maxPercentageWithoutApproval: 10,
    maxPercentageWithApproval: 30,
    approvalRole: 'manager'
  },
  supervisor: {
    maxPercentageWithoutApproval: 30,
    maxPercentageWithApproval: 50,
    approvalRole: 'manager'
  },
  manager: {
    maxPercentageWithoutApproval: 50,
    maxPercentageWithApproval: 100,
    approvalRole: 'manager'
  },
  owner: {
    maxPercentageWithoutApproval: 100,
    maxPercentageWithApproval: 100,
    approvalRole: 'owner'
  }
};

interface ApprovalDirectoryEntry extends AuditActor {
  pin: string;
}

const APPROVER_DIRECTORY: ApprovalDirectoryEntry[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    role: 'manager',
    pin: '1234'
  },
  {
    id: 'owner-1',
    name: 'Demo Owner',
    role: 'owner',
    pin: '0000'
  }
];

const roleRank = (role: UserRole): number => ROLE_ORDER.indexOf(role);

export const canRoleApprove = (approverRole: UserRole, requiredRole: UserRole): boolean => {
  return roleRank(approverRole) >= roleRank(requiredRole);
};

export const getDiscountThresholdForRole = (role?: UserRole): DiscountThreshold => {
  if (!role) {
    return DISCOUNT_THRESHOLDS[DEFAULT_ROLE];
  }
  return DISCOUNT_THRESHOLDS[role] ?? DISCOUNT_THRESHOLDS[DEFAULT_ROLE];
};

export const validateApprovalPin = (pin: string, requiredRole: UserRole): AuditActor | null => {
  const entry = APPROVER_DIRECTORY.find(
    (candidate) => candidate.pin === pin && canRoleApprove(candidate.role, requiredRole)
  );

  if (!entry) {
    return null;
  }

  const { id, name, role } = entry;
  return { id, name, role };
};

export const getApprovalDirectory = (): ApprovalDirectoryEntry[] => [...APPROVER_DIRECTORY];
