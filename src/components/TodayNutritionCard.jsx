import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getNutritionTips, NUTRITION_METADATA } from '../data/nutritionTips.js';
import Card from './Card.jsx';

export default function TodayNutritionCard({
  phase = 'menstrual',
  dietPreference = 'non-veg',
  className = '',
}) {
  const [selectedDiet, setSelectedDiet] = useState(dietPreference);
  const [activeTab, setActiveTab] = useState('eat'); // 'eat' | 'avoid'

  // Update selectedDiet when prop changes (e.g., initial profile load)
  React.useEffect(() => {
    if (dietPreference) {
      setSelectedDiet(dietPreference);
    }
  }, [dietPreference]);

  const tips = getNutritionTips(phase, selectedDiet);

  const diets = [
    { key: 'non-veg', label: 'Non-Veg', icon: '🍗' },
    { key: 'veg', label: 'Vegetarian', icon: '🥗' },
    { key: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  ];

  return (
    <Card className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-pink-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🥗</span>
            <h3 className="text-base font-bold font-heading text-textMain">
              Today's Nutrition Guide
            </h3>
          </div>
          <p className="text-xs text-textMuted mt-0.5">
            Phase-specific foods for your {tips.phaseName}
          </p>
        </div>

        {/* Diet Filter Chips */}
        <div className="flex items-center bg-background p-1 rounded-xl border border-pink-100/80 self-start sm:self-auto">
          {diets.map((d) => {
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

      {/* Focus Banner */}
      <div className="bg-primary-soft/40 border border-primary/20 rounded-xl p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          Nutritional Focus
        </p>
        <p className="text-xs text-textMain font-medium mt-0.5 leading-relaxed">
          {tips.focus}
        </p>
      </div>

      {/* Eat vs Avoid Switcher Tabs */}
      <div className="flex gap-2 p-1 bg-background rounded-xl border border-pink-100/70">
        <button
          type="button"
          onClick={() => setActiveTab('eat')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
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
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'avoid'
              ? 'bg-amber-50 text-amber-900 shadow-xs border border-amber-200'
              : 'text-textMuted hover:text-textMain'
          }`}
        >
          <span>⚠️</span>
          <span>Avoid or Reduce ({tips.avoid?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Foods to Eat */}
      {activeTab === 'eat' && (
        <div className="space-y-2.5 pt-1">
          {tips.eat?.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-background/60 border border-pink-100/70 flex items-start gap-3 hover:bg-background transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-lg flex-shrink-0 border border-pink-50">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-textMain">{item.food}</p>
                <p className="text-xs text-textMuted leading-relaxed">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Foods to Avoid / Reduce */}
      {activeTab === 'avoid' && (
        <div className="space-y-2.5 pt-1">
          {tips.avoid?.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-sm flex-shrink-0 border border-amber-100">
                🚫
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-amber-950">{item.item}</p>
                <p className="text-xs text-amber-800 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Self-Care / Movement Box */}
      {tips.selfCare && (
        <div className="p-3.5 rounded-xl bg-pink-50/50 border border-pink-100 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <span>✨</span>
            <span>Self-Care & Movement Tip</span>
          </div>
          <p className="text-textMuted leading-relaxed">{tips.selfCare}</p>
        </div>
      )}

      {/* Review Status & Disclaimer Footer */}
      <div className="pt-2 border-t border-pink-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-textMuted">
        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
          <span>ℹ️</span>
          <span>Content status: {NUTRITION_METADATA.reviewStatus}</span>
        </span>
        <Link
          to="/tips"
          className="text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <span>Explore all 4 phases →</span>
        </Link>
      </div>
    </Card>
  );
}

