/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => ({ opacityValue }) => {
  if (opacityValue === undefined) {
    return `rgb(var(${variable}))`;
  }
  return `rgb(var(${variable}) / ${opacityValue})`;
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-dust': withOpacity('--color-bg-dust'),
        'surface-100': withOpacity('--color-surface-100'),
        'surface-200': withOpacity('--color-surface-200'),
        'primary-700': withOpacity('--color-primary-700'),
        'primary-600': withOpacity('--color-primary-600'),
        'primary-500': withOpacity('--color-primary-500'),
        'primary-200': withOpacity('--color-primary-200'),
        'primary-100': withOpacity('--color-primary-100'),
        ink: withOpacity('--color-ink'),
        'ink-70': withOpacity('--color-ink-70'),
        line: withOpacity('--color-line'),
        muted: withOpacity('--color-muted'),
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        danger: withOpacity('--color-danger'),
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['var(--font-size-2xs)', { lineHeight: 'var(--line-height-loose)', letterSpacing: 'var(--tracking-wide)' }],
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-relaxed)', letterSpacing: 'var(--tracking-wide)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-relaxed)', letterSpacing: 'var(--tracking-normal)' }],
        base: ['var(--font-size-md)', { lineHeight: 'var(--line-height-relaxed)', letterSpacing: 'var(--tracking-normal)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-relaxed)', letterSpacing: 'var(--tracking-normal)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-snug)', letterSpacing: 'calc(var(--tracking-tight) / 2)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-snug)', letterSpacing: 'var(--tracking-tight)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-snug)', letterSpacing: 'var(--tracking-tight)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-snug)', letterSpacing: 'var(--tracking-tight)' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--tracking-tight)' }],
        '6xl': ['var(--font-size-6xl)', { lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--tracking-tight)' }],
        '7xl': ['var(--font-size-7xl)', { lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--tracking-tight)' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'calc(var(--radius-lg) + 8px)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
      },
    },
  },
  plugins: [],
};
