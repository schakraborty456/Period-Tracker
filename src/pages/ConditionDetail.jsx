import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  getConditionById,
  CONDITIONS_REVIEW_STATUS,
  CONDITIONS_DISCLAIMER,
} from '../data/conditions';
import { getWorkoutById } from '../data/workouts';
import { getRelatedConditions } from '../utils/conditionHelpers';

// Category style accents
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

// Home comfort tip groups
const COMFORT_TYPES = [
  { key: 'food', label: 'Food & Nutrition', icon: '🥗' },
  { key: 'sleep', label: 'Rest & Sleep', icon: '🛌' },
  { key: 'stress', label: 'Stress & Calm', icon: '🧘‍♀️' },
  { key: 'hydration', label: 'Hydration', icon: '💧' },
  { key: 'heatAndMovement', label: 'Warmth & Movement', icon: '🔥' },
];

export default function ConditionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const condition = getConditionById(id);

  // Accordion state: first two ("What is it", "Common signs") and "Home comfort" are open by default
  const [openSections, setOpenSections] = useState({
    whatIsIt: true,
    symptoms: true,
    homeComfort: true,
    doctorChecks: false,
    mythsVsFacts: false,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Unknown condition fallback
  if (!condition) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-12 flex flex-col items-center justify-center pb-24">
        <Card className="max-w-sm w-full text-center space-y-4 p-6 border-pink-100 bg-surface shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-primary rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🔍
          </div>
          <h1 className="text-lg font-bold font-heading text-textMain">Condition Not Found</h1>
          <p className="text-xs text-textMuted leading-relaxed">
            We couldn’t find an educational guide matching &ldquo;{id}&rdquo;. It may have moved or
            been renamed in our library.
          </p>
          <div className="pt-2">
            <Link to="/conditions" className="inline-block w-full">
              <Button variant="primary" fullWidth className="min-h-[44px]">
                ← Back to Conditions Library
              </Button>
            </Link>
          </div>
        </Card>
        <BottomNav />
      </div>
    );
  }

  const catStyle =
    CATEGORY_STYLES[condition.category] || {
      bg: 'bg-pink-50',
      text: 'text-primary',
      border: 'border-pink-200',
      icon: '📖',
    };

  // Resolve related workouts and related conditions
  const relatedWorkouts = (condition.relatedWorkoutIds || [])
    .map((wId) => getWorkoutById(wId))
    .filter(Boolean);

  const relatedConditions = getRelatedConditions(condition.id, 2);

  return (
    <div className="min-h-screen bg-background text-textMain pb-24">
      {/* Sticky Top Header */}
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
          <span className="text-xs font-semibold text-textMain truncate max-w-[200px]">
            {condition.shortName}
          </span>
          <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
            {CONDITIONS_REVIEW_STATUS}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Title & Metadata Header Card */}
        <Card className="p-5 border-pink-100 bg-surface space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              <span>{catStyle.icon}</span>
              <span>{condition.categoryLabel}</span>
            </span>

            <span className="text-[10px] text-textMuted bg-background px-2 py-0.5 rounded-md border border-pink-100">
              Educational Guide
            </span>
          </div>

          <h1 className="text-xl font-bold font-heading text-textMain leading-snug">
            {condition.title}
          </h1>

          {/* Standard Medical Disclaimer near top */}
          <div className="bg-pink-50/70 border border-pink-200/80 rounded-xl p-3 text-[11px] text-textMuted leading-relaxed flex items-start gap-2">
            <span className="text-sm shrink-0">🌸</span>
            <span>{CONDITIONS_DISCLAIMER}</span>
          </div>
        </Card>

        {/* SECTION 1: What is it (Summary) - Expandable Accordion (Open by default) */}
        <Card className="p-0 border-pink-100 overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => toggleSection('whatIsIt')}
            aria-expanded={openSections.whatIsIt}
            className="w-full min-h-[44px] px-4 py-3.5 flex items-center justify-between text-left font-bold font-heading text-sm text-textMain hover:bg-pink-50/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">📖</span>
              <span>What is it?</span>
            </span>
            <span className="text-xs text-textMuted font-semibold px-2">
              {openSections.whatIsIt ? '▲' : '▼'}
            </span>
          </button>
          {openSections.whatIsIt && (
            <div className="px-4 pb-4 pt-1 border-t border-pink-50 text-xs text-textMain leading-relaxed space-y-2">
              <p>{condition.summary}</p>
            </div>
          )}
        </Card>

        {/* SECTION 2: Common signs (Symptoms) - Expandable Accordion (Open by default) */}
        <Card className="p-0 border-pink-100 overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => toggleSection('symptoms')}
            aria-expanded={openSections.symptoms}
            className="w-full min-h-[44px] px-4 py-3.5 flex items-center justify-between text-left font-bold font-heading text-sm text-textMain hover:bg-pink-50/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🔍</span>
              <span>Common signs & symptoms</span>
            </span>
            <span className="text-xs text-textMuted font-semibold px-2">
              {openSections.symptoms ? '▲' : '▼'}
            </span>
          </button>
          {openSections.symptoms && (
            <div className="px-4 pb-4 pt-1 border-t border-pink-50 text-xs text-textMain space-y-2">
              <p className="text-[11px] text-textMuted italic">
                Symptoms can vary widely between individuals. Not everyone experiences every sign:
              </p>
              <ul className="space-y-2 pt-1">
                {condition.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-primary text-xs shrink-0 mt-0.5">•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* SECTION 3: When to see a doctor (Red Flags) - Always visible by default with calm highlight */}
        <section
          aria-labelledby="when-to-see-doctor-heading"
          className="bg-rose-50/50 border-l-4 border-l-rose-400 border-t border-r border-b border-rose-100 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2
              id="when-to-see-doctor-heading"
              className="font-bold font-heading text-sm text-textMain flex items-center gap-2"
            >
              <span>🩺</span>
              <span>When to see a doctor</span>
            </h2>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full">
              Clinical Red Flags
            </span>
          </div>

          <p className="text-xs text-textMuted leading-relaxed">
            Please schedule a consultation with a gynecologist or healthcare professional promptly if
            you notice any of the following:
          </p>

          <ul className="space-y-2 pt-1">
            {condition.whenToSeeDoctor.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-textMain leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-100/80"
              >
                <span className="text-rose-500 font-bold shrink-0">⚠️</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-1">
            <Link to="/report" className="block">
              <Button
                variant="ghost"
                fullWidth
                className="text-xs min-h-[44px] bg-white border border-rose-200 text-rose-800 hover:bg-rose-100/50 font-semibold"
              >
                📋 View or Print Doctor Report for Consultation
              </Button>
            </Link>
          </div>
        </section>

        {/* SECTION 4: Home comfort tips - Expandable Accordion */}
        <Card className="p-0 border-pink-100 overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => toggleSection('homeComfort')}
            aria-expanded={openSections.homeComfort}
            className="w-full min-h-[44px] px-4 py-3.5 flex items-center justify-between text-left font-bold font-heading text-sm text-textMain hover:bg-pink-50/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🌿</span>
              <span>Home comfort & lifestyle tips</span>
            </span>
            <span className="text-xs text-textMuted font-semibold px-2">
              {openSections.homeComfort ? '▲' : '▼'}
            </span>
          </button>
          {openSections.homeComfort && (
            <div className="px-4 pb-4 pt-1 border-t border-pink-50 space-y-3">
              {/* Mandatory Home Care Intro Line per Task 6.2k */}
              <div className="p-2.5 rounded-xl bg-pink-50/60 border border-pink-100 text-[11px] text-textMuted italic leading-relaxed">
                These may help ease discomfort. They are not a treatment.
              </div>

              {/* Grouped Comfort Categories */}
              <div className="space-y-2.5 pt-1">
                {COMFORT_TYPES.map(({ key, label, icon }) => {
                  const tipText = condition.homeComfort?.[key];
                  if (!tipText) return null;
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-background border border-pink-100 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <span>{icon}</span>
                        <span>{label}</span>
                      </div>
                      <p className="text-xs text-textMain leading-relaxed font-normal">
                        {tipText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* SECTION 5: What a doctor may check - Expandable Accordion */}
        <Card className="p-0 border-pink-100 overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => toggleSection('doctorChecks')}
            aria-expanded={openSections.doctorChecks}
            className="w-full min-h-[44px] px-4 py-3.5 flex items-center justify-between text-left font-bold font-heading text-sm text-textMain hover:bg-pink-50/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🩺</span>
              <span>What a doctor may check</span>
            </span>
            <span className="text-xs text-textMuted font-semibold px-2">
              {openSections.doctorChecks ? '▲' : '▼'}
            </span>
          </button>
          {openSections.doctorChecks && (
            <div className="px-4 pb-4 pt-1 border-t border-pink-50 text-xs text-textMain space-y-2">
              <p className="text-[11px] text-textMuted leading-relaxed">
                Doctor visits can feel intimidating. Here are common, standard clinical assessments
                a gynecologist may consider:
              </p>
              <ul className="space-y-2 pt-1">
                {condition.whatDoctorMayCheck.map((checkItem, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 leading-relaxed bg-background p-2.5 rounded-xl border border-pink-100"
                  >
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{checkItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* SECTION 6: Myths vs facts - Expandable Accordion */}
        <Card className="p-0 border-pink-100 overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => toggleSection('mythsVsFacts')}
            aria-expanded={openSections.mythsVsFacts}
            className="w-full min-h-[44px] px-4 py-3.5 flex items-center justify-between text-left font-bold font-heading text-sm text-textMain hover:bg-pink-50/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>Myths vs. facts</span>
            </span>
            <span className="text-xs text-textMuted font-semibold px-2">
              {openSections.mythsVsFacts ? '▲' : '▼'}
            </span>
          </button>
          {openSections.mythsVsFacts && (
            <div className="px-4 pb-4 pt-1 border-t border-pink-50 space-y-3">
              {condition.mythsVsFacts.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  {/* Myth Block */}
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs leading-relaxed space-y-1">
                    <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                      💭 Common Myth
                    </span>
                    <p className="text-amber-950">{item.myth}</p>
                  </div>

                  {/* Fact Block */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs leading-relaxed space-y-1">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider">
                      ✅ Evidence Fact
                    </span>
                    <p className="text-emerald-950">{item.fact}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* RELATED SECTION AT BOTTOM */}
        <div className="space-y-3 pt-2">
          {/* Related Workouts */}
          {relatedWorkouts.length > 0 && (
            <Card className="p-4 border-pink-100 bg-surface space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-heading text-xs text-textMain flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🧘‍♀️</span>
                  <span>Related Home Workouts</span>
                </h3>
                <span className="text-[10px] text-textMuted">10–20 min</span>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">
                Gentle guided routines designed to soothe discomfort and support body rhythm:
              </p>
              <div className="space-y-2">
                {relatedWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    to={`/workouts?routine=${workout.id}`}
                    className="block group"
                  >
                    <div className="p-3 rounded-xl border border-pink-200 bg-white group-hover:border-primary group-hover:bg-pink-50/30 transition-all flex items-center justify-between min-h-[44px]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{workout.icon || '🧘‍♀️'}</span>
                        <div>
                          <h4 className="text-xs font-semibold text-textMain group-hover:text-primary transition-colors">
                            {workout.title}
                          </h4>
                          <span className="text-[10px] text-textMuted">
                            {workout.durationMinutes} min • {workout.level} Level
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-textMuted group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                        Start →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Related Risk Flag in Insights */}
          {condition.relatedRiskFlagId && (
            <Card className="p-4 border-pink-100 bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-purple-50/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <span>🔍</span>
                <span>Cycle Pattern Insights</span>
              </div>
              <p className="text-xs text-textMain/80 leading-relaxed">
                Our app monitors your cycle history and daily symptom logs for possible pattern
                indicators of {condition.shortName}.
              </p>
              <div className="pt-1">
                <Link to="/insights" className="block">
                  <Button
                    variant="secondary"
                    fullWidth
                    className="text-xs min-h-[44px] bg-white border border-pink-200 text-primary hover:bg-pink-50 font-semibold"
                  >
                    View Pattern Insights →
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Related Conditions in Same Category */}
          {relatedConditions.length > 0 && (
            <Card className="p-4 border-pink-100 bg-surface space-y-3">
              <h3 className="font-bold font-heading text-xs text-textMain uppercase tracking-wider flex items-center gap-1.5">
                <span>📚</span>
                <span>Other Guides in {condition.categoryLabel}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedConditions.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/conditions/${rel.id}`}
                    className="p-3 rounded-xl border border-pink-100 bg-background hover:border-pink-300 hover:bg-pink-50/30 transition-all flex items-center justify-between min-h-[44px] group"
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-semibold text-textMain group-hover:text-primary transition-colors block truncate">
                        {rel.title}
                      </span>
                      <span className="text-[10px] text-textMuted block truncate">
                        {rel.shortName}
                      </span>
                    </div>
                    <span className="text-xs text-textMuted group-hover:translate-x-0.5 transition-transform shrink-0">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Back to Conditions Library CTA */}
          <div className="text-center pt-2">
            <Link
              to="/conditions"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline min-h-[44px] px-3 py-2"
            >
              <span>← Back to all {condition.categoryLabel} Conditions</span>
            </Link>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <DisclaimerBanner variant="footer" className="mt-4" />
      </main>

      <BottomNav />
    </div>
  );
}
