import React from 'react';
import { cn } from '@mas/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'cta';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#EE766D] text-[#24242E] shadow-card hover:bg-[#e55e54] focus-visible:ring-offset-[#D6D6D6] disabled:bg-[#EE766D]/60 disabled:text-[#24242E]/70',
  secondary:
    'bg-[#D6D6D6] text-[#24242E] hover:bg-[#c6c6c6] focus-visible:ring-offset-[#D6D6D6] disabled:bg-[#D6D6D6]/70 disabled:text-[#24242E]/50',
  outline:
    'border border-[#24242E] text-[#24242E] hover:bg-[#24242E] hover:text-[#D6D6D6] focus-visible:ring-offset-[#D6D6D6] disabled:border-[#24242E]/40 disabled:text-[#24242E]/40',
  ghost:
    'text-[#24242E] hover:bg-[#D6D6D6]/70 focus-visible:ring-offset-[#D6D6D6] disabled:text-[#24242E]/40',
  cta:
    'bg-[#24242E] text-[#D6D6D6] shadow-card hover:bg-[#EE766D] hover:text-[#24242E] focus-visible:ring-offset-[#24242E] disabled:bg-[#24242E]/60 disabled:text-[#D6D6D6]/60',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE766D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = 'Button';
