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
