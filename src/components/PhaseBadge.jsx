import React from 'react';
import { getPhaseDetails } from '../utils/cycleCalculator.js';

export default function PhaseBadge({
  phase = 'menstrual',
  size = 'md',
  className = '',
  showIcon = true,
}) {
  const details = getPhaseDetails(phase);

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium shadow-xs transition-colors ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      style={{
        backgroundColor: details.badgeBg,
        color: details.textColor || details.color,
        border: `1px solid ${details.color}35`,
      }}
      role="status"
      aria-label={`Current phase: ${details.name}`}
    >
      {showIcon && <span aria-hidden="true">{details.icon}</span>}
      <span>{details.name}</span>
    </span>
  );
}

