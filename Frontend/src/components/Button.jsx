import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-400',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="animate-spin">⚙️</span> : null}
      {children}
    </button>
  );
};
