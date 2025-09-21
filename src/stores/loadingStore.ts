import { create } from 'zustand';

interface LoadingRequest {
  id: string;
  message?: string;
  createdAt: number;
}

interface LoadingState {
  requests: LoadingRequest[];
  startLoading: (message?: string) => string;
  stopLoading: (id: string) => void;
  setMessage: (id: string, message?: string) => void;
  clear: () => void;
}

const generateId = () => Math.random().toString(36).slice(2);

export const useLoadingStore = create<LoadingState>()((set) => ({
  requests: [],
  startLoading: (message) => {
    const id = generateId();
    set((state) => ({
      requests: [
        ...state.requests,
        {
          id,
          message,
          createdAt: Date.now()
        }
      ]
    }));
    return id;
  },
  stopLoading: (id) => {
    set((state) => ({
      requests: state.requests.filter((request) => request.id !== id)
    }));
  },
  setMessage: (id, message) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === id
          ? {
              ...request,
              message
            }
          : request
      )
    }));
  },
  clear: () => set({ requests: [] })
}));

export const useGlobalLoading = () =>
  useLoadingStore((state) => {
    const active = state.requests[state.requests.length - 1];
    return {
      isLoading: state.requests.length > 0,
      message: active?.message,
      createdAt: active?.createdAt ?? 0
    };
  });
