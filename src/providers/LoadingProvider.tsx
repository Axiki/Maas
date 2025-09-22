import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

interface LoadingContextValue {
  showLoading: (message?: string, variant?: 'spinner' | 'skeleton' | 'progress') => string;
  hideLoading: (id: string) => void;
  hideAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

interface LoadingState {
  id: string;
  message: string;
  variant: 'spinner' | 'skeleton' | 'progress';
}

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);

  const showLoading = useCallback<LoadingContextValue['showLoading']>((message = 'Loading...', variant = 'spinner') => {
    const id = Math.random().toString(36).slice(2);
    const newLoadingState: LoadingState = { id, message, variant };

    setLoadingStates(prev => [...prev, newLoadingState]);
    return id;
  }, []);

  const hideLoading = useCallback<LoadingContextValue['hideLoading']>((id) => {
    setLoadingStates(prev => prev.filter(state => state.id !== id));
  }, []);

  const hideAllLoading = useCallback<LoadingContextValue['hideAllLoading']>(() => {
    setLoadingStates([]);
  }, []);

  const value = {
    showLoading,
    hideLoading,
    hideAllLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loadingStates.map((state) => (
        <LoadingOverlay
          key={state.id}
          isVisible={true}
          message={state.message}
          variant={state.variant}
        />
      ))}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextValue => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
