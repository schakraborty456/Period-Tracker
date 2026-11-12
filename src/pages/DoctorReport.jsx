import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getUserPeriods, getUserDailyLogs } from '../services/firestore';
import { generateDoctorReportData } from '../utils/doctorReportHelpers';
import { formatLocalDate } from '../utils/dateHelpers';
import Button from '../components/Button';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function DoctorReport() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        setError(null);
        const [profile, periods, dailyLogs] = await Promise.all([
          getUserProfile(currentUser.uid),
          getUserPeriods(currentUser.uid),
          getUserDailyLogs(currentUser.uid, 180), // Up to 6 months of daily logs
        ]);

        const data = generateDoctorReportData({
          profile: profile || {},
          periods: periods || [],
          dailyLogs: dailyLogs || [],
          today: formatLocalDate(new Date()),
        });

        setReportData(data);
      } catch (err) {
        console.error('Error generating doctor report:', err);
        setError('Failed to generate report data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser]);

  function handlePrint() {
    window.print();
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-8 pb-24 max-w-md mx-auto flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary-soft border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-textMuted">Compiling clinical consultation report...</p>
        <BottomNav />
      </div>
    );
  }

  // Error state
  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-background text-textMain px-4 py-8 pb-24 max-w-md mx-auto space-y-4">
        <Card className="text-center py-8 space-y-3">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-textMain">Unable to Load Report</h2>
          <p className="text-xs text-textMuted">{error || 'Data unavailable.'}</p>
          <Link to="/insights">
            <Button variant="secondary" className="text-xs">
              ← Return to Insights
            </Button>
          </Link>
        </Card>
        <BottomNav />
      </div>
    );
  }

  const {
    patientInfo,
    cycleMetrics,
    flowMetrics,
    painMetrics,
    symptomMetrics,
    screeningMetrics,
    discussionPoints,
  } = reportData;

  const getPainSeverityLabel = (score) => {
    if (score === null || score === undefined) return 'Not Logged';
    if (score === 0) return 'No Pain';
    if (score <= 3) return 'Mild';
    if (score <= 6) return 'Moderate';
    return 'Severe (Clinical Attention)';
  };

  return (
    <div className="min-h-screen bg-background text-textMain px-4 py-6 pb-24 max-w-2xl mx-auto space-y-4 print:bg-white print:p-0 print:max-w-none print:text-black">
      {/* ---------------------------------------------------- */}
      {/* SCREEN-ONLY TOP ACTION BAR                           */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-pink-100 print:hidden">
        <Link to="/insights">
          <Button variant="ghost" className="text-xs min-h-[44px]">
            ← Back to Insights
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handlePrint}
            className="text-xs min-h-[44px] flex items-center gap-1.5 shadow-sm"
          >
            <span>🖨️</span>
            <span>Print / Save as PDF</span>
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* REPORT DOCUMENT CONTAINER                            */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-4 print:space-y-4">
        {/* Document Header Card */}
        <Card className="p-5 border-2 border-pink-100/80 bg-white space-y-3 print:border print:border-gray-300 print:shadow-none print:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-pink-50 pb-3 print:border-gray-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft/60 px-2.5 py-0.5 rounded-full border border-pink-200 print:border-gray-400 print:bg-gray-100 print:text-gray-800">
                Gynecologist Consultation Summary
              </span>
              <h1 className="text-xl font-bold font-heading text-textMain mt-1.5 print:text-black">
                Menstrual Health &amp; Cycle Log Report
              </h1>
              <p className="text-xs text-textMuted print:text-gray-600">
                Patient-reported cycle durations, pain scores, and symptom patterns
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-textMuted shrink-0 print:text-gray-600">
              <span className="block font-semibold text-textMain print:text-black">Report Date</span>
              <span>{patientInfo.reportDate}</span>
            </div>
          </div>

          {/* Patient Baseline Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block print:text-gray-500">
                Patient Name
              </span>
              <span className="font-bold text-textMain text-sm block mt-0.5 print:text-black">
                {patientInfo.name}
              </span>
            </div>

            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block print:text-gray-500">
                Age
              </span>
              <span className="font-bold text-textMain text-sm block mt-0.5 print:text-black">
                {patientInfo.age ? `${patientInfo.age} yrs` : 'Not specified'}
              </span>
            </div>

            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block print:text-gray-500">
                Typical Cycle Length
              </span>
              <span className="font-bold text-primary text-sm block mt-0.5 print:text-black">
                {patientInfo.baselineCycleLength} days
              </span>
            </div>

            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block print:text-gray-500">
                Average Computed
              </span>
              <span className="font-bold text-textMain text-sm block mt-0.5 print:text-black">
                {cycleMetrics.effectiveAvgCycle} days
              </span>
            </div>
          </div>

          <div className="text-[11px] text-textMuted bg-pink-50/50 rounded-xl p-2.5 border border-pink-100 print:bg-gray-50 print:border-gray-300 print:text-gray-600">
            <strong>Clinical Note:</strong> This report is compiled from patient daily logs and rule-based tracking algorithms. It is intended to facilitate clinical discussion and history-taking during physician appointments.
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECTION 1: SCREENING FLAGS & ALERTS                  */}
        {/* ---------------------------------------------------- */}
        <Card className="p-4 border border-pink-100 space-y-3 print:border-gray-300 print:shadow-none">
          <div className="flex items-center justify-between border-b border-pink-50 pb-2 print:border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-textMain font-heading flex items-center gap-1.5 print:text-black">
              <span>🩺</span>
              <span>Screening Flags &amp; Clinical Indicators</span>
            </h2>
            <span className="text-[10px] text-textMuted">
              {screeningMetrics.flags.length} indicator(s) noted
            </span>
          </div>

          {screeningMetrics.flags.length === 0 ? (
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-0.5 print:bg-gray-50 print:border-gray-300 print:text-black">
              <p className="font-semibold">✓ No specific clinical screening flags triggered.</p>
              <p className="text-[11px] text-emerald-700 print:text-gray-600">
                Cycle length variations and pain entries in logged history are within conventional baseline limits.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {screeningMetrics.flags.map((flag) => {
                const isRedFlag = flag.id === 'see_doctor_soon';
                return (
                  <div
                    key={flag.id}
                    className={`rounded-xl p-3 border text-xs space-y-1.5 ${
                      isRedFlag
                        ? 'bg-red-50/60 border-red-200 text-red-950 print:bg-gray-100 print:border-gray-400'
                        : 'bg-amber-50/40 border-amber-200 text-amber-950 print:bg-gray-50 print:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-xs">
                        <span>{isRedFlag ? '🚨' : '⚠️'}</span>
                        <span>{flag.details?.title || flag.label}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isRedFlag
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isRedFlag ? 'Important Clinical Flag' : 'Pattern Indicator'}
                      </span>
                    </div>

                    <ul className="space-y-1 text-[11px] pl-4 list-disc text-textMuted print:text-gray-700">
                      {flag.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECTION 2: RECENT CYCLE HISTORY TABLE                */}
        {/* ---------------------------------------------------- */}
        <Card className="p-4 border border-pink-100 space-y-3 print:border-gray-300 print:shadow-none">
          <div className="flex items-center justify-between border-b border-pink-50 pb-2 print:border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-textMain font-heading flex items-center gap-1.5 print:text-black">
              <span>📅</span>
              <span>Recent Recorded Cycles History</span>
            </h2>
            <span className="text-[10px] text-textMuted">
              Total completed cycles: {cycleMetrics.totalCompletedCycles}
            </span>
          </div>

          {cycleMetrics.recentCyclesTable.length === 0 ? (
            <p className="text-xs text-textMuted italic">No completed cycles recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-pink-100 bg-background/80 text-[11px] text-textMuted uppercase print:bg-gray-100 print:border-gray-300">
                    <th className="py-2 px-2.5 font-semibold">Start Date</th>
                    <th className="py-2 px-2.5 font-semibold">Bleeding Days</th>
                    <th className="py-2 px-2.5 font-semibold">Cycle Duration</th>
                    <th className="py-2 px-2.5 font-semibold">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50 print:divide-gray-200">
                  {cycleMetrics.recentCyclesTable.map((row, idx) => {
                    const isLong = row.cycleLength && row.cycleLength > 35;
                    const isShort = row.cycleLength && row.cycleLength < 21;
                    return (
                      <tr key={idx} className="hover:bg-pink-50/20 print:hover:bg-transparent">
                        <td className="py-2 px-2.5 font-medium text-textMain print:text-black">
                          {row.startDate}
                        </td>
                        <td className="py-2 px-2.5 text-textMuted print:text-gray-700">
                          {row.bleedingDuration ? `${row.bleedingDuration} days` : 'Recorded'}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-textMain print:text-black">
                          {row.cycleLength ? `${row.cycleLength} days` : 'Current active'}
                        </td>
                        <td className="py-2 px-2.5">
                          {isLong ? (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 print:text-black">
                              Long (&gt;35d)
                            </span>
                          ) : isShort ? (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 print:text-black">
                              Short (&lt;21d)
                            </span>
                          ) : row.cycleLength ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 print:text-black">
                              Typical (21–35d)
                            </span>
                          ) : (
                            <span className="text-[10px] text-textMuted italic">Active cycle</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Cycle Range & Irregular Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-textMuted bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
            <span>
              Cycle Length Range:{' '}
              <strong className="text-textMain print:text-black">
                {cycleMetrics.cycleVariation.min} – {cycleMetrics.cycleVariation.max} days
              </strong>{' '}
              (Variation: {cycleMetrics.cycleVariation.range} days)
            </span>
            <span>
              Pattern Status:{' '}
              <strong
                className={
                  cycleMetrics.isIrregular
                    ? 'text-amber-800 font-semibold'
                    : 'text-emerald-700 font-semibold'
                }
              >
                {cycleMetrics.isIrregular ? 'Irregular Variation' : 'Consistent Regular'}
              </strong>
            </span>
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECTION 3: PAIN SCORE & DYSMENORRHEA METRICS         */}
        {/* ---------------------------------------------------- */}
        <Card className="p-4 border border-pink-100 space-y-3 print:border-gray-300 print:shadow-none">
          <div className="flex items-center justify-between border-b border-pink-50 pb-2 print:border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-textMain font-heading flex items-center gap-1.5 print:text-black">
              <span>⚡</span>
              <span>Pain Intensity &amp; Dysmenorrhea Profile (0–10 Scale)</span>
            </h2>
            <span className="text-[10px] text-textMuted">
              {painMetrics.totalPainEntriesLogged} pain entries logged
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block">
                Peak Pain Score
              </span>
              <span className="font-bold text-lg text-primary block mt-0.5 print:text-black">
                {painMetrics.maxPainScore !== null ? `${painMetrics.maxPainScore} / 10` : 'None'}
              </span>
              <span className="text-[10px] text-textMuted block">
                {getPainSeverityLabel(painMetrics.maxPainScore)}
              </span>
            </div>

            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block">
                Average Pain Rating
              </span>
              <span className="font-bold text-lg text-textMain block mt-0.5 print:text-black">
                {painMetrics.avgPainScore !== null ? `${painMetrics.avgPainScore} / 10` : 'None'}
              </span>
              <span className="text-[10px] text-textMuted block">During logged pain days</span>
            </div>

            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block">
                Severe Pain Days
              </span>
              <span className="font-bold text-lg text-red-600 block mt-0.5 print:text-black">
                {painMetrics.severePainDaysCount} days
              </span>
              <span className="text-[10px] text-textMuted block">Pain rating &ge; 7 / 10</span>
            </div>

            <div className="bg-background rounded-xl p-2.5 border border-pink-100/70 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-textMuted block">
                Clinical Significance
              </span>
              <span className="font-semibold text-xs text-textMain block mt-1.5 print:text-black">
                {painMetrics.severePainDaysCount >= 2
                  ? 'Recurrent Severe Pain'
                  : painMetrics.maxPainScore >= 7
                  ? 'Isolated Severe Episode'
                  : 'Mild to Moderate'}
              </span>
            </div>
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECTION 4: BLEEDING FLOW & STREAKS                   */}
        {/* ---------------------------------------------------- */}
        <Card className="p-4 border border-pink-100 space-y-3 print:border-gray-300 print:shadow-none">
          <div className="flex items-center justify-between border-b border-pink-50 pb-2 print:border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-textMain font-heading flex items-center gap-1.5 print:text-black">
              <span>🩸</span>
              <span>Menstrual Bleeding Flow Breakdown</span>
            </h2>
            <span className="text-[10px] text-textMuted">
              {flowMetrics.totalBleedingDaysLogged} bleeding days tracked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-red-50/60 border border-red-200 text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-base">🩸🩸🩸</span>
              <span className="text-[11px] font-bold block text-red-950 mt-1 print:text-black">
                Heavy Flow
              </span>
              <span className="text-sm font-extrabold text-red-700 print:text-black">
                {flowMetrics.flowCounts.heavy} days
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-pink-50/60 border border-pink-200 text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-base">🩸🩸</span>
              <span className="text-[11px] font-bold block text-textMain mt-1 print:text-black">
                Medium Flow
              </span>
              <span className="text-sm font-extrabold text-primary print:text-black">
                {flowMetrics.flowCounts.medium} days
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-pink-50/40 border border-pink-100 text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-base">🩸</span>
              <span className="text-[11px] font-bold block text-textMain mt-1 print:text-black">
                Light Flow
              </span>
              <span className="text-sm font-extrabold text-textMain print:text-black">
                {flowMetrics.flowCounts.light} days
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-background border border-pink-100 text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-base">💧</span>
              <span className="text-[11px] font-bold block text-textMuted mt-1 print:text-black">
                Spotting
              </span>
              <span className="text-sm font-extrabold text-textMuted print:text-black">
                {flowMetrics.flowCounts.spotting} days
              </span>
            </div>
          </div>

          <div className="text-[11px] text-textMuted bg-background rounded-xl p-2.5 border border-pink-100/70 flex items-center justify-between print:bg-gray-50 print:border-gray-300">
            <span>Longest consecutive bleeding streak recorded:</span>
            <span className="font-bold text-textMain print:text-black">
              {flowMetrics.maxBleedingStreak} consecutive days
              {flowMetrics.maxBleedingStreak > 7 && ' ⚠️ (> 7 days)'}
            </span>
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECTION 5: SYMPTOM FREQUENCY TALLIES                 */}
        {/* ---------------------------------------------------- */}
        <Card className="p-4 border border-pink-100 space-y-3 print:border-gray-300 print:shadow-none">
          <div className="flex items-center justify-between border-b border-pink-50 pb-2 print:border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-textMain font-heading flex items-center gap-1.5 print:text-black">
              <span>📋</span>
              <span>Logged Symptom Frequency (Past 6 Months)</span>
            </h2>
            <span className="text-[10px] text-textMuted">
              {symptomMetrics.totalLoggedDays} daily log entries
            </span>
          </div>

          {symptomMetrics.symptoms.length === 0 ? (
            <p className="text-xs text-textMuted italic">No specific symptoms recorded in logs.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {symptomMetrics.symptoms.map((s) => (
                <div
                  key={s.id}
                  className="bg-background rounded-xl p-2 border border-pink-100/80 flex items-center justify-between text-xs print:bg-gray-50 print:border-gray-300"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{s.icon}</span>
                    <span className="text-[11px] font-medium text-textMain truncate print:text-black">
                      {s.label}
                    </span>
                  </span>
                  <span className="font-bold text-primary ml-1 shrink-0 print:text-black">
                    {s.count} d
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECTION 6: DISCUSSION POINTS & CLINICAL NOTES        */}
        {/* ---------------------------------------------------- */}
        <Card className="p-4 border border-pink-100 space-y-3 print:border-gray-300 print:shadow-none">
          <h2 className="text-xs font-bold uppercase tracking-wider text-textMain font-heading flex items-center gap-1.5 border-b border-pink-50 pb-2 print:border-gray-200 print:text-black">
            <span>💡</span>
            <span>Suggested Topics &amp; Questions for Your Gynecologist</span>
          </h2>

          <ul className="space-y-1.5 text-xs text-textMain print:text-gray-800">
            {discussionPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5 print:text-black">□</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          {/* Clinician Notes Blank Box for Consultation Writing */}
          <div className="pt-3 border-t border-pink-100 print:border-gray-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted block mb-1 print:text-gray-600">
              Physician Consultation Notes &amp; Recommendations:
            </span>
            <div className="min-h-[100px] border border-dashed border-pink-200 rounded-xl bg-background/50 p-3 text-[11px] text-textMuted print:border-gray-400 print:bg-white">
              <span className="print:hidden italic">
                (Print or save this report to take written notes during your consultation)
              </span>
            </div>
          </div>
        </Card>

        {/* Document Footer */}
        <div className="text-center text-[10px] text-textMuted print:text-gray-500 py-2">
          <p>
            Generated via Antigravity Period Tracker • Confidential Personal Health Record
          </p>
        </div>

        {/* Screen-Only Disclaimer */}
        <div className="print:hidden">
          <DisclaimerBanner variant="footer" className="mt-2" />
        </div>
      </div>

      {/* Screen-Only Mobile Navigation */}
      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
