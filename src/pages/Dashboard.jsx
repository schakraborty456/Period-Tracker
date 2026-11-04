import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getUserPeriods } from '../services/firestore';
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
          /* Profile & Onboarding Complete Card */
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-pink-100 relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <span>✓</span>
                <span>Profile & Cycle Saved</span>
              </span>
              <span className="text-xs text-textMuted">
                {currentUser?.email}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold font-heading text-textMain">
                Welcome back{profile.name ? `, ${profile.name}` : ''}!
              </h2>
              <p className="text-xs text-textMuted mt-1">
                Your profile and cycle baseline are stored safely in Firestore.
              </p>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
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

            <div className="pt-2">
              <Link to="/onboarding" className="block">
                <Button variant="secondary" fullWidth className="text-xs">
                  Edit Cycle Details
                </Button>
              </Link>
            </div>
          </div>
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

        {/* Next step teaser */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-pink-100">
          <h3 className="text-xs font-semibold font-heading text-textMain uppercase tracking-wider mb-2">
            Next in Phase 2
          </h3>
          <p className="text-xs text-textMuted leading-relaxed">
            Task 2.3: Pure deterministic cycle calculator functions (<code className="bg-pink-50 px-1 py-0.5 rounded text-primary">cycleCalculator.js</code>) to predict your next period, ovulation day, and current phase.
          </p>
        </div>
      </div>
    </div>
  );
}
