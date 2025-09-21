import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Store, Tenant, PermissionKey, DeviceContext, UserRole } from '../types';
import { verifyPinHash } from '../utils';

const PIN_VALIDITY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

type PinVerificationState = {
  verifiedActions: Partial<Record<PermissionKey, number>>;
  lastVerifiedAt?: number;
};

const defaultPinVerification: PinVerificationState = {
  verifiedActions: {},
  lastVerifiedAt: undefined,
};

const rolePermissions: Record<UserRole, PermissionKey[]> = {
  cashier: ['pos.processPayment'],
  waiter: ['pos.processPayment'],
  bartender: ['pos.processPayment'],
  supervisor: ['pos.processPayment', 'pos.voidItem', 'backoffice.manageSecurity'],
  manager: [
    'pos.processPayment',
    'pos.voidItem',
    'backoffice.manageSecurity',
    'backoffice.configureTwoFactor',
  ],
  owner: [
    'pos.processPayment',
    'pos.voidItem',
    'backoffice.manageSecurity',
    'backoffice.configureTwoFactor',
  ],
};

const pinProtectedActions: PermissionKey[] = ['pos.processPayment', 'pos.voidItem'];

const derivePermissions = (role: UserRole): PermissionKey[] => rolePermissions[role] ?? [];

const shouldPersistAction = (timestamp?: number) => {
  if (!timestamp) {
    return false;
  }
  return Date.now() - timestamp <= PIN_VALIDITY_WINDOW_MS;
};

interface AuthState {
  user: User | null;
  store: Store | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  deviceContext: DeviceContext;
  permissions: PermissionKey[];
  pinVerification: PinVerificationState;
  login: (user: User, store: Store, tenant: Tenant) => void;
  logout: () => void;
  setOnlineStatus: (status: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  validatePin: (pin: string) => boolean;
  requirePinForAction: (action: PermissionKey) => boolean;
  recordPinVerification: (action: PermissionKey) => void;
  resetPinVerifications: () => void;
  setDeviceContext: (context: DeviceContext) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      store: null,
      tenant: null,
      isAuthenticated: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      deviceContext: 'backoffice',
      permissions: [],
      pinVerification: { ...defaultPinVerification },

      login: (user, store, tenant) => {
        set({
          user,
          store,
          tenant,
          isAuthenticated: true,
          permissions: derivePermissions(user.role),
          pinVerification: { ...defaultPinVerification },
        });
      },

      logout: () => {
        set({
          user: null,
          store: null,
          tenant: null,
          isAuthenticated: false,
          permissions: [],
          pinVerification: { ...defaultPinVerification },
        });
      },

      setOnlineStatus: (status) => {
        set({ isOnline: status });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          const nextUser = { ...user, ...updates };
          set({
            user: nextUser,
            permissions: derivePermissions(nextUser.role),
            pinVerification: { ...defaultPinVerification },
          });
        }
      },

      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      validatePin: (pin) => {
        const { user } = get();
        if (!user?.security?.pinHash) {
          return false;
        }

        return verifyPinHash(pin, user.security.pinHash);
      },

      requirePinForAction: (action) => {
        const { user, pinVerification } = get();

        if (!user?.security?.pinHash) {
          return false;
        }

        if (!pinProtectedActions.includes(action)) {
          return false;
        }

        const verifiedAt = pinVerification.verifiedActions[action];
        return !shouldPersistAction(verifiedAt);
      },

      recordPinVerification: (action) => {
        set((state) => ({
          pinVerification: {
            verifiedActions: {
              ...state.pinVerification.verifiedActions,
              [action]: Date.now(),
            },
            lastVerifiedAt: Date.now(),
          },
        }));
      },

      resetPinVerifications: () => {
        set({ pinVerification: { ...defaultPinVerification } });
      },

      setDeviceContext: (context) => {
        set({ deviceContext: context });
      },
    }),
    {
      name: 'mas-auth-store',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
        deviceContext: state.deviceContext,
        permissions: state.permissions,
      })
    }
  )
);

// Setup online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAuthStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useAuthStore.getState().setOnlineStatus(false);
  });
}