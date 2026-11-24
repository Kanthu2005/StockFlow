import React, { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    error,
    helperText,
    required = false,
    rows = 3,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-zinc-700 select-none"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded-md border bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 transition-colors resize-y ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
            : 'border-zinc-300 focus:border-blue-600 focus:ring-blue-600'
        } disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed ${className}`}
        {...props}
      />

      {error ? (
        <p id={`${inputId}-error`} className="text-[11px] text-rose-600 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-zinc-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
