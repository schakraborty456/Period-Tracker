import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles =
    'min-h-[44px] px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-primary hover:bg-[#c91866] text-white focus:ring-primary shadow-sm active:scale-[0.99]',
    secondary:
      'bg-primary-soft hover:bg-[#fcd3e2] text-primary focus:ring-primary',
    ghost:
      'bg-transparent hover:bg-pink-50 text-textMuted hover:text-textMain focus:ring-primary',
    danger:
      'bg-danger hover:bg-[#be3a3a] text-white focus:ring-danger shadow-sm active:scale-[0.99]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${widthStyle} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </button>
  );
}

