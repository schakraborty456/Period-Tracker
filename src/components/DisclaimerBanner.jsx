import React from 'react';

/**
 * DisclaimerBanner component
 *
 * Renders the mandatory health disclaimer required by PRD.md Section 12:
 * "This app provides general information only and is not a substitute for
 * professional medical advice. If you have severe pain, very heavy bleeding,
 * or missed periods, please consult a doctor."
 */
export default function DisclaimerBanner({
  variant = 'card',
  className = '',
}) {
  const isFooter = variant === 'footer';

  return (
    <aside
      role="note"
      aria-label="Medical Disclaimer"
      className={`rounded-2xl border text-xs transition-colors ${
        isFooter
          ? 'bg-pink-50/40 border-pink-100/70 p-4 text-textMuted'
          : 'bg-rose-50/30 border-rose-100 p-4 text-textMuted'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-white border border-rose-100/80 shadow-xs flex items-center justify-center text-sm flex-shrink-0 text-primary">
          🩺
        </div>
        <div className="space-y-1">
          <p className="font-bold text-textMain text-xs font-heading">
            Medical Disclaimer & Information Notice
          </p>
          <p className="leading-relaxed text-[11px] text-textMuted">
            This app provides general information only and is not a substitute for professional medical advice. If you have severe pain, very heavy bleeding, or missed periods, please consult a doctor.
          </p>
          <p className="leading-relaxed text-[10px] text-textMuted/80 pt-0.5">
            Predictions are estimates based on mathematical cycle formulas, not guarantees. Nutrition tips are static reference suggestions currently marked as <em>needs expert review</em>.
          </p>
        </div>
      </div>
    </aside>
  );
}

