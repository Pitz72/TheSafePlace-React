/**
 * CRT Button - Componente pulsante con stile CRT retrò
 */

import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { useCRTTheme } from '../theme/crtTheme';

interface CRTButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export const CRTButton = forwardRef<HTMLButtonElement, CRTButtonProps>(
  ({ variant = 'primary', size = 'md', glow = false, className = '', children, ...props }, ref) => {
    const { classes } = useCRTTheme();

    const variantClasses = {
      primary: 'border-green-500 text-green-400 hover:bg-green-900 hover:text-green-300',
      secondary: 'border-blue-500 text-blue-400 hover:bg-blue-900 hover:text-blue-300',
      danger: 'border-red-500 text-red-400 hover:bg-red-900 hover:text-red-300',
      success: 'border-green-500 text-green-400 hover:bg-green-900 hover:text-green-300'
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const glowClass = glow ? 'crt-glow' : '';

    return (
      <button
        ref={ref}
        className={`
          ${classes.button}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${glowClass}
          ${className}
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          font-mono
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CRTButton.displayName = 'CRTButton';