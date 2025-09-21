import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@mas/ui';
import { useThemeStore } from '../../stores/themeStore';

const iconMap = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
} as const;

const labelMap = {
  light: 'Light mode',
  dark: 'Dark mode',
  auto: 'Auto mode',
};

const MotionButton = motion(Button);

export const ThemeModeToggle: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const cycleTheme = () => {
    const order: Array<typeof mode> = ['light', 'dark', 'auto'];
    const currentIndex = order.indexOf(mode);
    const nextMode = order[(currentIndex + 1) % order.length];
    setMode(nextMode);
  };

  const Icon = iconMap[mode];

  return (
    <MotionButton
      whileHover={{ scale: 1.05 }}
      whileFocus={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Toggle theme (current: ${labelMap[mode]})`}
      title={`Switch theme (current: ${labelMap[mode]})`}
      className="rounded-xl bg-transparent text-[#D6D6D6] transition-colors duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)] hover:bg-[#EE766D] hover:text-[#24242E] focus-visible:ring-[#EE766D]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#24242E]"
    >
      <Icon size={18} />
    </MotionButton>
  );
};
