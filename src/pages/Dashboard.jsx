import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getUserPeriods } from '../services/firestore';
import {
  calculateCycleSummary,
  getCycleLengthsFromPeriods,
  getPhaseDetails,
} from '../utils/cycleCalculator';
import Button from '../components/Button';
import Card from '../components/Card';
import PhaseBadge from '../components/PhaseBadge';
import CycleRing from '../components/CycleRing';
import BottomNav from '../components/BottomNav';
import TodayNutritionCard from '../components/TodayNutritionCard';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [userProf, userPeriods] = await Promise.all([
          getUserProfile(currentUser.uid),
          getUserPeriods(currentUser.uid),
        ]);
        setProfile(userProf);
        setPeriods(userPeriods);
      } catch (err) {
        console.error('Error loading user data from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [currentUser]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
    } catch (err) {
      console.error('Failed to log out', err);
    } finally {
      setLoggingOut(false);
    }
  }

  const dietLabels = {
    'non-veg': '🍗 Non-Vegetarian',
    veg: '🥗 Vegetarian',
    eggetarian: '🥚 Eggetarian',
  };

  const cycleLengths = getCycleLengthsFromPeriods(periods);
  const cycleSummary =
    periods[0]?.startDate && profile
      ? calculateCycleSummary(
          periods[0].startDate,
          {
            cycleLength: profile.avgCycleLength,
            cycleHistory: cycleLengths.length > 0 ? cycleLengths : [profile.avgCycleLength],
          },
          profile.avgPeriodLength
        )
      : null;

  // Phase breakdown calculations for current cycle
  const totalDays = cycleSummary?.effectiveCycleLength || profile?.avgCycleLength || 28;
  const periodDays = profile?.avgPeriodLength || 5;
  const ovulationDay = Math.max(periodDays + 2, totalDays + 1 - 14);
  const ovStart = Math.max(periodDays + 1, ovulationDay - 1);
  const ovEnd = Math.min(totalDays, ovulationDay + 1);

  const phaseBreakdown = [
    {
      key: 'menstrual',
      name: 'Menstrual',
      icon: '🩸',
      days: `Days 1–${periodDays}`,
      color: '#E85D75',
      badgeBg: '#FDE7F0',
    },
    {
      key: 'follicular',
      name: 'Follicular',
      icon: '🌱',
      days: `Days ${periodDays + 1}–${Math.max(periodDays + 1, ovStart - 1)}`,
      color: '#6CC299',
      badgeBg: '#E8F7F0',
    },
    {
      key: 'ovulation',
      name: 'Ovulation',
      icon: '✨',
      days: `Days ${ovStart}–${ovEnd}`,
      color: '#F7C948',
      badgeBg: '#FEF8E7',
    },
    {
      key: 'luteal',
      name: 'Luteal',
      icon: '🌙',
      days: `Days ${ovEnd + 1}–${totalDays}`,
      color: '#9B8AE0',
      badgeBg: '#F2F0FB',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-textMain px-4 pt-6 pb-24 md:pb-12">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center text-xl shadow-xs">
              🌸
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading text-textMain leading-tight">
                Period Tracker
              </h1>
              <p className="text-xs text-textMuted">Cycle & Nutrition Guide</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            loading={loggingOut}
            className="text-xs !min-h-[38px] !px-3"
          >
            Sign Out
          </Button>
        </header>

        {/* Loading state */}
        {loading ? (
          <Card className="text-center p-8">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-textMuted">Loading your cycle details...</p>
          </Card>
        ) : profile ? (
          <>
            {/* HERO PHASE CARD WITH CYCLE RING (Task 3.2 Core) */}
            {cycleSummary && (
              <Card className="relative overflow-hidden space-y-5">
                {/* Background Ambient Glow matching current phase */}
                <div
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25 transition-all duration-500"
                  style={{ backgroundColor: cycleSummary.phaseDetails.color }}
                />

                {/* Top Badge Row */}
                <div className="flex items-center justify-between relative z-10">
                  <PhaseBadge phase={cycleSummary.currentPhase} size="md" />
                  <span className="text-xs font-semibold text-textMuted bg-background px-3 py-1 rounded-full border border-pink-100">
                    Day {cycleSummary.cycleDay} of {cycleSummary.effectiveCycleLength}
                  </span>
                </div>

                {/* Center Visual: The Cycle Ring */}
                <div className="flex justify-center py-2 relative z-10">
                  <CycleRing
                    cycleDay={cycleSummary.cycleDay}
                    cycleLength={cycleSummary.effectiveCycleLength}
                    periodLength={profile.avgPeriodLength}
                    currentPhase={cycleSummary.currentPhase}
                    isLate={cycleSummary.isLate}
                    daysLate={cycleSummary.daysLate}
                    daysUntilNextPeriod={cycleSummary.daysUntilNextPeriod}
                    size={220}
                  />
                </div>

                {/* Status Heading & Description */}
                <div className="text-center relative z-10">
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-textMain">
                    {cycleSummary.isLate
                      ? `Your period is ${cycleSummary.daysLate} day${cycleSummary.daysLate > 1 ? 's' : ''} late`
                      : cycleSummary.daysUntilNextPeriod === 0
                      ? 'Period is expected today'
                      : `Next period expected in ${cycleSummary.daysUntilNextPeriod} days`}
                  </h2>
                  <p className="text-xs text-textMuted mt-1.5 max-w-md mx-auto leading-relaxed">
                    {cycleSummary.phaseDetails.description}
                  </p>
                </div>

                {/* Next Period & Ovulation Estimates Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-pink-50 text-xs relative z-10">
                  <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                    <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                      Expected Period
                    </span>
                    <span className="font-bold text-primary text-sm mt-0.5 block">
                      around {cycleSummary.nextPeriodDate}
                    </span>
                  </div>
                  <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                    <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                      Fertile Window
                    </span>
                    <span className="font-bold text-textMain text-sm mt-0.5 block">
                      {cycleSummary.fertileWindow.startDate} to {cycleSummary.fertileWindow.endDate}
                    </span>
                  </div>
                </div>

                {/* Quick Log Button (Phase 4 integration placeholder) */}
                <div className="pt-1 relative z-10">
                  <Link to="/log" className="block">
                    <Button variant="primary" fullWidth className="shadow-sm">
                      <span>🌸</span>
                      <span>Log Daily Symptoms & Flow</span>
                    </Button>
                  </Link>
                </div>

                {/* Calculation method indicator */}
                {cycleSummary.isAveraged && (
                  <div className="text-[11px] text-textMuted bg-background px-3 py-1.5 rounded-lg border border-pink-100/80 flex items-center justify-between">
                    <span>Calculation logic:</span>
                    <span className="font-medium text-textMain">
                      Average of last 3 recorded cycles ({cycleSummary.effectiveCycleLength} days)
                    </span>
                  </div>
                )}
              </Card>
            )}

            {/* Irregular Cycle Notice (if detected) */}
            {cycleSummary?.isIrregular && (
              <div
                role="note"
                className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs"
              >
                <span className="text-lg leading-none mt-0.5">⚠️</span>
                <div className="space-y-1">
                  <p className="font-semibold text-amber-950 font-heading">
                    Irregular Cycle Notice
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    {cycleSummary.irregularMessage ||
                      'Cycle variation observed. Predictions are shown as estimated ranges.'}
                  </p>
                </div>
              </div>
            )}

            {/* TODAY'S NUTRITION & SELF-CARE GUIDE (Task 3.3) */}
            <TodayNutritionCard
              phase={cycleSummary?.currentPhase || 'menstrual'}
              dietPreference={profile.dietPreference || 'non-veg'}
            />

            {/* 4 PHASES BREAKDOWN STRIP */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold font-heading uppercase tracking-wider text-textMuted">
                  Cycle Phases Breakdown
                </h3>
                <span className="text-xs text-textMuted font-medium">
                  Total: {totalDays} days
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {phaseBreakdown.map((p) => {
                  const isActive = cycleSummary?.currentPhase === p.key;
                  return (
                    <div
                      key={p.key}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-primary bg-primary-soft/40 shadow-xs ring-1 ring-primary/30'
                          : 'border-pink-100/80 bg-background/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{p.icon}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-pink-200">
                            Now
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-textMain">{p.name}</p>
                      <p className="text-[11px] text-textMuted mt-0.5">{p.days}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Profile Baseline Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  <span>✓</span>
                  <span>Baseline Profile</span>
                </span>
                <span className="text-xs text-textMuted truncate max-w-[180px]">
                  {profile.name || currentUser?.email}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                    Typical Cycle
                  </span>
                  <span className="font-bold text-primary text-base mt-0.5 block">
                    {profile.avgCycleLength} <span className="text-xs font-normal text-textMuted">days</span>
                  </span>
                </div>

                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                    Period Bleeding
                  </span>
                  <span className="font-bold text-primary text-base mt-0.5 block">
                    {profile.avgPeriodLength} <span className="text-xs font-normal text-textMuted">days</span>
                  </span>
                </div>

                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                    Diet Choice
                  </span>
                  <span className="font-semibold text-textMain text-xs mt-1 block">
                    {dietLabels[profile.dietPreference] || profile.dietPreference}
                  </span>
                </div>

                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                    Last Period Start
                  </span>
                  <span className="font-semibold text-textMain text-xs mt-1 block">
                    {periods[0]?.startDate || 'Recorded'}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <Link to="/onboarding" className="block">
                  <Button variant="secondary" fullWidth className="text-xs">
                    Update Cycle Details
                  </Button>
                </Link>
              </div>
            </Card>
          </>
        ) : (
          /* Onboarding Required Card */
          <Card className="space-y-4 text-center py-8">
            <div className="w-14 h-14 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-xs">
              🌸
            </div>

            <h2 className="text-xl font-bold font-heading text-textMain">
              Personalize Your Cycle Tracker
            </h2>

            <p className="text-textMuted text-sm leading-relaxed max-w-sm mx-auto">
              Complete your 3-step setup to unlock phase predictions, cycle ring visualization, and personalized nutrition guidance.
            </p>

            <div className="pt-2">
              <Link to="/onboarding" className="inline-block w-full max-w-xs">
                <Button variant="primary" fullWidth>
                  Start Onboarding Now →
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
