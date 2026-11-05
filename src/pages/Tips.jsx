import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getUserPeriods } from '../services/firestore';
import { calculateCycleSummary, getCycleLengthsFromPeriods } from '../utils/cycleCalculator';
import { getNutritionTips, NUTRITION_METADATA } from '../data/nutritionTips';
import Card from '../components/Card';
import PhaseBadge from '../components/PhaseBadge';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';

const PHASES = [
  {
    key: 'menstrual',
    name: 'Menstrual',
    icon: '🩸',
    days: 'Days 1–5',
    color: '#E85D75',
    accentBg: 'bg-rose-50',
    borderColor: 'border-rose-200',
    activeTabClass: 'border-primary bg-primary text-white shadow-sm',
  },
  {
    key: 'follicular',
    name: 'Follicular',
    icon: '🌱',
    days: 'Days 6–13',
    color: '#6CC299',
    accentBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    activeTabClass: 'border-emerald-500 bg-emerald-500 text-white shadow-sm',
  },
  {
    key: 'ovulation',
    name: 'Ovulation',
    icon: '✨',
    days: 'Days 14–16',
    color: '#F7C948',
    accentBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    activeTabClass: 'border-amber-500 bg-amber-500 text-white shadow-sm',
  },
  {
    key: 'luteal',
    name: 'Luteal',
    icon: '🌙',
    days: 'Days 17–28',
    color: '#9B8AE0',
    accentBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    activeTabClass: 'border-purple-600 bg-purple-600 text-white shadow-sm',
  },
];

