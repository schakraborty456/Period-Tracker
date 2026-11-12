import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getUserProfile,
  getUserPeriods,
  getUserDailyLogs,
  updateRiskConsent,
} from '../services/firestore';
import {
  evaluateRiskFlags,
  MIN_COMPLETED_CYCLES,
  MIN_LOG_DAYS,
  MANDATORY_DISCLAIMER,
  INSUFFICIENT_DATA_MESSAGE,
} from '../utils/riskScreening';
import { getRiskFlagDetails, REVIEW_STATUS_LABEL } from '../data/riskFlags';
import { formatLocalDate } from '../utils/dateHelpers';
import Button from '../components/Button';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Insights() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [consentUpdating, setConsentUpdating] = useState(false);
  const [expandedFlagId, setExpandedFlagId] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  async function loadData() {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const [prof, userPeriods, userLogs] = await Promise.all([
        getUserProfile(currentUser.uid),
        getUserPeriods(currentUser.uid),
        getUserDailyLogs(currentUser.uid, 120), // Fetch up to 120 recent daily logs
      ]);

      setProfile(prof);
      setPeriods(userPeriods || []);
      setDailyLogs(userLogs || []);
    } catch (err) {
      console.error('Error loading insights data:', err);
      setError('Could not load your cycle data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGrantConsent() {
    if (!currentUser) return;
    try {
      setConsentUpdating(true);
      await updateRiskConsent(currentUser.uid, true);
      setProfile((prev) => ({ ...(prev || {}), riskConsent: true }));
    } catch (err) {
      console.error('Error updating consent:', err);
      alert('Could not save your consent preference. Please try again.');
    } finally {
      setConsentUpdating(false);
    }
  }

  async function handleRevokeConsent() {
    if (!currentUser) return;
    try {
      setConsentUpdating(true);
      await updateRiskConsent(currentUser.uid, false);
      setProfile((prev) => ({ ...(prev || {}), riskConsent: false }));
      setShowRevokeModal(false);
    } catch (err) {
      console.error('Error revoking consent:', err);
      alert('Could not update your preference. Please try again.');
    } finally {
      setConsentUpdating(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-8 pb-24 max-w-md mx-auto flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary-soft border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-textMuted">Analyzing your cycle patterns...</p>
        <BottomNav />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-8 pb-24 max-w-md mx-auto space-y-4">
        <Card className="text-center py-8 space-y-3">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-textMain">Something went wrong</h2>
          <p className="text-xs text-textMuted">{error}</p>
          <Button variant="secondary" onClick={loadData} className="text-xs">
            Try Again
          </Button>
        </Card>
        <BottomNav />
      </div>
    );
  }

  // If user has not completed onboarding
  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-8 pb-24 max-w-md mx-auto space-y-4">
        <Card className="text-center py-8 space-y-4">
          <div className="w-12 h-12 bg-primary-soft text-primary rounded-xl flex items-center justify-center mx-auto text-2xl">
            🌸
          </div>
          <h2 className="text-lg font-bold text-textMain">Set Up Your Profile First</h2>
          <p className="text-xs text-textMuted leading-relaxed">
            Please complete your onboarding setup so we can track and understand your natural cycle.
          </p>
          <Link to="/onboarding" className="inline-block">
            <Button variant="primary">Start Setup →</Button>
          </Link>
        </Card>
        <BottomNav />
      </div>
    );
  }

  // ----------------------------------------------------
  // UPFRONT CONSENT GATE (Rules.md Sec 5.2 & PRD Sec 7)
  // ----------------------------------------------------
  if (!profile.riskConsent) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-6 pb-24 max-w-md mx-auto space-y-5">
        <header className="text-center space-y-1">
          <span className="text-3xl">🔍</span>
          <h1 className="text-2xl font-bold font-heading text-textMain">
            Cycle Insights & Risk Screening
          </h1>
          <p className="text-xs text-textMuted">
            Pattern-based screening for PCOS, anemia, and pelvic wellness
          </p>
        </header>

        <Card className="space-y-4 border-2 border-pink-100">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="text-lg">🛡️</span>
            <span>Important Consent & Medical Disclaimer</span>
          </div>

          <div className="bg-primary-soft/50 rounded-xl p-3 border border-pink-200 text-xs text-textMain font-medium leading-relaxed">
            {MANDATORY_DISCLAIMER}
          </div>

          <div className="space-y-3 text-xs text-textMuted leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold text-primary mt-0.5">1.</span>
              <div>
                <strong className="text-textMain block font-semibold">Pattern Screening Only:</strong>
                This feature evaluates your logged cycle lengths, pain scores, and symptoms using rule-based algorithms to point out recurring patterns.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold text-primary mt-0.5">2.</span>
              <div>
                <strong className="text-textMain block font-semibold">Not a Medical Diagnosis:</strong>
                This is strictly NOT a diagnostic tool. We never say you have any medical condition. Only a licensed physician (such as a gynecologist) can diagnose you through clinical examinations and tests.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold text-primary mt-0.5">3.</span>
              <div>
                <strong className="text-textMain block font-semibold">Lifestyle-Only Guidance:</strong>
                All suggestions are limited to nutrition, hydration, sleep, stress management, and light home movement. We never prescribe medicines, drugs, or supplement dosages.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold text-primary mt-0.5">4.</span>
              <div>
                <strong className="text-textMain block font-semibold">Private & Under Your Control:</strong>
                Your health data is never shared with third parties for advertising. You can review or revoke this consent at any time.
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              fullWidth
              onClick={handleGrantConsent}
              disabled={consentUpdating}
              className="min-h-[48px]"
            >
              {consentUpdating ? 'Saving Preference...' : 'I Understand & Agree →'}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/')}
              className="text-xs text-textMuted min-h-[44px]"
            >
              Not Now, Return to Dashboard
            </Button>
          </div>
        </Card>

        <DisclaimerBanner variant="footer" />
        <BottomNav />
      </div>
    );
  }

  // ----------------------------------------------------
  // CONSENTED STATE: Evaluate pure risk screening rules
  // ----------------------------------------------------
  const todayStr = formatLocalDate(new Date());
  const screening = evaluateRiskFlags({
    periods,
    dailyLogs,
    today: todayStr,
  });

  const completedCyclesCount = periods.filter((p) => p && p.cycleLength != null).length;
  const uniqueLoggedDays = new Set(
    dailyLogs.filter((l) => l && l.date).map((l) => formatLocalDate(l.date))
  ).size;

  // Toggle flag expansion for lifestyle self-care details
  const toggleFlagExpansion = (flagId) => {
    setExpandedFlagId((prev) => (prev === flagId ? null : flagId));
  };

  return (
    <div className="min-h-screen bg-background text-textMain px-4 py-6 pb-24 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-textMain flex items-center gap-2">
            <span>Cycle Insights</span>
            <span className="text-xs px-2 py-0.5 bg-pink-100 text-primary font-semibold rounded-full">
              Beta
            </span>
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Rule-based health screening & pattern alerts
          </p>
        </div>
        <Link to="/log">
          <Button variant="secondary" className="text-xs px-3 py-1.5 min-h-[44px]">
            + Log Day
          </Button>
        </Link>
      </header>

      {/* Mandatory Non-Diagnostic Callout (Rules.md Sec 5.2) */}
      <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <span>🩺</span>
          <span>Screening Disclaimer</span>
        </div>
        <p className="text-xs font-semibold text-textMain leading-relaxed">
          {MANDATORY_DISCLAIMER}
        </p>
        <p className="text-[11px] text-textMuted leading-normal">
          This pattern check is calculated from your logged cycles and symptoms. It is meant to prepare you for helpful conversations with your gynecologist.
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CASE 1: Minimum Data Gate Not Reached                */}
      {/* ---------------------------------------------------- */}
      {!screening.hasEnoughData ? (
        <Card className="space-y-4 text-center py-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-amber-200">
            ⏳
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold font-heading text-textMain">
              {INSUFFICIENT_DATA_MESSAGE}
            </h2>
            <p className="text-xs text-textMuted max-w-xs mx-auto leading-relaxed">
              To detect genuine, reliable hormonal trends and avoid misleading alerts, the screening engine requires at least <strong>3 completed cycles</strong> OR <strong>60 days of daily symptom logs</strong>.
            </p>
          </div>

          {/* Progress Counters */}
          <div className="space-y-3 pt-2 text-left bg-background rounded-xl p-3 border border-pink-100/80">
            {/* Cycle progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-textMain">Completed Cycles</span>
                <span className="text-primary font-bold">
                  {completedCyclesCount} / {MIN_COMPLETED_CYCLES}
                </span>
              </div>
              <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((completedCyclesCount / MIN_COMPLETED_CYCLES) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Daily log progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-textMain">Days Logged</span>
                <span className="text-primary font-bold">
                  {uniqueLoggedDays} / {MIN_LOG_DAYS}
                </span>
              </div>
              <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((uniqueLoggedDays / MIN_LOG_DAYS) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Link to="/log" className="block">
              <Button variant="primary" fullWidth className="min-h-[44px]">
                Log Today's Symptoms →
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* ---------------------------------------------------- */
        /* CASE 2: Sufficient Data Available                   */
        /* ---------------------------------------------------- */
        <div className="space-y-4">
          {/* Data Summary Bar */}
          <div className="flex items-center justify-between text-xs bg-surface rounded-xl px-3.5 py-2.5 border border-pink-100 text-textMuted shadow-xs">
            <span>
              Data analyzed: <strong className="text-textMain">{completedCyclesCount} cycles</strong> &amp; <strong className="text-textMain">{uniqueLoggedDays} days</strong>
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span>✓</span> Gate met
            </span>
          </div>

          {/* Subcase 2A: No flags detected */}
          {screening.flags.length === 0 ? (
            <Card className="text-center py-6 space-y-3 border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/20">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                🌸
              </div>
              <h2 className="text-base font-bold font-heading text-textMain">
                No Unusual Risk Patterns Detected
              </h2>
              <p className="text-xs text-textMuted max-w-xs mx-auto leading-relaxed">
                Your logged cycle durations, bleeding streaks, and symptom records do not show signs of PCOS, anemia, severe pelvic pain, or prolonged absence.
              </p>
              <div className="pt-2 text-[11px] text-textMuted bg-background/80 rounded-xl p-3 border border-pink-100/70 text-left space-y-1">
                <p>• Continue tracking your bleeding days and pain levels consistently.</p>
                <p>• If you ever experience sudden severe pain, fever, or bleeding &gt; 7 days, speak to a doctor right away.</p>
              </div>
            </Card>
          ) : (
            /* Subcase 2B: One or more flags detected */
            <div className="space-y-4">
              {screening.flags.map((flag) => {
                const metadata = getRiskFlagDetails(flag.id);
                const isExpanded = expandedFlagId === flag.id;
                const isAlert = flag.id === 'see_doctor_soon';

                return (
                  <Card
                    key={flag.id}
                    className={`space-y-3.5 transition-all ${
                      isAlert
                        ? 'border-2 border-red-200 bg-red-50/20 shadow-sm'
                        : 'border border-pink-100 shadow-xs'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                            isAlert ? 'bg-red-100 text-red-700' : 'bg-primary-soft text-primary'
                          }`}
                        >
                          {metadata?.icon || '🔍'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isAlert
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {metadata?.badge || 'Pattern Notice'}
                            </span>
                            <span className="text-[10px] font-semibold text-textMuted px-2 py-0.5 rounded-full bg-background border border-pink-100">
                              {REVIEW_STATUS_LABEL}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold font-heading text-textMain mt-1">
                            {metadata?.title || flag.label}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Detected Pattern Reasons */}
                    <div className="bg-background/90 rounded-xl p-3 border border-pink-100/70 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted block">
                        What triggered this pattern:
                      </span>
                      <ul className="space-y-1 text-xs text-textMain">
                        {flag.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary font-bold mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Non-Diagnostic Doctor Referral Callout */}
                    <div className="text-xs bg-pink-50/70 rounded-xl p-2.5 border border-pink-200/60 text-primary-dark font-medium flex items-center gap-2">
                      <span className="text-base shrink-0">👩‍⚕️</span>
                      <span>
                        Please schedule a visit with a gynecologist to review these findings together.
                      </span>
                    </div>

                    {/* Collapsible Action Section: Lifestyle Tips & Doctor Talking Points */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleFlagExpansion(flag.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-primary py-2 px-3 rounded-xl bg-primary-soft/40 hover:bg-primary-soft/60 transition-colors min-h-[44px]"
                        aria-expanded={isExpanded}
                      >
                        <span>
                          {isExpanded
                            ? 'Hide Self-Care & Doctor Questions'
                            : 'View Lifestyle Self-Care & Doctor Questions'}
                        </span>
                        <span>{isExpanded ? '▲' : '▼'}</span>
                      </button>

                      {isExpanded && metadata && (
                        <div className="mt-3 space-y-3.5 pt-2 border-t border-pink-100">
                          {/* Lifestyle Recommendations */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold font-heading text-textMain flex items-center gap-1.5">
                                <span>🌿</span>
                                <span>Lifestyle-Only Self-Care Suggestions</span>
                              </h4>
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {metadata.reviewStatus}
                              </span>
                            </div>

                            <p className="text-[11px] text-textMuted italic">
                              Gentle day-to-day habits (food, hydration, movement, rest). Not medicine or treatment.
                            </p>

                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {metadata.lifestyleRecommendations.map((rec, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="bg-white rounded-xl p-2.5 border border-pink-100/80 shadow-xs text-xs space-y-0.5"
                                >
                                  <div className="flex items-center gap-1.5 font-bold text-textMain">
                                    <span>{rec.icon}</span>
                                    <span>{rec.title}</span>
                                    <span className="text-[10px] text-textMuted font-normal ml-auto">
                                      {rec.category}
                                    </span>
                                  </div>
                                  <p className="text-textMuted text-[11px] leading-relaxed pl-5">
                                    {rec.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Doctor Discussion Points */}
                          {metadata.doctorDiscussionPoints?.length > 0 && (
                            <div className="bg-primary-soft/20 rounded-xl p-3 border border-pink-100 space-y-2">
                              <h4 className="text-xs font-bold font-heading text-textMain flex items-center gap-1.5">
                                <span>📋</span>
                                <span>Questions to Ask Your Doctor</span>
                              </h4>
                              <ul className="space-y-1 text-[11px] text-textMuted">
                                {metadata.doctorDiscussionPoints.map((point, pIdx) => (
                                  <li key={pIdx} className="flex items-start gap-1.5">
                                    <span className="text-primary font-bold">✓</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Consent Review / Revoke Option */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowRevokeModal(true)}
          className="text-[11px] text-textMuted underline hover:text-textMain min-h-[44px] px-3"
        >
          Review or Revoke Screening Consent
        </button>
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full space-y-3 text-center py-5">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-base font-bold text-textMain">Revoke Screening Consent?</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              If you revoke consent, your cycle risk screening cards will be hidden until you agree again.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowRevokeModal(false)}
                className="text-xs min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleRevokeConsent}
                disabled={consentUpdating}
                className="text-xs min-h-[44px]"
              >
                {consentUpdating ? 'Revoking...' : 'Yes, Revoke'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Medical Disclaimer */}
      <DisclaimerBanner variant="footer" className="mt-4" />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
