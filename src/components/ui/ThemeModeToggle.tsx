import React from 'react';
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

export const ThemeModeToggle: React.FC<React.ComponentProps<typeof Button>> = ({ className, ...props }) => {
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
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Toggle theme (current: ${labelMap[mode]})`}
      title={`Switch theme (current: ${labelMap[mode]})`}
      className={className}
      {...props}
    >
      <Icon size={18} />
    </Button>
  );
};
