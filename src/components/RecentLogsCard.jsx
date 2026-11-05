import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { parseLocalDate, formatLocalDate, getDaysDifference } from '../utils/dateHelpers';
import { getFlowDetails, getMoodDetails, getSymptomDetails } from '../data/symptoms';
import Card from './Card';
import Button from './Button';

/**
 * RecentLogsCard component
 *
 * Displays recent daily logs on the Dashboard (Task 4.4).
 * Shows flow, mood, water intake, symptoms, and optional notes snippet,
 * or an inviting empty state if no entries have been logged yet.
 */
export default function RecentLogsCard({
  logs = [],
  loading = false,
  className = '',
}) {
  const todayStr = formatLocalDate(new Date());

  function getRelativeDateLabel(dateStr) {
    if (dateStr === todayStr) return 'Today';
    const diff = getDaysDifference(dateStr, todayStr);
    if (diff === -1) return 'Yesterday';
    try {
      return format(parseLocalDate(dateStr), 'EEE, MMM d');
    } catch {
      return dateStr;
    }
  }

  return (
    <Card className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-pink-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-base shadow-xs">
            📝
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-textMain">
              Recent Daily Logs
            </h3>
            <p className="text-xs text-textMuted">
              Tracked flow, moods, and symptoms
            </p>
          </div>
        </div>

        <Link
          to="/log"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Log today</span>
          <span>→</span>
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-6 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-textMuted">Loading recent logs...</p>
        </div>
      ) : logs.length === 0 ? (
        /* Empty State (PRD & Task 4.4 requirement) */
        <div className="py-6 px-4 text-center space-y-3 bg-pink-50/30 rounded-xl border border-pink-100/70">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-xs border border-pink-100">
            🌸
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold font-heading text-textMain">
              No logs yet
            </p>
            <p className="text-xs text-textMuted max-w-xs mx-auto leading-relaxed">
              Log today's flow, mood, water intake, and symptoms to discover patterns across your cycle.
            </p>
          </div>
          <div className="pt-1">
            <Link to="/log" className="inline-block">
              <Button variant="primary" className="text-xs !py-2 !px-4 shadow-xs">
                <span>📝</span>
                <span>Log Today's Signs →</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Logs List */
        <div className="space-y-3">
          {logs.map((log) => {
            const flowInfo = getFlowDetails(log.flow);
            const moodInfo = getMoodDetails(log.mood);
            const isToday = log.date === todayStr;

            return (
              <div
                key={log.date}
                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                  isToday
                    ? 'bg-primary-soft/30 border-primary/30 shadow-xs'
                    : 'bg-background/60 border-pink-100/80 hover:bg-background'
                }`}
              >
                {/* Row 1: Date & Flow */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-heading text-textMain">
                      {getRelativeDateLabel(log.date)}
                    </span>
                    <span className="text-[11px] text-textMuted">({log.date})</span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      log.flow && log.flow !== 'none'
                        ? 'bg-rose-50 text-primary border-rose-200'
                        : 'bg-gray-50 text-textMuted border-gray-200'
                    }`}
                  >
                    <span>{flowInfo.icon}</span>
                    <span>{flowInfo.label}</span>
                  </span>
                </div>

                {/* Row 2: Mood & Water */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {moodInfo ? (
                    <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-pink-100/80 shadow-xs text-textMain font-medium">
                      <span>{moodInfo.emoji}</span>
                      <span>{moodInfo.label}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-textMuted italic">
                      No mood recorded
                    </span>
                  )}

                  {typeof log.waterGlasses === 'number' && (
                    <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 px-2.5 py-1 rounded-lg border border-sky-100 font-medium text-[11px]">
                      <span>💧</span>
                      <span>{log.waterGlasses} glasses</span>
                    </span>
                  )}
                </div>

                {/* Row 3: Symptoms Tags */}
                {Array.isArray(log.symptoms) && log.symptoms.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {log.symptoms.map((sId) => {
                      const sInfo = getSymptomDetails(sId);
                      return (
                        <span
                          key={sId}
                          className="text-[10px] font-medium bg-white text-textMuted px-2 py-0.5 rounded-md border border-pink-100/80 flex items-center gap-1"
                        >
                          <span>{sInfo?.icon || '•'}</span>
                          <span>{sInfo?.label || sId}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Row 4: Notes Snippet */}
                {log.notes && (
                  <p className="text-[11px] text-textMuted italic bg-white/70 p-2 rounded-lg border border-pink-50 leading-relaxed">
                    "{log.notes}"
                  </p>
                )}
              </div>
            );
          })}

          {/* Footer Navigation */}
          <div className="text-center pt-1">
            <Link
              to="/log"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Go to Daily Log for full tracking →</span>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