const DIETS = [
  { key: 'non-veg', label: 'Non-Veg', icon: '🍗' },
  { key: 'veg', label: 'Vegetarian', icon: '🥗' },
  { key: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
];

export default function Tips() {
  const { currentUser } = useAuth();
  const [selectedPhase, setSelectedPhase] = useState('menstrual');
  const [selectedDiet, setSelectedDiet] = useState('non-veg');
  const [activeTab, setActiveTab] = useState('eat'); // 'eat' | 'avoid' | 'both'
  const [userCurrentPhase, setUserCurrentPhase] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile & current cycle phase
  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const [profile, periods] = await Promise.all([
          getUserProfile(currentUser.uid),
          getUserPeriods(currentUser.uid),
        ]);

        if (profile?.dietPreference) {
          setSelectedDiet(profile.dietPreference);
        }

        if (periods?.[0]?.startDate && profile) {
          const cycleLengths = getCycleLengthsFromPeriods(periods);
          const summary = calculateCycleSummary(
            periods[0].startDate,
            {
              cycleLength: profile.avgCycleLength,
              cycleHistory: cycleLengths.length > 0 ? cycleLengths : [profile.avgCycleLength],
            },
            profile.avgPeriodLength
          );

          if (summary?.currentPhase) {
            setUserCurrentPhase(summary.currentPhase);
            setSelectedPhase(summary.currentPhase);
          }
        }
      } catch (err) {
        console.error('Error loading user phase for tips:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [currentUser]);

  const currentPhaseConfig = PHASES.find((p) => p.key === selectedPhase) || PHASES[0];
  const tips = getNutritionTips(selectedPhase, selectedDiet);

  return (
    <div className="min-h-screen bg-background text-textMain px-4 pt-6 pb-28 md:pb-12">
      <div className="max-w-2xl mx-auto space-y-5">
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
                Cycle Nutrition Guide
              </h1>
              <p className="text-xs text-textMuted">Phase-by-phase nourishment & wellness</p>
            </div>
          </div>

          <span className="text-xs font-semibold text-primary bg-primary-soft/50 px-2.5 py-1 rounded-full border border-pink-100 hidden sm:inline-flex items-center gap-1">
            <span>🥗</span>
            <span>4 Phases</span>
          </span>
        </header>

        {/* Medical & Expert Review Disclaimer Notice */}
        <div
          role="note"
          className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1 shadow-xs"
        >
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <span>ℹ️</span>
              <span>Review Status: {NUTRITION_METADATA.reviewStatus}</span>
            </span>
            <span className="text-[11px] uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              General Guide
            </span>
          </div>
          <p className="text-amber-800/90 leading-relaxed text-[11px]">
            {NUTRITION_METADATA.disclaimer}
          </p>
        </div>

        {/* 4 Phase Navigation Tabs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">
              Select Cycle Phase
            </span>
            {userCurrentPhase && (
              <span className="text-[11px] text-textMuted">
                Your current phase: <strong className="text-primary capitalize">{userCurrentPhase}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PHASES.map((p) => {
              const isSelected = selectedPhase === p.key;
              const isUserCurrent = userCurrentPhase === p.key;

              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelectedPhase(p.key)}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[76px] ${
                    isSelected
                      ? `${p.accentBg} ${p.borderColor} border-2 shadow-xs ring-1 ring-primary/20`
                      : 'bg-white border-pink-100/90 hover:border-pink-200 hover:bg-pink-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">{p.icon}</span>
                    {isUserCurrent && (
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-pink-200 shadow-xs">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <p
                      className={`text-xs font-bold ${
                        isSelected ? 'text-textMain' : 'text-textMuted'
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="text-[10px] text-textMuted">{p.days}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Phase Overview Banner */}
        <Card className="space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-pink-50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PhaseBadge phase={selectedPhase} size="md" />
                <span className="text-xs font-semibold text-textMuted bg-background px-2.5 py-0.5 rounded-full border border-pink-100">
                  {tips.theme}
                </span>
              </div>
              <p className="text-xs text-textMuted pt-1 leading-relaxed">
                {tips.overview}
              </p>
            </div>
          </div>

          {/* Diet Switcher within phase */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span className="text-xs font-semibold text-textMain flex items-center gap-1.5">
              <span>🍽️</span>
              <span>Filter by Diet Preference:</span>
            </span>

            <div className="flex items-center bg-background p-1 rounded-xl border border-pink-100/80 self-start sm:self-auto">
              {DIETS.map((d) => {
                const isSelected = selectedDiet === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDiet(d.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-white text-primary font-semibold shadow-xs'
                        : 'text-textMuted hover:text-textMain'
                    }`}
                  >
                    <span>{d.icon}</span>
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Callout */}
          <div className="bg-primary-soft/40 border border-primary/20 rounded-xl p-3.5 space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Nutritional Focus for this Phase
            </p>
            <p className="text-xs text-textMain font-medium leading-relaxed">
              {tips.focus}
            </p>
          </div>
        </Card>

        {/* Tab Switcher: Foods to Eat vs Foods to Avoid */}
        <div className="flex gap-2 p-1 bg-white rounded-2xl border border-pink-100 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('eat')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'eat'
                ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <span>🌱</span>
            <span>Foods to Eat ({tips.eat?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avoid')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'avoid'
                ? 'bg-amber-50 text-amber-900 shadow-xs border border-amber-200'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <span>⚠️</span>
            <span>Foods to Reduce ({tips.avoid?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Recommended Foods to Eat */}
        {activeTab === 'eat' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <span>🌱</span>
                <span>Recommended Foods ({tips.dietPreference})</span>
              </h3>
              <span className="text-[11px] text-textMuted">
                Locally available Indian / Bengali options
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.eat?.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-3.5 bg-white border-pink-100/80 hover:border-pink-200 transition-all flex items-start gap-3 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-50/70 border border-pink-100/80 shadow-xs flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-textMain leading-snug">
                      {item.food}
                    </p>
                    <p className="text-xs text-textMuted leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Foods to Avoid / Reduce */}
        {activeTab === 'avoid' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Foods to Limit or Avoid</span>
              </h3>
              <span className="text-[11px] text-textMuted">
                Helps ease cramps, bloating & fatigue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.avoid?.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-3.5 bg-amber-50/30 border-amber-200/80 transition-all flex items-start gap-3 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-amber-200/80 shadow-xs flex items-center justify-center text-lg flex-shrink-0 text-amber-800">
                    🚫
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-950 leading-snug">
                      {item.item}
                    </p>
                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Self-Care, Movement & Rest Card */}
        {tips.selfCare && (
          <Card className="p-4 bg-gradient-to-r from-pink-50/60 to-purple-50/40 border-pink-100 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span>✨</span>
              <span>Movement & Rest Guide for {currentPhaseConfig.name}</span>
            </div>
            <p className="text-xs text-textMain leading-relaxed font-normal">
              {tips.selfCare}
            </p>
          </Card>
        )}

        {/* Quick link back to Dashboard */}
        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <span>← Back to your Cycle Dashboard</span>
          </Link>
        </div>

        {/* Medical Disclaimer Banner */}
        <DisclaimerBanner variant="footer" className="mt-2" />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

