import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getUserPeriods } from '../services/firestore';
import { calculateCycleSummary } from '../utils/cycleCalculator';
import Button from '../components/Button';

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

  const cycleSummary =
    periods[0]?.startDate && profile
      ? calculateCycleSummary(
          periods[0].startDate,
          profile.avgCycleLength,
          profile.avgPeriodLength
        )
      : null;

  return (
    <div className="min-h-screen bg-background text-textMain px-4 py-6 md:py-10">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top bar */}
        <header className="flex items-center justify-between pb-4 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center text-xl shadow-xs">
              🌸
            </div>
            <div>
              <h1 className="text-lg font-semibold font-heading text-textMain leading-tight">
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
          <div className="bg-surface rounded-2xl p-8 shadow-sm border border-pink-100 text-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-textMuted">Loading your cycle details...</p>
          </div>
        ) : profile ? (
          <>
            {/* Live Cycle Prediction Card */}
            {cycleSummary && (
              <div className="bg-surface rounded-2xl p-6 shadow-sm border border-pink-100 space-y-4 relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-40"
                  style={{ backgroundColor: cycleSummary.phaseDetails.color }}
                />

                <div className="flex items-center justify-between relative z-10">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
                    style={{
                      backgroundColor: cycleSummary.phaseDetails.badgeBg,
                      color: cycleSummary.phaseDetails.color,
                    }}
                  >
                    <span>{cycleSummary.phaseDetails.icon}</span>
                    <span>{cycleSummary.phaseDetails.name}</span>
                  </span>
                  <span className="text-xs font-semibold text-textMuted bg-background px-2.5 py-1 rounded-full border border-pink-100">
                    Day {cycleSummary.cycleDay} of cycle
                  </span>
                </div>

                <div className="relative z-10">
                  <h2 className="text-xl font-bold font-heading text-textMain">
                    {cycleSummary.isLate
                      ? `Period is ${cycleSummary.daysLate} day${cycleSummary.daysLate > 1 ? 's' : ''} late`
                      : cycleSummary.daysUntilNextPeriod === 0
                      ? 'Period expected today'
                      : `Next period expected in ${cycleSummary.daysUntilNextPeriod} days`}
                  </h2>
                  <p className="text-xs text-textMuted mt-1 leading-relaxed">
                    {cycleSummary.phaseDetails.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-pink-50 text-xs relative z-10">
                  <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                    <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                      Next Period
                    </span>
                    <span className="font-bold text-primary text-sm mt-0.5 block">
                      {cycleSummary.nextPeriodDate}
                    </span>
                  </div>
                  <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                    <span className="text-textMuted block text-[11px] uppercase tracking-wider font-medium">
                      Ovulation Window
                    </span>
                    <span className="font-bold text-textMain text-sm mt-0.5 block">
                      {cycleSummary.ovulationDate}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Baseline Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-pink-100 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  <span>✓</span>
                  <span>Profile & Baseline Saved</span>
                </span>
                <span className="text-xs text-textMuted">
                  {currentUser?.email}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold font-heading text-textMain">
                  Your Cycle Baseline
                </h3>
                <p className="text-xs text-textMuted mt-0.5">
                  Stored securely in Firestore for personalized insights.
                </p>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <p className="text-[11px] uppercase tracking-wider text-textMuted font-medium">
                    Average Cycle
                  </p>
                  <p className="text-base font-bold font-heading text-primary mt-0.5">
                    {profile.avgCycleLength} <span className="text-xs font-normal text-textMuted">days</span>
                  </p>
                </div>

                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <p className="text-[11px] uppercase tracking-wider text-textMuted font-medium">
                    Period Length
                  </p>
                  <p className="text-base font-bold font-heading text-primary mt-0.5">
                    {profile.avgPeriodLength} <span className="text-xs font-normal text-textMuted">days</span>
                  </p>
                </div>

                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <p className="text-[11px] uppercase tracking-wider text-textMuted font-medium">
                    Diet Preference
                  </p>
                  <p className="text-xs font-semibold text-textMain mt-1">
                    {dietLabels[profile.dietPreference] || profile.dietPreference}
                  </p>
                </div>

                <div className="bg-background rounded-xl p-3 border border-pink-100/70">
                  <p className="text-[11px] uppercase tracking-wider text-textMuted font-medium">
                    Last Period Start
                  </p>
                  <p className="text-xs font-semibold text-textMain mt-1">
                    {periods[0]?.startDate || 'Recorded'}
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <Link to="/onboarding" className="block">
                  <Button variant="secondary" fullWidth className="text-xs">
                    Edit Cycle Details
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Profile Empty / Onboarding Required Card */
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-pink-100 relative overflow-hidden space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold">
              <span>✨</span>
              <span>Action Needed</span>
            </div>

            <h2 className="text-xl font-bold font-heading text-textMain">
              Let's Personalize Your Cycle
            </h2>

            <p className="text-textMuted text-sm leading-relaxed">
              Complete your 3-step onboarding to save your last period date, typical cycle lengths, and diet preferences to Firestore.
            </p>

            <Link to="/onboarding" className="block pt-2">
              <Button variant="primary" fullWidth>
                Start Onboarding Now →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
