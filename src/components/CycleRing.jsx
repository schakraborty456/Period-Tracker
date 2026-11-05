import React from 'react';

/**
 * CycleRing component
 * Displays a multi-phase circular SVG progress ring visualizing the 4 phases
 * and indicating the user's current cycle day position.
 */
export default function CycleRing({
  cycleDay = 1,
  cycleLength = 28,
  periodLength = 5,
  currentPhase = 'menstrual',
  isLate = false,
  daysLate = 0,
  daysUntilNextPeriod = 28,
  size = 200,
  className = '',
}) {
  const radius = 74;
  const strokeWidth = 12;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  const totalDays = Number(cycleLength) || 28;
  const periodDays = Math.min(Number(periodLength) || 5, totalDays);

  // Ovulation day calculation (14 days before cycle ends)
  const ovulationDay = Math.max(periodDays + 2, totalDays + 1 - 14);
  const ovStart = Math.max(periodDays + 1, ovulationDay - 1);
  const ovEnd = Math.min(totalDays, ovulationDay + 1);

  // Phase duration allocations in days
  const menstrualDays = periodDays;
  const follicularDays = Math.max(0, ovStart - periodDays - 1);
  const ovulationDays = Math.max(1, ovEnd - ovStart + 1);
  const lutealDays = Math.max(0, totalDays - ovEnd);

  const phases = [
    { name: 'Menstrual', days: menstrualDays, color: '#E85D75' },
    { name: 'Follicular', days: follicularDays, color: '#6CC299' },
    { name: 'Ovulation', days: ovulationDays, color: '#F7C948' },
    { name: 'Luteal', days: lutealDays, color: '#9B8AE0' },
  ];

  // Calculate current indicator angle (0 at top / 12 o'clock)
  const clampedDay = Math.max(1, Math.min(cycleDay, totalDays));
  const progressRatio = (clampedDay - 0.5) / totalDays;
  const currentAngleRad = progressRatio * 2 * Math.PI - Math.PI / 2;
  const indicatorX = center + radius * Math.cos(currentAngleRad);
  const indicatorY = center + radius * Math.sin(currentAngleRad);

  // Accumulated dashoffsets for the 4 segments
  let accumulatedDays = 0;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full transform -rotate-90"
        role="img"
        aria-label={`Cycle progress: Day ${cycleDay} of ${totalDays}, ${currentPhase} phase`}
      >
        {/* Soft background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#FDE7F0"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />

        {/* 4 Phase Arcs */}
        {phases.map((p, idx) => {
          if (p.days <= 0) return null;
          const arcFraction = p.days / totalDays;
          const arcLength = arcFraction * circumference;
          const offset = (accumulatedDays / totalDays) * circumference;
          accumulatedDays += p.days;

          // Gap between segments for sleek modern look
          const gap = 2.5;
          const visibleArc = Math.max(0, arcLength - gap);

          return (
            <circle
              key={p.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={p.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${visibleArc} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Current Day Pointer Glow */}
        <circle
          cx={indicatorX}
          cy={indicatorY}
          r={9}
          fill={isLate ? '#D64545' : '#E11D74'}
          className="animate-pulse opacity-40"
        />

        {/* Current Day Pointer Dot */}
        <circle
          cx={indicatorX}
          cy={indicatorY}
          r={6}
          fill="#FFFFFF"
          stroke={isLate ? '#D64545' : '#E11D74'}
          strokeWidth={3}
          className="drop-shadow-sm"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-textMuted">
          Cycle
        </span>
        <span className="text-2xl font-bold font-heading text-textMain leading-tight">
          Day {cycleDay}
        </span>
        <span className="text-[11px] text-textMuted">
          of {totalDays} days
        </span>

        <div className="mt-1 pt-1 border-t border-pink-100/80">
          <span className="text-[11px] font-medium text-primary block">
            {isLate
              ? `${daysLate}d late`
              : daysUntilNextPeriod === 0
              ? 'Starts today'
              : `in ${daysUntilNextPeriod} days`}
          </span>
        </div>
      </div>
    </div>
  );
}
