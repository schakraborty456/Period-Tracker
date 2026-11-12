import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getUserPeriods } from '../services/firestore';
import { calculateCycleSummary, getCycleLengthsFromPeriods } from '../utils/cycleCalculator';
import {
  WORKOUT_ROUTINES,
  WORKOUT_SAFETY_NOTICE,
  WORKOUT_REVIEW_STATUS,
} from '../data/workouts';
import Button from '../components/Button';
import Card from '../components/Card';
import PhaseBadge from '../components/PhaseBadge';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Workouts() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'phase' | 'symptom'
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('all');
  const [selectedSymptomFilter, setSelectedSymptomFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'Easy' | 'Medium'

  // Routine Player / Detail Modal state
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Initialize from URL search params if present (e.g., /workouts?symptom=cramps)
  useEffect(() => {
    const symptomParam = searchParams.get('symptom');
    const phaseParam = searchParams.get('phase');

    if (symptomParam) {
      setActiveTab('symptom');
      setSelectedSymptomFilter(symptomParam);
    } else if (phaseParam) {
      setActiveTab('phase');
      setSelectedPhaseFilter(phaseParam);
    }
  }, [searchParams]);

  // Load user data to recommend workout for current phase
  useEffect(() => {
    async function loadUserPhase() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [prof, userPeriods] = await Promise.all([
          getUserProfile(currentUser.uid),
          getUserPeriods(currentUser.uid),
        ]);

        if (prof && userPeriods?.length > 0 && userPeriods[0]?.startDate) {
          const cycleLengths = getCycleLengthsFromPeriods(userPeriods);
          const summary = calculateCycleSummary(
            userPeriods[0].startDate,
            {
              cycleLength: prof.avgCycleLength,
              cycleHistory: cycleLengths.length > 0 ? cycleLengths : [prof.avgCycleLength],
            },
            prof.avgPeriodLength
          );
          if (summary?.currentPhase) {
            setCurrentPhase(summary.currentPhase);
          }
        }
      } catch (err) {
        console.error('Error loading current phase for workouts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserPhase();
  }, [currentUser]);

  // Filtered workouts
  const filteredWorkouts = WORKOUT_ROUTINES.filter((w) => {
    // Level filter
    if (levelFilter !== 'all' && w.level !== levelFilter) {
      return false;
    }

    // Category / Tab filter
    if (activeTab === 'phase') {
      if (selectedPhaseFilter !== 'all' && w.phase !== selectedPhaseFilter && w.phase !== 'all') {
        return false;
      }
    } else if (activeTab === 'symptom') {
      if (selectedSymptomFilter !== 'all' && w.symptomTag !== selectedSymptomFilter) {
        return false;
      }
    }

    return true;
  });

  // Recommended routine matching user's current cycle phase
  const recommendedWorkout = currentPhase
    ? WORKOUT_ROUTINES.find((w) => w.phase === currentPhase) || WORKOUT_ROUTINES[0]
    : null;

  function handleOpenWorkout(workout) {
    setActiveWorkout(workout);
    setActiveStepIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCloseWorkout() {
    setActiveWorkout(null);
    setActiveStepIndex(0);
  }

  return (
    <div className="min-h-screen bg-background text-textMain px-4 py-6 pb-24 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold font-heading text-textMain flex items-center gap-2">
            <span>Home Workouts</span>
            <span className="text-xl">🧘‍♀️</span>
          </h1>
          <span className="text-[10px] font-semibold text-textMuted bg-white px-2.5 py-1 rounded-full border border-pink-100 shadow-xs">
            {WORKOUT_REVIEW_STATUS}
          </span>
        </div>
        <p className="text-xs text-textMuted leading-relaxed">
          10–20 minute gentle home routines tailored by cycle phase and symptom relief.
        </p>
      </header>

      {/* Safety Notice Banner */}
      <div className="bg-primary-soft/40 border border-pink-200/80 rounded-2xl p-3 text-xs text-textMain space-y-1 shadow-xs">
        <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] uppercase tracking-wider">
          <span>🌿</span>
          <span>Gentle Movement Guidance</span>
        </div>
        <p className="text-[11px] text-textMuted leading-relaxed">
          {WORKOUT_SAFETY_NOTICE}
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* RECOMMENDED FOR CURRENT PHASE (if detected)          */}
      {/* ---------------------------------------------------- */}
      {recommendedWorkout && (
        <Card className="bg-gradient-to-r from-pink-50/70 via-purple-50/40 to-white border border-pink-100 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Current Phase Match
              </span>
            </div>
            {currentPhase && <PhaseBadge phase={currentPhase} size="sm" />}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white text-2xl flex items-center justify-center shrink-0 shadow-xs border border-pink-100">
              {recommendedWorkout.icon}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold font-heading text-textMain">
                {recommendedWorkout.title}
              </h3>
              <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                {recommendedWorkout.summary}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-textMuted">
                <span>⏱️ {recommendedWorkout.durationMinutes} min</span>
                <span>•</span>
                <span className="font-medium text-primary-dark">
                  Level: {recommendedWorkout.level}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => handleOpenWorkout(recommendedWorkout)}
            className="text-xs min-h-[44px]"
          >
            Start Routine ({recommendedWorkout.durationMinutes} min) →
          </Button>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* FILTER CONTROLS                                      */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-2.5">
        {/* Main Category Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface rounded-xl border border-pink-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchParams({});
            }}
            className={`py-2 rounded-lg transition-colors min-h-[44px] flex items-center justify-center ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            All Workouts
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('phase');
              setSearchParams({ phase: selectedPhaseFilter });
            }}
            className={`py-2 rounded-lg transition-colors min-h-[44px] flex items-center justify-center ${
              activeTab === 'phase'
                ? 'bg-primary text-white shadow-xs'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            By Phase
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('symptom');
              setSearchParams({ symptom: selectedSymptomFilter });
            }}
            className={`py-2 rounded-lg transition-colors min-h-[44px] flex items-center justify-center ${
              activeTab === 'symptom'
                ? 'bg-primary text-white shadow-xs'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            By Symptom
          </button>
        </div>

        {/* Sub-Filters: By Phase */}
        {activeTab === 'phase' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'all', label: 'All Phases' },
              { id: 'menstrual', label: '🩸 Menstrual' },
              { id: 'follicular', label: '🌱 Follicular' },
              { id: 'ovulation', label: '✨ Ovulation' },
              { id: 'luteal', label: '🌙 Luteal' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPhaseFilter(p.id);
                  setSearchParams({ phase: p.id });
                }}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap min-h-[44px] flex items-center ${
                  selectedPhaseFilter === p.id
                    ? 'border-primary bg-primary-soft text-primary font-bold'
                    : 'border-pink-100 bg-white text-textMuted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Sub-Filters: By Symptom / Focus */}
        {activeTab === 'symptom' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'all', label: 'All Focuses' },
              { id: 'cramps', label: '⚡ Cramps Relief' },
              { id: 'pcos', label: '🌸 PCOS Rhythm' },
              { id: 'bloating', label: '🫧 Bloat Relief' },
              { id: 'back_pain', label: '🧘 Back Soother' },
              { id: 'fatigue', label: '🛌 Rest & Fatigue' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSymptomFilter(s.id);
                  setSearchParams({ symptom: s.id });
                }}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap min-h-[44px] flex items-center ${
                  selectedSymptomFilter === s.id
                    ? 'border-primary bg-primary-soft text-primary font-bold'
                    : 'border-pink-100 bg-white text-textMuted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Level Filter Pills */}
        <div className="flex items-center justify-between text-xs px-1 text-textMuted">
          <span className="text-[11px] font-medium">Difficulty Level:</span>
          <div className="flex items-center gap-1.5">
            {['all', 'Easy', 'Medium'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors min-h-[36px] flex items-center ${
                  levelFilter === lvl
                    ? 'bg-textMain text-white font-semibold'
                    : 'bg-white border border-pink-100 text-textMuted hover:text-textMain'
                }`}
              >
                {lvl === 'all' ? 'Any' : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* WORKOUT CARDS LIST                                   */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-3.5">
        {filteredWorkouts.length === 0 ? (
          <Card className="text-center py-8 space-y-2">
            <span className="text-2xl">🔍</span>
            <p className="text-xs text-textMuted">No workouts found matching this filter.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setActiveTab('all');
                setLevelFilter('all');
                setSelectedPhaseFilter('all');
                setSelectedSymptomFilter('all');
                setSearchParams({});
              }}
              className="text-xs min-h-[44px]"
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          filteredWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className="space-y-3 border border-pink-100 hover:border-pink-200 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-xl shrink-0">
                    {workout.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-primary">
                        {workout.phase === 'all' ? 'All Phases' : `${workout.phase} Phase`}
                      </span>
                      {workout.symptomTag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {workout.symptomTag} relief
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold font-heading text-textMain mt-1">
                      {workout.title}
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-textMuted bg-background px-2 py-1 rounded-lg border border-pink-100 shrink-0">
                  {workout.durationMinutes} min
                </span>
              </div>

              <p className="text-xs text-textMuted leading-relaxed">
                {workout.summary}
              </p>

              {/* Highlights & benefits */}
              <div className="bg-background/80 rounded-xl p-2.5 border border-pink-100/70 text-[11px] text-textMuted space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-textMain block">
                  Routine Focus:
                </span>
                <ul className="space-y-0.5">
                  {workout.benefits.slice(0, 2).map((b, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-1.5">
                      <span className="text-primary font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-textMuted font-medium">
                  {workout.poses.length} gentle poses • Level: {workout.level}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => handleOpenWorkout(workout)}
                  className="text-xs px-3 py-1.5 min-h-[44px]"
                >
                  View Routine →
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* INTERACTIVE ROUTINE PLAYER / DETAIL MODAL            */}
      {/* ---------------------------------------------------- */}
      {activeWorkout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface max-w-md w-full rounded-2xl shadow-xl border border-pink-100 max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-primary-soft/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeWorkout.icon}</span>
                <div>
                  <h3 className="text-sm font-bold font-heading text-textMain">
                    {activeWorkout.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-textMuted">
                    <span>⏱️ {activeWorkout.durationMinutes} min</span>
                    <span>•</span>
                    <span>Level: {activeWorkout.level}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseWorkout}
                className="w-9 h-9 rounded-full bg-white text-textMuted hover:text-textMain border border-pink-100 flex items-center justify-center text-sm font-bold min-h-[44px] min-w-[44px]"
                aria-label="Close routine"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs font-semibold text-textMuted">
                <span>
                  Step {activeStepIndex + 1} of {activeWorkout.poses.length}
                </span>
                <span className="text-primary">
                  {activeWorkout.poses[activeStepIndex].duration}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-pink-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(((activeStepIndex + 1) / activeWorkout.poses.length) * 100)}%`,
                  }}
                />
              </div>

              {/* Current Pose Card */}
              {(() => {
                const pose = activeWorkout.poses[activeStepIndex];
                return (
                  <Card className="bg-background border border-pink-100 space-y-3 py-4">
                    <div className="text-center space-y-1">
                      <span className="text-4xl inline-block mb-1">{pose.icon}</span>
                      <h4 className="text-base font-bold font-heading text-textMain">
                        {pose.name}
                      </h4>
                      <span className="inline-block text-xs font-semibold text-primary bg-white px-2.5 py-0.5 rounded-full border border-pink-200">
                        Hold / Repeat: {pose.duration}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      <div>
                        <strong className="text-textMain block font-semibold mb-0.5">
                          How to do it:
                        </strong>
                        <p className="text-textMuted leading-relaxed">{pose.instructions}</p>
                      </div>

                      <div className="bg-white rounded-xl p-2.5 border border-pink-100/80 text-[11px]">
                        <strong className="text-primary block font-semibold mb-0.5">
                          Why it helps:
                        </strong>
                        <p className="text-textMuted leading-normal">{pose.benefit}</p>
                      </div>
                    </div>
                  </Card>
                );
              })()}

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeStepIndex === 0}
                  className="text-xs min-h-[44px]"
                >
                  ← Previous
                </Button>

                {activeStepIndex < activeWorkout.poses.length - 1 ? (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setActiveStepIndex((prev) => prev + 1)}
                    className="text-xs min-h-[44px]"
                  >
                    Next Pose →
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCloseWorkout}
                    className="text-xs min-h-[44px] bg-emerald-600 hover:bg-emerald-700"
                  >
                    Complete Routine ✓
                  </Button>
                )}
              </div>

              {/* All poses quick list */}
              <div className="space-y-1.5 pt-2 border-t border-pink-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted block">
                  All Poses in this Routine:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {activeWorkout.poses.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between transition-colors min-h-[44px] ${
                        idx === activeStepIndex
                          ? 'border-primary bg-primary-soft/50 font-bold text-primary'
                          : 'border-pink-50 bg-white text-textMuted hover:bg-pink-50/20'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                      </span>
                      <span className="text-[10px] text-textMuted font-normal">{p.duration}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety notice */}
              <p className="text-[11px] text-textMuted italic text-center leading-normal pt-1">
                {WORKOUT_SAFETY_NOTICE}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Medical Disclaimer */}
      <DisclaimerBanner variant="footer" className="mt-4" />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
