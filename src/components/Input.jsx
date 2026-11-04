import React from 'react';

export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  autoComplete,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-textMuted"
        >
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-white text-textMain placeholder-textMuted/60 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-pink-200 focus:border-primary focus:ring-primary/20'
        }`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger font-medium mt-0.5">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-textMuted mt-0.5">{helperText}</p>
      )}
    </div>
  );
}
