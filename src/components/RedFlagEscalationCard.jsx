import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Card from './Card';

export default function RedFlagEscalationCard({
  redFlag,
  onScheduleReminder,
  className = '',
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!redFlag || dismissed) return null;

  return (
    <Card
      className={`border-2 border-red-200 bg-gradient-to-r from-red-50/90 via-pink-50/60 to-white space-y-3.5 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-xl shrink-0 shadow-xs border border-red-200">
            🚨
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-100/80 px-2 py-0.5 rounded-full border border-red-200">
              Important Health Notice
            </span>
            <h3 className="text-sm font-bold font-heading text-red-950 mt-0.5">
              {redFlag.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-textMuted hover:text-textMain text-xs p-1 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg"
          title="Dismiss notice for now"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      </div>

      {/* Explanation & Reason */}
      <div className="space-y-1.5 text-xs text-textMain bg-white/80 rounded-xl p-3 border border-red-100 shadow-xs">
        <p className="font-semibold text-red-900">
          {redFlag.reason}
        </p>
        <p className="text-[11px] text-textMuted leading-relaxed">
          {redFlag.clinicalAdvice}
        </p>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimer */}
      <div className="text-[11px] text-red-950/90 font-medium bg-red-50/60 rounded-xl p-2.5 border border-red-200/70 flex items-center gap-2">
        <span className="text-base shrink-0">🩺</span>
        <span className="leading-snug">
          Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist).
        </span>
      </div>

      {/* Direct Action Buttons */}
      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Link to="/report" className="block">
          <Button
            variant="secondary"
            fullWidth
            className="text-xs min-h-[44px] bg-white border-pink-200 text-primary font-bold shadow-xs hover:bg-pink-50"
          >
            📋 Open Doctor Report →
          </Button>
        </Link>

        {onScheduleReminder && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => onScheduleReminder(redFlag)}
            className="text-xs min-h-[44px] bg-red-600 hover:bg-red-700 shadow-xs"
          >
            🩺 Set Doctor Visit Reminder
          </Button>
        )}
      </div>
    </Card>
  );
}
