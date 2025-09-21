import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { mockUser, mockStore, mockTenant } from '../../data/mockData';
import { PaperShader } from '../ui/PaperShader';
import { DeviceContext } from '../../types';

const detectDeviceContext = (): DeviceContext => {
  if (typeof window === 'undefined') {
    return 'backoffice';
  }

  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get('mode');
  if (modeParam === 'pos' || modeParam === 'backoffice') {
    return modeParam as DeviceContext;
  }

  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'pos';
  }

  return 'backoffice';
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState('manager@bellavista.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  const { login, deviceContext, setDeviceContext, validatePin } = useAuthStore();
  const navigate = useNavigate();

  const contextOptions: Array<{ id: DeviceContext; label: string; description: string }> = [
    { id: 'backoffice', label: 'BackOffice', description: 'Email & password access' },
    { id: 'pos', label: 'POS Terminal', description: 'Fast PIN unlock' }
  ];

  useEffect(() => {
    const detected = detectDeviceContext();
    if (detected === 'pos' && deviceContext !== 'pos') {
      setDeviceContext('pos');
    }
  }, [deviceContext, setDeviceContext]);

  useEffect(() => {
    setPin('');
    setPinError(null);
    setPinLoading(false);
  }, [deviceContext]);

  const isPosContext = deviceContext === 'pos';
  const submitting = isPosContext ? pinLoading : isLoading;
  const buttonLabel = isPosContext ? 'Unlock POS' : 'Sign In';
  const loadingLabel = isPosContext ? 'Verifying…' : 'Signing in…';
  const isButtonDisabled = isPosContext ? pin.length < 4 || submitting : submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isPosContext) {
      if (!pin || pin.length < 4) {
        setPinError('Enter your 4-digit PIN to continue.');
        return;
      }

      setPinLoading(true);
      setPinError(null);

      window.setTimeout(() => {
        const isValidPin = validatePin(pin);
        if (isValidPin) {
          login(mockUser, mockStore, mockTenant);
          navigate('/pos');
        } else {
          setPinError('Invalid PIN. Try again or contact a manager.');
        }
        setPinLoading(false);
      }, 400);

      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      if (email === 'manager@bellavista.com' && password === 'password') {
        login(mockUser, mockStore, mockTenant);
        navigate('/portal');
      } else {
        alert('Invalid credentials. Use: manager@bellavista.com / password');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handlePinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(digitsOnly);
    setPinError(null);
  };

  return (
    <div className="min-h-screen bg-bg-dust flex items-center justify-center p-4 relative">
      <PaperShader intensity={0.3} animationSpeed={0.5} />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-surface-100/90 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-line">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">MAS</span>
            </div>
            <h1 className="text-2xl font-bold text-ink">Welcome Back</h1>
            <p className="text-muted mt-2">Sign in to your MAS account</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {contextOptions.map((option) => {
              const active = deviceContext === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDeviceContext(option.id)}
                  className={`rounded-lg border px-4 py-3 text-left transition-all ${
                    active
                      ? 'border-primary-300 bg-primary-100 text-primary-700 shadow-sm'
                      : 'border-line bg-surface-200/70 text-muted hover:bg-surface-300 hover:text-ink'
                  }`}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="text-xs mt-1 opacity-80">{option.description}</p>
                </button>
              );
            })}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isPosContext ? (
              <>
                <div>
                  <label htmlFor="pin" className="block text-sm font-medium text-ink mb-2 text-left">
                    Employee PIN
                  </label>
                  <input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={handlePinChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-line rounded-lg bg-surface-200/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-center tracking-[0.6em]"
                    placeholder="Enter PIN"
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs text-muted mt-2 text-center">
                    Use the four-digit manager PIN assigned to this terminal.
                  </p>
                </div>
                {pinError && <p className="text-xs text-danger text-center">{pinError}</p>}
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-line rounded-lg bg-surface-200/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-line rounded-lg bg-surface-200/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <motion.button
              type="submit"
              disabled={isButtonDisabled}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingLabel}</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  {buttonLabel}
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="p-3 bg-primary-100/50 rounded-lg">
              <p className="text-xs text-primary-700 font-medium mb-1">BackOffice Demo</p>
              <p className="text-xs text-primary-600">Email: manager@bellavista.com</p>
              <p className="text-xs text-primary-600">Password: password</p>
            </div>
            <div className="p-3 bg-surface-200/60 rounded-lg">
              <p className="text-xs text-muted font-medium mb-1">POS Demo</p>
              <p className="text-xs text-muted">PIN: 1234</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};