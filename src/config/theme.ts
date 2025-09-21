export const theme = {
  colors: {
    light: {
      'bg-dust': '#F3F3F3',
      'surface-100': '#EAEAEA',
      'surface-200': '#D6D6D6',
      'primary-700': '#A25553',
      'primary-600': '#C66660',
      'primary-500': '#EE766D',
      'primary-200': '#F6BAB6',
      'primary-100': '#FCE4E2',
      'ink': '#24242E',
      'ink-70': '#77777D',
      'line': '#B2B2B4',
      'muted': '#8F8F93',
      'success': '#7A3E3C',
      'warning': '#B0504C',
      'danger': '#8C4644'
    },
    dark: {
      'bg-dust': '#121217',
      'surface-100': '#1D1D25',
      'surface-200': '#202029',
      'primary-700': '#A25553',
      'primary-600': '#C66660',
      'primary-500': '#EE766D',
      'primary-200': '#F6BAB6',
      'primary-100': '#4C343B',
      'ink': '#D6D6D6',
      'ink-70': '#A1A1A4',
      'line': '#3F3F47',
      'muted': '#595960',
      'success': '#F6BAB6',
      'warning': '#EE766D',
      'danger': '#C66660'
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