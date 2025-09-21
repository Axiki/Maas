import { useEffect, useState } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';

type PersistCapableStore = UseBoundStore<StoreApi<unknown>> & {
  persist?: {
    hasHydrated?: () => boolean;
    onFinishHydration?: (callback: () => void) => (() => void) | undefined;
  };
};

export const useStoreHydration = (store: PersistCapableStore) => {
  const [hasHydrated, setHasHydrated] = useState(() =>
    store.persist ? store.persist.hasHydrated?.() ?? false : true
  );

  useEffect(() => {
    if (!store.persist) {
      setHasHydrated(true);
      return;
    }

    if (store.persist.hasHydrated?.()) {
      setHasHydrated(true);
      return;
    }

    const unsubscribe = store.persist.onFinishHydration?.(() => {
      setHasHydrated(true);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [store]);

  return hasHydrated;
};
