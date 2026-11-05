import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import {
  saveDailyLog,
  getDailyLog,
  getUserProfile,
  getUserPeriods,
  recordNewPeriodAndRecalculate,
} from '../services/firestore';
import {
  formatLocalDate,
  parseLocalDate,
  addLocalDays,
  subLocalDays,
  getDaysDifference,
} from '../utils/dateHelpers';
import { shouldSuggestNewPeriod } from '../utils/cycleCalculator';
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

  // Cycle tracking & period start detection state (Task 4.3)
  const [userProfile, setUserProfile] = useState(null);
  const [latestPeriod, setLatestPeriod] = useState(null);
  const [markAsNewPeriod, setMarkAsNewPeriod] = useState(false);
  const [cycleUpdateMessage, setCycleUpdateMessage] = useState('');

  // Load log data and cycle profile whenever selectedDate or currentUser changes
  useEffect(() => {
    async function fetchLog() {
      if (!currentUser || !selectedDate) return;
      try {
        setLoading(true);
        setErrorMessage('');
        setSaveSuccess(false);

        const [existingLog, profile, periods] = await Promise.all([
          getDailyLog(currentUser.uid, selectedDate),
          getUserProfile(currentUser.uid),
          getUserPeriods(currentUser.uid),
        ]);

        setUserProfile(profile);
        const mostRecentPeriod = periods?.[0] || null;
        setLatestPeriod(mostRecentPeriod);

        let currentFlow = 'none';

        if (existingLog) {
          currentFlow = existingLog.flow || 'none';
          setFlow(currentFlow);
          setMood(existingLog.mood || '');
          setSymptoms(Array.isArray(existingLog.symptoms) ? existingLog.symptoms : []);
          setWaterGlasses(
            typeof existingLog.waterGlasses === 'number' ? existingLog.waterGlasses : 4
          );
          setNotes(existingLog.notes || '');
        } else {
          // Reset to default empty log for unlogged days
          const defaults = getDefaultDailyLog(selectedDate);
          currentFlow = defaults.flow;
          setFlow(defaults.flow);
          setMood(defaults.mood);
          setSymptoms(defaults.symptoms);
          setWaterGlasses(defaults.waterGlasses);
          setNotes(defaults.notes);
        }

        // Evaluate period start suggestion
        const suggestion = shouldSuggestNewPeriod(
          selectedDate,
          currentFlow,
          mostRecentPeriod?.startDate,
          profile?.avgPeriodLength || 5
        );
        setMarkAsNewPeriod(suggestion.shouldSuggest);
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
  const isBleeding = flow === 'light' || flow === 'medium' || flow === 'heavy';

  function handleFlowSelect(flowId) {
    setFlow(flowId);
    setSaveSuccess(false);

    const suggestion = shouldSuggestNewPeriod(
      selectedDate,
      flowId,
      latestPeriod?.startDate,
      userProfile?.avgPeriodLength || 5
    );
    setMarkAsNewPeriod(suggestion.shouldSuggest);
  }

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
      setCycleUpdateMessage('');

      // 1. Save daily log
      await saveDailyLog(currentUser.uid, selectedDate, {
        flow,
        mood,
        symptoms,
        waterGlasses,
        notes,
      });

      // 2. If marked as new period start, record new period and update cycle averages (Task 4.3)
      if (markAsNewPeriod && isBleeding) {
        const periodResult = await recordNewPeriodAndRecalculate(currentUser.uid, selectedDate);
        if (periodResult.isNew) {
          if (periodResult.cycleLength) {
            setCycleUpdateMessage(
              `🌸 New cycle started on ${selectedDate}! Recorded previous cycle length of ${periodResult.cycleLength} days and updated your average cycle length to ${periodResult.newAvgCycleLength} days.`
            );
          } else {
            setCycleUpdateMessage(
              `🌸 New cycle started on ${selectedDate}!`
            );
          }
          // Update local state
          setLatestPeriod({ startDate: selectedDate, cycleLength: null });
          setUserProfile((prev) => ({
            ...prev,
            avgCycleLength: periodResult.newAvgCycleLength || prev?.avgCycleLength,
          }));
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
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
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white border border-pink-100 flex items-center justify-center text-textMuted hover:text-textMain hover:border-primary/40 transition-colors shadow-xs"
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
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-pink-100 bg-background flex items-center justify-center text-textMain hover:bg-pink-50 transition-colors"
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
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-pink-100 flex items-center justify-center transition-colors ${
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

        {/* Cycle update banner (Task 4.3) */}
        {cycleUpdateMessage && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-primary-soft/80 border border-primary/30 text-xs text-primary flex items-start gap-2.5 shadow-xs"
          >
            <span className="text-base leading-none mt-0.5">🌸</span>
            <div className="space-y-0.5">
              <p className="font-bold text-primary">New Cycle Recorded</p>
              <p className="text-[11px] leading-relaxed text-textMain">
                {cycleUpdateMessage}
              </p>
            </div>
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
                      onClick={() => handleFlowSelect(f.id)}
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

              {/* New Cycle Start Checkbox & Callout (Task 4.3) */}
              {isBleeding && (
                <div className="bg-primary-soft/40 border border-primary/20 rounded-xl p-3.5 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span>🌸</span>
                      <span>Cycle Start Tracking</span>
                    </span>
                    {latestPeriod?.startDate && (
                      <span className="text-[10px] text-textMuted">
                        Previous start: {latestPeriod.startDate}
                      </span>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={markAsNewPeriod}
                      onChange={(e) => setMarkAsNewPeriod(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <div className="text-xs space-y-0.5">
                      <span className="font-semibold text-textMain block">
                        Mark {isToday ? 'today' : selectedDate} as the start of a new period cycle
                      </span>
                      <span className="text-[11px] text-textMuted block leading-relaxed">
                        {latestPeriod?.startDate
                          ? `Will calculate previous cycle length (${Math.max(
                              1,
                              getDaysDifference(selectedDate, latestPeriod.startDate)
                            )} days) and automatically update your cycle predictions.`
                          : 'Will record this as your primary period start date.'}
                      </span>
                    </div>
                  </label>
                </div>
              )}
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
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white border border-pink-100 flex items-center justify-center font-bold text-base text-textMain hover:bg-pink-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
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
                      className={`min-h-[44px] min-w-[36px] flex items-center justify-center text-xl transition-transform hover:scale-110 ${
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
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white border border-pink-100 flex items-center justify-center font-bold text-base text-textMain hover:bg-pink-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
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

