import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-pink-100 transition-all duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

