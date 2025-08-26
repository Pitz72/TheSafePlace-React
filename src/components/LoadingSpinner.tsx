import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Caricamento...', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        border-2 border-phosphor-600 border-t-phosphor-400 
        rounded-full animate-spin
      `}></div>
      {message && (
        <div className={`
          mt-2 text-phosphor-400 font-mono 
          ${textSizeClasses[size]}
        `}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;