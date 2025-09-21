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
        display: ['clamp(2.5rem, 4vw, 3rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.01em' }],
        'heading-xl': [
          'clamp(2.25rem, 3.5vw, 2.75rem)',
          { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.01em' },
        ],
        'heading-lg': [
          'clamp(2rem, 3.5vw, 2.5rem)',
          { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.01em' },
        ],
        'heading-md': [
          'clamp(1.5rem, 2.5vw, 1.875rem)',
          { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.005em' },
        ],
        'heading-sm': [
          'clamp(1.25rem, 2vw, 1.5rem)',
          { lineHeight: '1.3', fontWeight: '600' },
        ],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.45', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        eyebrow: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.18em', fontWeight: '600' }],
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
