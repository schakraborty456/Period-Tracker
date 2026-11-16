import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { saveDoctorVisit } from '../services/firestore';
import { formatLocalDate } from '../utils/dateHelpers';
import Button from './Button';
import Input from './Input';
import Card from './Card';

export default function DoctorVisitModal({
  isOpen,
  onClose,
  onSaved,
  initialData = null,
  prefilledReason = '',
}) {
  const { currentUser } = useAuth();
  const todayStr = formatLocalDate(new Date());

  const [date, setDate] = useState(
    initialData?.date || ''
  );
  const [time, setTime] = useState(initialData?.time || '10:00 AM');
  const [doctorName, setDoctorName] = useState(
    initialData?.doctorName || ''
  );
  const [clinic, setClinic] = useState(initialData?.clinic || '');
  const [reason, setReason] = useState(
    initialData?.reason || prefilledReason || 'Gynecological Consultation'
  );
  const [notes, setNotes] = useState(
    initialData?.notes || 'Bring printed Doctor Report and symptom log.'
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    if (!date) {
      setError('Please select an appointment date.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const visitPayload = {
        date,
        time,
        doctorName: doctorName || 'Gynecologist',
        clinic,
        reason,
        notes,
        status: initialData?.status || 'scheduled',
        checklist: [
          'Print / Export Doctor Report from the app',
          'Note down specific symptom dates & pain scores',
          'Prepare questions regarding cycle regularity',
        ],
      };

      const saved = await saveDoctorVisit(
        currentUser.uid,
        visitPayload,
        initialData?.id || null
      );

      if (onSaved) {
        onSaved(saved);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save doctor visit reminder:', err);
      setError('Could not save reminder. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Google Calendar helper URL
  function getGoogleCalendarUrl() {
    if (!date) return '#';
    const cleanDate = date.replace(/-/g, '');
    const title = encodeURIComponent(`Doctor Appointment: ${doctorName || 'Gynecologist'}`);
    const details = encodeURIComponent(
      `${reason}\n\nNotes: ${notes}\n\nGenerated via Antigravity Period Tracker.`
    );
    const location = encodeURIComponent(clinic || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${cleanDate}T090000Z/${cleanDate}T100000Z&details=${details}&location=${location}`;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-surface max-w-md w-full rounded-2xl shadow-xl border border-pink-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-primary-soft/40 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <div>
              <h3 className="text-base font-bold font-heading text-textMain">
                {initialData ? 'Edit Doctor Visit' : 'Schedule Doctor Visit Reminder'}
              </h3>
              <p className="text-[11px] text-textMuted">
                Set a reminder &amp; prepare your consultation checklist
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-textMuted hover:text-textMain border border-pink-100 flex items-center justify-center text-sm font-bold min-h-[44px] min-w-[44px]"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                value={date}
                min={todayStr}
                required
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white min-h-[44px] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                Time (optional)
              </label>
              <input
                type="text"
                value={time}
                placeholder="e.g., 10:30 AM"
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white min-h-[44px] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">
              Doctor or Clinic Name
            </label>
            <input
              type="text"
              value={doctorName}
              placeholder="e.g., Dr. Ananya Roy, Gynecologist"
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white min-h-[44px] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">
              Clinic Location / Hospital (optional)
            </label>
            <input
              type="text"
              value={clinic}
              placeholder="e.g., Apollo Clinic, Salt Lake"
              onChange={(e) => setClinic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white min-h-[44px] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">
              Reason for Visit
            </label>
            <input
              type="text"
              value={reason}
              placeholder="e.g., Consultation for prolonged bleeding / cycle delay"
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white min-h-[44px] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">
              Personal Preparation Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              placeholder="e.g., Ask for pelvic ultrasound, bring printed Doctor Report"
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white text-xs resize-none"
            />
          </div>

          {/* Consultation Checklist preview */}
          <div className="bg-background rounded-xl p-3 border border-pink-100 text-[11px] space-y-1">
            <span className="font-bold text-textMain uppercase tracking-wider block">
              Consultation Prep Checklist:
            </span>
            <ul className="space-y-0.5 text-textMuted">
              <li>✓ Print or download your Doctor Report before the visit</li>
              <li>✓ Note current pain severity scores and streak dates</li>
              <li>✓ Bring list of any regular medications or supplements</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={saving}
              className="min-h-[48px]"
            >
              {saving ? 'Saving Reminder...' : initialData ? 'Update Reminder' : 'Set Doctor Visit Reminder ✓'}
            </Button>

            {date && (
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl border border-pink-200 text-xs font-semibold text-primary hover:bg-pink-50 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <span>📅</span>
                <span>Sync with Google Calendar</span>
              </a>
            )}

            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={onClose}
              className="text-xs text-textMuted min-h-[44px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
