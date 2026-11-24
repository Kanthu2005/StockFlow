import React from 'react';

export default function Button({
  type = 'button',
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  children,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded gap-1.5',
    md: 'text-xs px-3 py-2 rounded-md gap-2 font-medium',
    lg: 'text-sm px-4 py-2.5 rounded-md gap-2',
  };

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 border border-transparent shadow-sm',
    secondary:
      'bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100 border border-zinc-300 focus:ring-zinc-400 shadow-sm',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 border border-transparent shadow-sm',
    dangerGhost:
      'bg-transparent text-rose-600 hover:bg-rose-50 active:bg-rose-100 border border-transparent focus:ring-rose-400',
    ghost:
      'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 border border-transparent focus:ring-zinc-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
