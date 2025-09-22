/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@mas/utils';

type ModalRenderer = (controls: { close: () => void }) => React.ReactNode;

type ModalDescriptor = {
  id: string;
  renderer: ModalRenderer;
  dismissible?: boolean;
  labelledBy?: string;
};

type ToastTone = 'info' | 'success' | 'warning' | 'danger';

type ToastDescriptor = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
  progress?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ModalOptions = Partial<Omit<ModalDescriptor, 'renderer'>>;

type ModalContextValue = {
  openModal: (renderer: ModalRenderer, options?: ModalOptions) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastDescriptor, 'id'> & { id?: string }) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

type DialogContextValue = {
  confirm: (options: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ToastTone;
  }) => Promise<boolean>;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);
const ToastContext = createContext<ToastContextValue | undefined>(undefined);
const DialogContext = createContext<DialogContextValue | undefined>(undefined);

const toastToneStyles: Record<ToastTone, string> = {
  info: 'border-primary-200 bg-surface-100/95 text-ink',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger'
};

const getId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export const UXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalDescriptor[]>([]);
  const [toasts, setToasts] = useState<ToastDescriptor[]>([]);
  const toastTimeouts = useRef<Map<string, number>>(new Map());

  const closeModal = useCallback((id: string) => {
    setModals((current) => current.filter((modal) => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const openModal = useCallback<ModalContextValue['openModal']>((renderer, options) => {
    const id = options?.id ?? getId();
    setModals((current) => [...current, { id, renderer, ...options }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
    const timeoutId = toastTimeouts.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeouts.current.delete(id);
    }
  }, []);

  const scheduleToastDismissal = useCallback((toast: ToastDescriptor) => {
    if (toast.duration === Infinity) return;
    const timeoutId = window.setTimeout(() => dismissToast(toast.id), toast.duration);
    toastTimeouts.current.set(toast.id, timeoutId);
  }, [dismissToast]);

  const showToast = useCallback<ToastContextValue['showToast']>((toast) => {
    const id = toast.id ?? getId();
    const descriptor: ToastDescriptor = {
      id,
      tone: toast.tone,
      title: toast.title,
      description: toast.description,
      duration: toast.duration ?? 4000
    };

    setToasts((items) => [...items, descriptor]);
    scheduleToastDismissal(descriptor);
    return id;
  }, [scheduleToastDismissal]);

  const clearToasts = useCallback(() => {
    toastTimeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    toastTimeouts.current.clear();
    setToasts([]);
  }, []);

  const confirm = useCallback<DialogContextValue['confirm']>((options) => {
    return new Promise<boolean>((resolve) => {
      const modalId = getId();

      const handleResolve = (value: boolean) => {
        resolve(value);
        closeModal(modalId);
      };

      openModal(() => (
        <motion.div
          layout
          className="w-full max-w-md rounded-2xl border border-line bg-surface-100/95 p-6 shadow-lg"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="heading-sm text-ink">{options.title}</h2>
              {options.description ? (
                <p className="body-sm text-muted mt-2">{options.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Close dialog"
              className="rounded-full bg-surface-200 p-1 text-muted hover:text-ink"
              onClick={() => handleResolve(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted hover:text-ink"
              onClick={() => handleResolve(false)}
            >
              {options.cancelLabel ?? 'Cancel'}
            </button>
            <button
              type="button"
              className={cn(
                'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-card transition-colors',
                options.tone === 'danger'
                  ? 'bg-danger hover:bg-danger/90'
                  : 'bg-primary-500 hover:bg-primary-600'
              )}
              onClick={() => handleResolve(true)}
            >
              {options.confirmLabel ?? 'Confirm'}
            </button>
          </div>
        </motion.div>
      ), { id: modalId, dismissible: false });
    });
  }, [openModal, closeModal]);

  const modalValue = useMemo<ModalContextValue>(() => ({ openModal, closeModal, closeAllModals }), [openModal, closeModal, closeAllModals]);
  const toastValue = useMemo<ToastContextValue>(() => ({ showToast, dismissToast, clearToasts }), [showToast, dismissToast, clearToasts]);
  const dialogValue = useMemo<DialogContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ModalContext.Provider value={modalValue}>
      <ToastContext.Provider value={toastValue}>
        <DialogContext.Provider value={dialogValue}>
          {children}
          {typeof document !== 'undefined'
            ? createPortal(
                <AnimatePresence>
                  {modals.map((modal) => (
                    <motion.div
                      key={modal.id}
                      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/40 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        if (modal.dismissible !== false) {
                          closeModal(modal.id);
                        }
                      }}
                    >
                      <motion.div
                        role="dialog"
                        aria-modal
                        aria-labelledby={modal.labelledBy}
                        className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl items-stretch justify-center"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {modal.renderer({ close: () => closeModal(modal.id) })}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>,
                document.body
              )
            : null}

          {typeof document !== 'undefined'
            ? createPortal(
                <div className="pointer-events-none fixed bottom-4 right-4 z-[130] flex w-full max-w-sm flex-col gap-2 sm:bottom-8 sm:right-8">
                  <AnimatePresence>
                    {toasts.map((toast) => (
                      <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.16 }}
                        className={cn(
                          'pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur',
                          toastToneStyles[toast.tone]
                        )}
                      >
                        {toast.progress && (
                          <div className="mb-3">
                            <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-current rounded-full"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{
                                  duration: (toast.duration || 4000) / 1000,
                                  ease: 'linear'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="body-sm font-semibold">{toast.title}</p>
                            {toast.description ? (
                              <p className="body-xs text-muted mt-1">{toast.description}</p>
                            ) : null}
                            {toast.action && (
                              <button
                                onClick={toast.action.onClick}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700 mt-2 underline"
                              >
                                {toast.action.label}
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            className="text-muted hover:text-ink flex-shrink-0"
                            onClick={() => dismissToast(toast.id)}
                            aria-label="Dismiss notification"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>,
                document.body
              )
            : null}
        </DialogContext.Provider>
      </ToastContext.Provider>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a UXProvider');
  }
  return context;
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a UXProvider');
  }
  return context;
};

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a UXProvider');
  }
  return context;
};
