import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Store, Tenant, RolePermissions, RestrictedPosAction, UserRole, MultifactorState } from '../types';
import {
  verifyPinHash,
  generateRecoveryCodes,
  generateTemporarySecret,
  generatePreviewTotpCodes,
  verifyTotpCode
} from '../utils/security';

type RolePermissionMatrix = Record<UserRole, RolePermissions>;

const rolePermissionMatrix: RolePermissionMatrix = {
  cashier: {
    role: 'cashier',
    permittedWithoutPin: [],
    requiresPin: ['void-order', 'process-refund', 'manager-discount']
  },
  waiter: {
    role: 'waiter',
    permittedWithoutPin: ['manager-discount'],
    requiresPin: ['void-order', 'process-refund']
  },
  bartender: {
    role: 'bartender',
    permittedWithoutPin: ['manager-discount'],
    requiresPin: ['void-order', 'process-refund']
  },
  supervisor: {
    role: 'supervisor',
    permittedWithoutPin: ['manager-discount', 'process-refund'],
    requiresPin: ['void-order']
  },
  manager: {
    role: 'manager',
    permittedWithoutPin: ['manager-discount', 'process-refund'],
    requiresPin: ['void-order']
  },
  owner: {
    role: 'owner',
    permittedWithoutPin: ['void-order', 'process-refund', 'manager-discount'],
    requiresPin: []
  }
};

const defaultMfaState: MultifactorState = {
  status: 'disabled',
  method: 'totp',
  recoveryCodes: []
};

interface AuthState {
  user: User | null;
  store: Store | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  rolePermissions: RolePermissions | null;
  mfa: MultifactorState;
  login: (user: User, store: Store, tenant: Tenant) => void;
  logout: () => void;
  setOnlineStatus: (status: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  refreshPermissions: (role: UserRole) => void;
  beginMfaEnrollment: () => void;
  cancelMfaEnrollment: () => void;
  verifyMfaCode: (code: string) => boolean;
  rotateRecoveryCodes: () => string[];
  clearMfa: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  requiresPinForAction: (action: RestrictedPosAction) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      store: null,
      tenant: null,
      isAuthenticated: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      rolePermissions: null,
      mfa: defaultMfaState,

      login: (user, store, tenant) => {
        const permissions = rolePermissionMatrix[user.role];
        set({
          user,
          store,
          tenant,
          isAuthenticated: true,
          rolePermissions: permissions,
          mfa: get().mfa.status === 'disabled' ? defaultMfaState : get().mfa
        });
      },

      logout: () => {
        set({
          user: null,
          store: null,
          tenant: null,
          isAuthenticated: false,
          rolePermissions: null,
          mfa: defaultMfaState
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
            rolePermissions: updates.role ? rolePermissionMatrix[updates.role] : get().rolePermissions
          });
        }
      },

      refreshPermissions: (role) => {
        set({ rolePermissions: rolePermissionMatrix[role] });
      },

      beginMfaEnrollment: () => {
        const secret = generateTemporarySecret();
        const recoveryCodes = generateRecoveryCodes();
        set({
          mfa: {
            status: 'pending',
            method: 'totp',
            temporarySecret: secret,
            previewCodes: generatePreviewTotpCodes(secret),
            recoveryCodes,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          }
        });
      },

      cancelMfaEnrollment: () => {
        const { mfa } = get();
        if (mfa.status === 'pending') {
          set({ mfa: defaultMfaState });
        }
      },

      verifyMfaCode: (code) => {
        const { mfa } = get();
        if (mfa.status !== 'pending' || !mfa.temporarySecret) {
          return false;
        }

        const valid = verifyTotpCode(mfa.temporarySecret, code);
        if (valid) {
          set({
            mfa: {
              status: 'verified',
              method: 'totp',
              temporarySecret: mfa.temporarySecret,
              previewCodes: generatePreviewTotpCodes(mfa.temporarySecret),
              recoveryCodes: mfa.recoveryCodes,
              lastVerifiedAt: new Date().toISOString()
            }
          });
        }

        return valid;
      },

      rotateRecoveryCodes: () => {
        const codes = generateRecoveryCodes();
        set((state) => ({
          mfa: {
            ...state.mfa,
            recoveryCodes: codes
          }
        }));
        return codes;
      },

      clearMfa: () => {
        set({ mfa: defaultMfaState });
      },

      verifyPin: async (pin) => {
        const { user, tenant } = get();
        const hash = user?.security?.pinHash;
        if (!hash) return false;
        const salt = tenant?.id ?? user?.storeId ?? 'global';
        return verifyPinHash(pin, salt, hash);
      },

      requiresPinForAction: (action) => {
        const { rolePermissions } = get();
        return rolePermissions ? rolePermissions.requiresPin.includes(action) : true;
      }
    }),
    {
      name: 'mas-auth-store',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
        rolePermissions: state.rolePermissions,
        mfa: state.mfa
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