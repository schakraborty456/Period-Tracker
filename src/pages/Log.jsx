import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { saveDailyLog, getDailyLog } from '../services/firestore';
import {
  formatLocalDate,
  parseLocalDate,
  addLocalDays,
  subLocalDays,
  getDaysDifference,
} from '../utils/dateHelpers';
import {
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  getDefaultDailyLog,
} from '../data/symptoms';
import Button from '../components/Button';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';

export default function Log() {
  const { currentUser } = useAuth();
  const todayStr = formatLocalDate(new Date());

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [flow, setFlow] = useState('none');
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load log data whenever selectedDate or currentUser changes
  useEffect(() => {
    async function fetchLog() {
      if (!currentUser || !selectedDate) return;
      try {
        setLoading(true);
        setErrorMessage('');
        setSaveSuccess(false);

        const existingLog = await getDailyLog(currentUser.uid, selectedDate);
        if (existingLog) {
          setFlow(existingLog.flow || 'none');
          setMood(existingLog.mood || '');
          setSymptoms(Array.isArray(existingLog.symptoms) ? existingLog.symptoms : []);
          setWaterGlasses(
            typeof existingLog.waterGlasses === 'number' ? existingLog.waterGlasses : 4
          );
          setNotes(existingLog.notes || '');
        } else {
          // Reset to default empty log for unlogged days
          const defaults = getDefaultDailyLog(selectedDate);
          setFlow(defaults.flow);
          setMood(defaults.mood);
          setSymptoms(defaults.symptoms);
          setWaterGlasses(defaults.waterGlasses);
          setNotes(defaults.notes);
        }
      } catch (err) {
        console.error('Error loading daily log:', err);
        setErrorMessage('Unable to load logs for this date. You can still create a new entry.');
      } finally {
        setLoading(false);
      }
    }

    fetchLog();
  }, [currentUser, selectedDate]);

  // Symptom toggling
  function toggleSymptom(symptomId) {
    setSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
    setSaveSuccess(false);
  }

  // Water intake handlers
  function incrementWater() {
    setWaterGlasses((prev) => Math.min(16, prev + 1));
    setSaveSuccess(false);
  }

  function decrementWater() {
    setWaterGlasses((prev) => Math.max(0, prev - 1));
    setSaveSuccess(false);
  }

  // Date navigation handlers
  function handlePrevDay() {
    const prevDate = subLocalDays(selectedDate, 1);
    setSelectedDate(formatLocalDate(prevDate));
  }

  function handleNextDay() {
    const nextDate = addLocalDays(selectedDate, 1);
    const nextDateStr = formatLocalDate(nextDate);
    // Don't allow logging future days beyond today
    if (nextDateStr <= todayStr) {
      setSelectedDate(nextDateStr);
    }
  }

  const isToday = selectedDate === todayStr;
  const isFutureDate = selectedDate > todayStr;
  const daysDiffFromToday = getDaysDifference(selectedDate, todayStr);

  const displayDateText = isToday
    ? 'Today'
    : daysDiffFromToday === -1
    ? 'Yesterday'
    : format(parseLocalDate(selectedDate), 'EEEE, MMM d, yyyy');

  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      setErrorMessage('');
      setSaveSuccess(false);

      await saveDailyLog(currentUser.uid, selectedDate, {
        flow,
        mood,
        symptoms,
        waterGlasses,
        notes,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save daily log:', err);
      setErrorMessage('Could not save your log. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-textMain px-4 pt-6 pb-28 md:pb-12">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-xl bg-white border border-pink-100 flex items-center justify-center text-textMuted hover:text-textMain hover:border-primary/40 transition-colors shadow-xs"
              aria-label="Back to Dashboard"
            >
              ←
            </Link>
            <div>
              <h1 className="text-lg font-bold font-heading text-textMain leading-tight">
                Daily Log
              </h1>
              <p className="text-xs text-textMuted">Record your body's signs & feelings</p>
            </div>
          </div>

          <span className="text-xs font-semibold text-primary bg-primary-soft/50 px-2.5 py-1 rounded-full border border-pink-100 flex items-center gap-1">
            <span>📝</span>
            <span>{isToday ? 'Today' : selectedDate}</span>
          </span>
        </header>

        {/* Date Selector Banner */}
        <Card className="p-3.5 flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={handlePrevDay}
            className="w-9 h-9 rounded-xl border border-pink-100 bg-background flex items-center justify-center text-textMain hover:bg-pink-50 transition-colors"
            title="Previous day"
            aria-label="Previous day"
          >
            ←
          </button>

          <div className="text-center">
            <p className="text-xs font-bold text-textMain font-heading">
              {displayDateText}
            </p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-[11px] text-textMuted bg-transparent border-0 text-center cursor-pointer hover:text-primary transition-colors focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            disabled={isToday}
            className={`w-9 h-9 rounded-xl border border-pink-100 flex items-center justify-center transition-colors ${
              isToday
                ? 'opacity-30 cursor-not-allowed bg-background text-textMuted'
                : 'bg-background text-textMain hover:bg-pink-50'
            }`}
            title="Next day"
            aria-label="Next day"
          >
            →
          </button>
        </Card>

        {/* Error banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success toast / notification */}
        {saveSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-fade-in"
          >
            <span className="flex items-center gap-2 font-medium">
              <span>🌸</span>
              <span>Daily log saved successfully for {selectedDate}!</span>
            </span>
            <span className="text-xs text-emerald-700 font-bold">✓ Saved</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <Card className="text-center p-8 space-y-2">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-textMuted">Loading details for {selectedDate}...</p>
          </Card>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* 1. FLOW SELECTOR */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-textMain flex items-center gap-1.5">
                    <span>🩸</span>
                    <span>Menstrual Flow</span>
                  </h2>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    Select your bleeding level for today
                  </p>
                </div>
                {flow !== 'none' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-primary px-2 py-0.5 rounded-md">
                    Period Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FLOW_OPTIONS.map((f) => {
                  const isSelected = flow === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFlow(f.id);
                        setSaveSuccess(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[68px] ${
                        isSelected
                          ? 'border-primary bg-primary-soft/50 shadow-xs ring-1 ring-primary/40'
                          : 'border-pink-100/90 bg-white hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{f.icon}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-textMain mt-1">{f.label}</p>
                        <p className="text-[10px] text-textMuted truncate">{f.sublabel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 2. MOOD EMOJI SELECTOR */}
            <Card className="space-y-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-textMain flex items-center gap-1.5">
                  <span>😊</span>
                  <span>Today's Mood</span>
                </h2>
                <p className="text-[11px] text-textMuted mt-0.5">
                  How are you feeling emotionally?
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {MOOD_OPTIONS.map((m) => {
                  const isSelected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMood(isSelected ? '' : m.id);
                        setSaveSuccess(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[64px] ${
                        isSelected
                          ? 'border-primary bg-primary-soft/60 shadow-xs ring-1 ring-primary/40 font-semibold text-primary'
                          : 'border-pink-100/90 bg-white hover:border-pink-200 text-textMuted'
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[10px] leading-tight font-medium text-textMain">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 3. SYMPTOM SELECTOR (Multi-select Chips) */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-textMain flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Symptoms & Body Signs</span>
                  </h2>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    Select all physical symptoms you experienced
                  </p>
                </div>
                {symptoms.length > 0 && (
                  <span className="text-[10px] font-bold text-textMuted bg-background px-2 py-0.5 rounded-full border border-pink-100">
                    {symptoms.length} selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {SYMPTOM_OPTIONS.map((s) => {
                  const isSelected = symptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSymptom(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border min-h-[36px] ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                          : 'bg-white border-pink-100/90 text-textMuted hover:border-pink-200 hover:text-textMain'
                      }`}
                    >
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                      {isSelected && <span className="text-[10px] ml-0.5">✓</span>}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 4. WATER INTAKE COUNTER */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-textMain flex items-center gap-1.5">
                    <span>💧</span>
                    <span>Water Intake</span>
                  </h2>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    Target: 8 glasses (~2 Litres) per day
                  </p>
                </div>
                <span className="text-xs font-bold text-primary font-heading">
                  {waterGlasses} / 8 glasses
                </span>
              </div>

              {/* Water Glasses Visual Progress */}
              <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-pink-100/70">
                <button
                  type="button"
                  onClick={decrementWater}
                  disabled={waterGlasses <= 0}
                  className="w-9 h-9 rounded-xl bg-white border border-pink-100 flex items-center justify-center font-bold text-base text-textMain hover:bg-pink-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                  aria-label="Decrease water"
                >
                  −
                </button>

                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center px-2">
                  {[...Array(8)].map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setWaterGlasses(idx + 1);
                        setSaveSuccess(false);
                      }}
                      className={`text-xl transition-transform hover:scale-110 ${
                        idx < waterGlasses ? 'opacity-100' : 'opacity-20 grayscale'
                      }`}
                      title={`Glass ${idx + 1}`}
                      aria-label={`Water glass ${idx + 1}`}
                    >
                      💧
                    </button>
                  ))}
                  {waterGlasses > 8 && (
                    <span className="text-xs font-bold text-primary bg-white px-2 py-0.5 rounded-full border border-pink-100 shadow-xs">
                      +{waterGlasses - 8}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={incrementWater}
                  disabled={waterGlasses >= 16}
                  className="w-9 h-9 rounded-xl bg-white border border-pink-100 flex items-center justify-center font-bold text-base text-textMain hover:bg-pink-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                  aria-label="Increase water"
                >
                  +
                </button>
              </div>
            </Card>

            {/* 5. NOTES TEXTAREA */}
            <Card className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-textMain flex items-center gap-1.5">
                  <span>📝</span>
                  <span>Personal Daily Notes (Optional)</span>
                </h2>
                <span className="text-[10px] text-textMuted">
                  {notes.length} / 500
                </span>
              </div>

              <textarea
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setSaveSuccess(false);
                }}
                placeholder="How did your body feel today? Any specific meals, workouts, energy shifts, or sensations..."
                className="w-full text-xs p-3 rounded-xl border border-pink-100/90 bg-background text-textMain placeholder-textMuted/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </Card>

            {/* SUBMIT / SAVE ACTION BUTTON */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={saving}
                className="shadow-sm !py-3"
              >
                <span>🌸</span>
                <span>Save Daily Log for {displayDateText}</span>
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
