export const theme = {
  colors: {
    light: {
      'bg-dust': '#ECEBE8',
      'surface-100': '#F5F5F4',
      'surface-200': '#E8E7E4',
      'primary-700': '#B21E1E',
      'primary-600': '#D12E2E',
      'primary-500': '#E44343',
      'primary-100': '#FCE8E8',
      'ink': '#0A0A0A',
      'ink-70': 'rgba(10,10,10,.70)',
      'line': '#D9D7D3',
      'muted': '#9A9994',
      'success': '#148A3B',
      'warning': '#C48A0A',
      'danger': '#B21E1E'
    },
    dark: {
      'bg-dust': '#1A1A1A',
      'surface-100': '#2A2A2A',
      'surface-200': '#3A3A3A',
      'primary-700': '#FF6B6B',
      'primary-600': '#FF5252',
      'primary-500': '#FF4444',
      'primary-100': '#4A1A1A',
      'ink': '#F5F5F4',
      'ink-70': 'rgba(245,245,244,.70)',
      'line': '#4A4A4A',
      'muted': '#9A9994',
      'success': '#4CAF50',
      'warning': '#FF9800',
      'danger': '#FF5252'
    }
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px'
  },
  elevation: {
    card: '0 2px 8px rgba(0,0,0,0.08)',
    modal: '0 8px 32px rgba(0,0,0,0.12)'
  },
  motion: {
    routeTransition: {
      duration: 0.22,
      ease: [0.4, 0, 0.2, 1]
    },
    itemStagger: {
      delay: 0.03,
      duration: 0.18
    },
    pressScale: {
      scale: 1.02,
      duration: 0.16
    }
  }
} as const;

export type ThemeMode = 'light' | 'dark' | 'auto';