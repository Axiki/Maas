import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PinEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
}

export const PinEntryModal: React.FC<PinEntryModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
  title = 'Enter Manager PIN',
  description = 'Security verification is required to continue.',
}) => {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (!open) {
      setPin('');
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!pin || pin.length < 4) {
      return;
    }
    onSubmit(pin);
  };

  const handleDigit = (digit: string) => {
    setPin((prev) => (prev.length >= 6 ? prev : `${prev}${digit}`));
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#24242E]/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-sm rounded-xl border border-line bg-surface-100 p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-ink">{title}</h2>
                <p className="text-sm text-muted mt-1">{description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-muted hover:text-ink transition-colors"
                aria-label="Close PIN prompt"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2" aria-label="PIN characters">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className={`h-12 w-9 rounded-lg border ${
                      pin[index]
                        ? 'border-primary-400 bg-primary-100 text-primary-700'
                        : 'border-line bg-surface-200'
                    } flex items-center justify-center text-lg font-semibold`}
                  >
                    {pin[index] ? '•' : ''}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    className="h-12 rounded-lg bg-surface-200 text-lg font-semibold text-ink transition-colors hover:bg-primary-100 hover:text-primary-700"
                    onClick={() => handleDigit(String(digit))}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  className="h-12 rounded-lg bg-surface-200 text-lg font-semibold text-ink transition-colors hover:bg-danger/10 hover:text-danger"
                  onClick={handleBackspace}
                >
                  Del
                </button>
                <button
                  type="button"
                  className="h-12 rounded-lg bg-surface-200 text-lg font-semibold text-ink transition-colors hover:bg-primary-100 hover:text-primary-700"
                  onClick={() => handleDigit('0')}
                >
                  0
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || pin.length < 4}
                  className="h-12 rounded-lg bg-primary-500 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary-600"
                >
                  {isSubmitting ? 'Verifying…' : 'Submit'}
                </button>
              </div>

              {error && <p className="text-sm text-danger text-center">{error}</p>}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
