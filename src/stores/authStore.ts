import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Store, Tenant } from '../types';

interface AuthState {
  user: User | null;
  store: Store | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  login: (user: User, store: Store, tenant: Tenant) => void;
  logout: () => void;
  setOnlineStatus: (status: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      store: null,
      tenant: null,
      isAuthenticated: false,
      isOnline: navigator.onLine,

      login: (user, store, tenant) => {
        set({
          user,
          store,
          tenant,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          store: null,
          tenant: null,
          isAuthenticated: false
        });
      },

      setOnlineStatus: (status) => {
        set({ isOnline: status });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      }
    }),
    {
      name: 'mas-auth-store',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated
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