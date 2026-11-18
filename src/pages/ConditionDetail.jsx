import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { getConditionById, CONDITIONS_REVIEW_STATUS } from '../data/conditions';

export default function ConditionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const condition = getConditionById(id);

  if (!condition) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-8 flex flex-col items-center justify-center pb-24">
        <Card className="max-w-sm w-full text-center space-y-4 p-6">
          <div className="w-12 h-12 bg-rose-50 text-primary rounded-2xl flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <h2 className="text-lg font-bold font-heading text-textMain">Condition Not Found</h2>
          <p className="text-xs text-textMuted leading-relaxed">
            The condition guide you requested could not be located in our library.
          </p>
          <div className="pt-2">
            <Link to="/conditions" className="inline-block">
              <button
                type="button"
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-rose-600 transition-colors"
              >
                ← Back to Conditions Library
              </button>
            </Link>
          </div>
        </Card>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textMain pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-pink-100 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/conditions')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-textMuted hover:text-textMain rounded-full hover:bg-pink-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to Conditions Library"
          >
            <span className="text-xl">←</span>
          </button>
          <span className="text-xs font-semibold text-textMuted truncate max-w-[200px]">
            {condition.shortName}
          </span>
          <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
            {CONDITIONS_REVIEW_STATUS}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Placeholder Card */}
        <Card className="p-6 space-y-4 border-pink-100 bg-surface">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-primary border border-pink-200">
              {condition.categoryLabel}
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-900/90 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              {CONDITIONS_REVIEW_STATUS}
            </span>
          </div>

          <h1 className="text-lg font-bold font-heading text-textMain leading-snug">
            {condition.title}
          </h1>

          <p className="text-xs text-textMuted leading-relaxed">
            {condition.summary}
          </p>

          {/* Coming Soon Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50/70 to-purple-50/50 border border-pink-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <span>⏳</span>
              <span>Full Guide Coming Soon</span>
            </div>
            <p className="text-xs text-textMain/80 leading-relaxed">
              Task 6.2k is scheduled to build the complete interactive guide for {condition.shortName},
              including common symptoms, when to see a doctor (red flags), non-medicinal comfort care
              (food, sleep, stress, hydration, heat), clinical tests overview, myths vs. facts, and
              tailored home workouts.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link to="/conditions" className="block">
              <button
                type="button"
                className="w-full min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-rose-600 transition-colors"
              >
                ← Back to Conditions Library
              </button>
            </Link>
            <Link to="/workouts" className="block">
              <button
                type="button"
                className="w-full min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-pink-200 text-primary hover:bg-pink-50 transition-colors"
              >
                🧘‍♀️ Explore Guided Home Workouts
              </button>
            </Link>
          </div>
        </Card>

        <DisclaimerBanner variant="footer" className="mt-4" />
      </main>

      <BottomNav />
    </div>
  );
}
