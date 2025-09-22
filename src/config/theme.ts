export const theme = {
  colors: {
    light: {
      'bg-dust': '#ECEBE8',
      'surface-100': '#F5F5F4',
      'surface-200': '#E8E7E4',
      'primary-700': '#B21E1E',
      'primary-600': '#D12E2E',
      'primary-500': '#E44343',
      'primary-200': '#F6BDB7',
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
      'bg-dust': '#141419',
      'surface-100': '#24242E',
      'surface-200': '#343440',
      'primary-700': '#D5645C',
      'primary-600': '#EC776E',
      'primary-500': '#EE766D',
      'primary-200': '#944A44',
      'primary-100': '#502825',
      'ink': '#F0F0F4',
      'ink-70': 'rgba(240,240,244,.70)',
      'line': '#50505E',
      'muted': '#A4A4B0',
      'success': '#4CAF50',
      'warning': '#FFAD33',
      'danger': '#EC776E'
    }
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px'
  },
  elevation: {
    card: '0 6px 24px rgba(36,36,46,0.08)',
    modal: '0 24px 64px rgba(36,36,46,0.16)'
  },
  layout: {
    container: 'var(--layout-max-width)',
    wide: 'var(--layout-wide-width)',
    gutter: 'var(--layout-gutter)',
    sectionPadding: 'var(--layout-section-padding)',
    gridGap: 'var(--layout-grid-gap)'
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
