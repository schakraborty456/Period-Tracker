import { describe, it, expect } from 'vitest';
import {
  WORKOUT_ROUTINES,
  WORKOUT_REVIEW_STATUS,
  WORKOUT_SAFETY_NOTICE,
  getAllWorkouts,
  getWorkoutById,
  getWorkoutsByPhase,
  getWorkoutsBySymptom,
} from './workouts.js';

describe('Home Workouts Data & Routines (Task 6.2d)', () => {
  it('defines routines covering key phases and symptoms (cramps, pcos, etc.)', () => {
    const routines = getAllWorkouts();
    expect(routines.length).toBeGreaterThanOrEqual(6);

    const ids = routines.map((r) => r.id);
    expect(ids).toContain('cramps-relief');
    expect(ids).toContain('pcos-rhythm');
    expect(ids).toContain('follicular-mobility');
    expect(ids).toContain('ovulation-sculpt');
    expect(ids).toContain('luteal-grounding');
  });

  it('restricts workout durations strictly to between 10 and 20 minutes', () => {
    WORKOUT_ROUTINES.forEach((r) => {
      expect(r.durationMinutes).toBeGreaterThanOrEqual(10);
      expect(r.durationMinutes).toBeLessThanOrEqual(20);
    });
  });

  it('restricts difficulty levels strictly to "Easy" or "Medium"', () => {
    WORKOUT_ROUTINES.forEach((r) => {
      expect(['Easy', 'Medium']).toContain(r.level);
    });
  });

  it('marks all routines with "Needs expert review" status', () => {
    expect(WORKOUT_REVIEW_STATUS).toBe('Needs expert review');
    WORKOUT_ROUTINES.forEach((r) => {
      expect(r.reviewStatus).toBe('Needs expert review');
    });
  });

  it('includes clear safety and comfort notice', () => {
    expect(WORKOUT_SAFETY_NOTICE).toBeTruthy();
    expect(WORKOUT_SAFETY_NOTICE.toLowerCase()).toContain('listen to your body');
  });

  it('provides structured poses with instructions and benefits for every routine', () => {
    WORKOUT_ROUTINES.forEach((r) => {
      expect(Array.isArray(r.poses)).toBe(true);
      expect(r.poses.length).toBeGreaterThanOrEqual(3);

      r.poses.forEach((pose) => {
        expect(pose.name).toBeTruthy();
        expect(pose.duration).toBeTruthy();
        expect(pose.instructions).toBeTruthy();
        expect(pose.benefit).toBeTruthy();
        expect(pose.icon).toBeTruthy();
      });
    });
  });

  it('contains no medical cures, prescriptions, or drug advice', () => {
    const forbidden = ['cure', 'prescription', 'medication', 'dosage', 'antibiotic'];

    WORKOUT_ROUTINES.forEach((r) => {
      const fullText = JSON.stringify(r).toLowerCase();
      forbidden.forEach((word) => {
        expect(fullText).not.toContain(word);
      });
    });
  });

  it('retrieves workout by ID via getWorkoutById', () => {
    const cramps = getWorkoutById('cramps-relief');
    expect(cramps).toBeDefined();
    expect(cramps.id).toBe('cramps-relief');
    expect(cramps.phase).toBe('menstrual');

    const nonExistent = getWorkoutById('non-existent');
    expect(nonExistent).toBeNull();
  });

  it('filters workouts by phase using getWorkoutsByPhase', () => {
    const menstrual = getWorkoutsByPhase('menstrual');
    expect(menstrual.length).toBeGreaterThan(0);
    // Should include menstrual routines as well as 'all' phase routines
    menstrual.forEach((w) => {
      expect(['menstrual', 'all']).toContain(w.phase);
    });

    const all = getWorkoutsByPhase('all');
    expect(all.length).toBe(WORKOUT_ROUTINES.length);
  });

  it('filters workouts by symptom tag using getWorkoutsBySymptom', () => {
    const pcos = getWorkoutsBySymptom('pcos');
    expect(pcos.length).toBeGreaterThanOrEqual(1);
    expect(pcos[0].id).toBe('pcos-rhythm');

    const cramps = getWorkoutsBySymptom('cramps');
    expect(cramps.length).toBeGreaterThanOrEqual(1);
    expect(cramps[0].id).toBe('cramps-relief');
  });
});
