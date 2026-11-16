import React from 'react';
import { Link } from 'react-router-dom';
import { getDaysDifference, formatLocalDate } from '../utils/dateHelpers';
import Button from './Button';
import Card from './Card';

export default function UpcomingDoctorVisitCard({
  visit,
  onEdit,
  onComplete,
  className = '',
}) {
  if (!visit || visit.status !== 'scheduled') return null;

  const todayStr = formatLocalDate(new Date());
  const daysDiff = getDaysDifference(visit.date, todayStr);

  let countdownLabel = '';
  if (daysDiff === 0) {
    countdownLabel = 'Today';
  } else if (daysDiff === 1) {
    countdownLabel = 'Tomorrow';
  } else if (daysDiff > 1) {
    countdownLabel = `In ${daysDiff} days`;
  } else {
    countdownLabel = `${Math.abs(daysDiff)} days ago`;
  }

  return (
    <Card
      className={`border-2 border-purple-200/80 bg-gradient-to-r from-purple-50/70 via-pink-50/40 to-white space-y-3.5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0 shadow-xs border border-purple-200">
            🩺
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                Upcoming Appointment
              </span>
              <span className="text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded-full border border-pink-200 shadow-xs">
                {countdownLabel}
              </span>
            </div>
            <h3 className="text-sm font-bold font-heading text-textMain mt-1">
              {visit.doctorName || 'Gynecologist Visit'}
            </h3>
          </div>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(visit)}
            className="text-xs text-primary font-semibold hover:underline px-2 py-1 min-h-[44px] flex items-center"
          >
            Edit
          </button>
        )}
      </div>

      {/* Appointment Info Box */}
      <div className="bg-white/90 rounded-xl p-3 border border-purple-100 shadow-xs space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-textMain font-semibold">
          <span>📅 Date: {visit.date}</span>
          {visit.time && <span>⏰ {visit.time}</span>}
        </div>

        {visit.clinic && (
          <p className="text-[11px] text-textMuted">
            📍 <span className="font-medium text-textMain">{visit.clinic}</span>
          </p>
        )}

        {visit.reason && (
          <p className="text-[11px] text-textMuted leading-relaxed">
            📝 Reason: <span className="italic text-textMain">{visit.reason}</span>
          </p>
        )}
      </div>

      {/* Preparation Checklist reminder */}
      <div className="bg-background/80 rounded-xl p-2.5 border border-pink-100/70 text-[11px] text-textMuted space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-textMain block">
          Appointment Checklist:
        </span>
        <p className="flex items-center gap-1.5">
          <span className="text-primary font-bold">✓</span>
          <span>Doctor Report prepared with cycle metrics &amp; pain scores</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link to="/report" className="block">
          <Button
            variant="secondary"
            fullWidth
            className="text-xs min-h-[44px] bg-white border-pink-200 text-primary font-bold"
          >
            📋 Print Report →
          </Button>
        </Link>

        {onComplete && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => onComplete(visit)}
            className="text-xs min-h-[44px] bg-emerald-600 hover:bg-emerald-700"
          >
            Mark Completed ✓
          </Button>
        )}
      </div>
    </Card>
  );
}
