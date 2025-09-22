import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Palette,
  HelpCircle,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useToast } from '../../providers/UXProvider';
import { ProfileSettings } from './ProfileSettings';
import { AccountSettings } from './AccountSettings';
import { NotificationSettings } from './NotificationSettings';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        tone: 'success',
        duration: 3000
      });
      navigate('/');
    } catch (error) {
      showToast({
        title: 'Logout Error',
        description: 'There was an issue logging out. Please try again.',
        tone: 'danger',
        duration: 5000
      });
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: User,
      onClick: () => {
        setIsProfileModalOpen(true);
        onClose();
      },
      description: 'Manage your profile information'
    },
    {
      id: 'account',
      label: 'Account Settings',
      icon: Settings,
      onClick: () => {
        setIsAccountModalOpen(true);
        onClose();
      },
      description: 'General account preferences'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      onClick: () => {
        setIsNotificationModalOpen(true);
        onClose();
      },
      description: 'Manage notification preferences'
    },
    {
      id: 'theme',
      label: 'Theme',
      icon: mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor,
      onClick: () => {
        const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light';
        setMode(nextMode);
      },
      description: `Current: ${mode}`,
      isSpecial: true
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      onClick: () => handleNavigation('/support'),
      description: 'Get help and contact support'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      description: 'Sign out of your account',
      isDanger: true
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-4 top-20 z-50 w-72"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      >
        <div
          ref={dropdownRef}
          className="rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
        >
          {/* User Info Header */}
          <div className="border-b border-line p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="body-sm font-semibold text-ink truncate">{user?.name}</p>
                <p className="body-xs text-muted capitalize">{user?.role}</p>
                <p className="body-xs text-muted">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`
                    flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors
                    ${item.isDanger
                      ? 'text-danger hover:bg-danger/10'
                      : 'text-ink hover:bg-surface-200/70'
                    }
                    ${item.isSpecial ? 'justify-between' : ''}
                  `}
                  onClick={item.onClick}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      flex h-8 w-8 items-center justify-center rounded-lg
                      ${item.isDanger ? 'bg-danger/10' : 'bg-surface-200'}
                    `}>
                      <Icon size={16} className={item.isDanger ? 'text-danger' : 'text-muted'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-sm font-medium">{item.label}</p>
                      <p className="body-xs text-muted">{item.description}</p>
                    </div>
                  </div>
                  {item.isSpecial && (
                    <div className="flex items-center gap-2">
                      <span className="body-xs text-muted capitalize">{mode}</span>
                      <ChevronDown size={14} className="text-muted" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-line p-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Version 2.1.4</span>
              <span>© 2025 MAS</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Modals */}
      <ProfileSettings
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <AccountSettings
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
      <NotificationSettings
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </AnimatePresence>
  );
};
