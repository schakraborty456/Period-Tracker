import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

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

        {/* Hero Card */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-pink-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-soft/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
            <span>✨</span>
            <span>Protected Dashboard</span>
          </div>

          <h2 className="text-xl font-bold font-heading text-textMain mb-2">
            Welcome to your Dashboard!
          </h2>

          <p className="text-textMuted text-sm leading-relaxed mb-5">
            You are successfully authenticated. Your personal cycle predictions, phase guidance, and daily logs will appear here once onboarding is completed in Phase 2.
          </p>

          <div className="bg-background rounded-xl p-4 border border-pink-100/80 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-textMuted">Account Email:</span>
              <span className="font-medium text-textMain bg-white px-2.5 py-1 rounded-lg border border-pink-100">
                {currentUser?.email}
              </span>
            </div>
          </div>

          <Link to="/onboarding" className="block">
            <Button variant="primary" fullWidth>
              Start Cycle Onboarding →
            </Button>
          </Link>
        </div>

        {/* Up Next Preview Card */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-pink-100">
          <h3 className="text-sm font-semibold font-heading text-textMain uppercase tracking-wider mb-3">
            Upcoming Roadmap (Phase 2 & 3)
          </h3>
          <ul className="space-y-2.5 text-xs text-textMuted">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-100 text-primary flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span>3-Step Onboarding (Last period date, cycle & period lengths)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-100 text-primary flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span>Rule-based cycle calculator (predict next period & current phase)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-100 text-primary flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <span>Phase-wise nutrition tips (veg / non-veg / eggetarian)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

