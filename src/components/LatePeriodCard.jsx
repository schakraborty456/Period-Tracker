import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * LatePeriodCard component
 *
 * Displays reassuring, non-alarmist guidance when the current date
 * exceeds the predicted next period date (Task 3.5).
 * Prompts user to log a new period start date if bleeding has started.
 */
export default function LatePeriodCard({
  daysLate = 1,
  expectedDate = '',
  className = '',
}) {
  return (
    <div
      role="region"
      aria-label="Late Period Information"
      className={`bg-rose-50/70 border border-rose-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 shadow-xs flex items-center justify-center text-xl flex-shrink-0">
          ⏳
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold font-heading text-rose-950">
              Period is {daysLate} day{daysLate > 1 ? 's' : ''} late
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
              Update
            </span>
          </div>
          {expectedDate && (
            <p className="text-xs text-rose-800/90">
              Expected around {expectedDate}
            </p>
          )}
        </div>
      </div>

      {/* Reassuring copy */}
      <div className="bg-white/80 rounded-xl p-3 border border-rose-100 text-xs text-rose-900/90 space-y-1.5 leading-relaxed">
        <p className="font-semibold text-rose-950">
          🌱 It is normal for cycles to fluctuate.
        </p>
        <p className="text-[11px] text-rose-800 leading-relaxed">
          Cycle variations of a few days are completely natural and frequently caused by stress, lack of sleep, recent travel, changes in diet or workout routine, or mild illness.
        </p>
      </div>

      {/* Actions & Logging Prompt */}
      <div className="space-y-2 pt-1">
        <p className="text-xs font-semibold text-rose-950 flex items-center gap-1.5">
          <span>🌸</span>
          <span>Did your bleeding start today or recently?</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/onboarding" className="flex-1">
            <Button
              variant="primary"
              fullWidth
              className="text-xs !py-2 !min-h-[40px] shadow-xs"
            >
              <span>🩸</span>
              <span>Log Period Start Date</span>
            </Button>
          </Link>

          <Link to="/log" className="flex-1">
            <Button
              variant="secondary"
              fullWidth
              className="text-xs !py-2 !min-h-[40px]"
            >
              <span>📝</span>
              <span>Log Symptoms / Spotting</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Doctor & Testing Guidance */}
      <p className="text-[10px] text-rose-800/80 leading-relaxed pt-1 border-t border-rose-200/60">
        💡 <strong>Gentle reminder:</strong> If your period is more than 7–10 days late and there is a chance of pregnancy, consider taking a home test or speaking with your doctor.
      </p>
    </div>
  );
}
