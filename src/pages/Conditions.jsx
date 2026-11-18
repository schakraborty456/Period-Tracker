import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  CONDITIONS,
  CONDITION_CATEGORIES,
  filterConditions,
  CONDITIONS_REVIEW_STATUS,
} from '../data/conditions';

// Category color accents per Design.md
const CATEGORY_STYLES = {
  'pain-discomfort': {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: '⚡',
  },
  'hormonal-systemic': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: '🌸',
  },
  'flow-blood': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: '🩸',
  },
  'cycle-irregularity': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: '🗓️',
  },
};

export default function Conditions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter conditions based on category and live search
  const filteredConditions = useMemo(() => {
    return filterConditions({
      category: selectedCategory,
      query: searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="min-h-screen bg-background text-textMain pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-pink-100 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-textMuted hover:text-textMain rounded-full hover:bg-pink-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Go back"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-lg font-bold font-heading text-textMain flex items-center gap-1.5">
                <span>📚</span>
                <span>Conditions Library</span>
              </h1>
              <p className="text-[11px] text-textMuted">
                Educational reference guides & comfort care
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-rose-50 text-primary border border-pink-200 px-2 py-0.5 rounded-full font-semibold">
            {CONDITIONS.length} Guides
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Intro Banner */}
        <Card className="p-4 bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-purple-50/40 border-pink-100 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <span>✨</span>
            <span>Educational & Non-Diagnostic</span>
          </div>
          <p className="text-xs text-textMain leading-relaxed font-normal">
            Understand common menstrual, hormonal, and pelvic symptoms in plain English. Learn
            everyday comfort tips and recognize key signs to discuss with your gynecologist.
          </p>
        </Card>

        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="conditions-search" className="sr-only">
            Search conditions, symptoms, or topics
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textMuted text-sm">
            <span>🔍</span>
          </div>
          <input
            id="conditions-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PCOS, cramps, anemia, symptoms..."
            className="w-full pl-10 pr-10 py-2.5 min-h-[44px] rounded-2xl bg-surface border border-pink-200 text-xs text-textMain placeholder:text-textMuted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center min-h-[44px] min-w-[44px] text-textMuted hover:text-textMain"
              aria-label="Clear search text"
            >
              <span className="text-sm font-bold">✕</span>
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div>
          <div className="flex items-center justify-between pb-1.5 px-0.5">
            <span className="text-[11px] font-semibold text-textMuted uppercase tracking-wider">
              Browse by Category
            </span>
            <span className="text-[11px] text-textMuted">
              {filteredConditions.length} of {CONDITIONS.length}
            </span>
          </div>
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none"
            role="tablist"
            aria-label="Condition categories"
          >
            {CONDITION_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'bg-primary border-primary text-white shadow-sm font-semibold'
                      : 'bg-surface border-pink-200 text-textMuted hover:text-textMain hover:border-pink-300'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition List Cards */}
        {filteredConditions.length > 0 ? (
          <div className="space-y-3" role="list">
            {filteredConditions.map((condition) => {
              const catStyle =
                CATEGORY_STYLES[condition.category] || {
                  bg: 'bg-pink-50',
                  text: 'text-primary',
                  border: 'border-pink-200',
                  icon: '📖',
                };

              return (
                <Link
                  key={condition.id}
                  to={`/conditions/${condition.id}`}
                  className="block group rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  role="listitem"
                >
                  <Card className="p-4 border-pink-100 group-hover:border-pink-300 transition-all group-hover:shadow-md space-y-2.5">
                    {/* Top Row: Category Pill & Needs Expert Review Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        <span>{catStyle.icon}</span>
                        <span>{condition.categoryLabel}</span>
                      </span>

                      <span className="text-[10px] bg-amber-50 text-amber-900/90 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                        {CONDITIONS_REVIEW_STATUS}
                      </span>
                    </div>

                    {/* Condition Title */}
                    <div>
                      <h2 className="text-sm font-bold font-heading text-textMain group-hover:text-primary transition-colors flex items-center justify-between">
                        <span>{condition.title}</span>
                        <span className="text-textMuted text-xs group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </h2>
                      <p className="text-xs text-textMuted line-clamp-2 leading-relaxed mt-1">
                        {condition.summary}
                      </p>
                    </div>

                    {/* Common Symptoms Snippet */}
                    {condition.symptoms && condition.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {condition.symptoms.slice(0, 3).map((sym, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-background border border-pink-100 text-textMuted px-2 py-0.5 rounded-md"
                          >
                            {sym.length > 28 ? sym.substring(0, 26) + '...' : sym}
                          </span>
                        ))}
                        {condition.symptoms.length > 3 && (
                          <span className="text-[10px] text-textMuted self-center pl-0.5">
                            +{condition.symptoms.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Prompt */}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-primary font-semibold border-t border-pink-50">
                      <span>View Symptoms & Comfort Care</span>
                      <span aria-hidden="true">Explore Guide ↗</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="p-8 text-center space-y-3 border-pink-100 bg-surface">
            <div className="w-12 h-12 bg-pink-50 text-primary rounded-2xl flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-sm font-bold font-heading text-textMain">
              No conditions found, try another word
            </h3>
            <p className="text-xs text-textMuted leading-relaxed max-w-xs mx-auto">
              We couldn’t find any condition matching &ldquo;{searchQuery}&rdquo;. Try another term
              such as &ldquo;cramps&rdquo;, &ldquo;PCOS&rdquo;, &ldquo;anemia&rdquo;, or reset your filters.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-primary-soft text-primary hover:bg-pink-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Reset Search & Filters
              </button>
            </div>
          </Card>
        )}

        {/* Medical Disclaimer Banner */}
        <DisclaimerBanner variant="footer" className="mt-4" />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
