export const theme = {
  colors: {
    light: {
      'bg-dust': '#F8F6F5',
      'surface-100': '#F2EFEE',
      'surface-200': '#E6E2E1',
      'primary-700': '#C7524A',
      'primary-600': '#D45F56',
      'primary-500': '#EE766D',
      'primary-200': '#F4A59E',
      'primary-100': '#F9CFCB',
      'ink': '#24242E',
      'ink-70': 'rgba(36,36,46,0.7)',
      'line': '#D6D6D6',
      'muted': '#74747C',
      'success': '#4CAF93',
      'warning': '#EBA45A',
      'danger': '#C7524A'
    },
    dark: {
      'bg-dust': '#121217',
      'surface-100': '#1E1E26',
      'surface-200': '#2A2A34',
      'primary-700': '#FF9A90',
      'primary-600': '#FF8C80',
      'primary-500': '#FF7A6E',
      'primary-200': '#FFB7B0',
      'primary-100': '#492825',
      'ink': '#F2F2F5',
      'ink-70': 'rgba(242,242,245,0.7)',
      'line': '#3A3A42',
      'muted': '#9A9AA4',
      'success': '#70CCB0',
      'warning': '#EEB466',
      'danger': '#FF7A6E'
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