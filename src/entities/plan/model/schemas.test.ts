import { describe, expect, it } from 'vitest';
import {
  exercises,
  gamification,
  getPostureDay,
  getWorkoutDay,
  posturePlan,
  workoutPlan,
} from './plans';

describe('данные планов', () => {
  it('в обоих планах по 30 дней, номера уникальны', () => {
    expect(workoutPlan.days).toHaveLength(30);
    expect(posturePlan.days).toHaveLength(30);
    expect(new Set(workoutPlan.days.map((day) => day.day)).size).toBe(30);
  });

  it('id задач уникальны в рамках плана', () => {
    const ids = workoutPlan.days.flatMap((day) => day.tasks.map((task) => task.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('первые 7 дней утренний блок корсета по 60 минут, дни отдыха 14, 21, 28', () => {
    for (let day = 1; day <= 7; day += 1) {
      expect(getPostureDay(day)?.totalMinutesMorningOnly).toBe(60);
    }
    for (const day of posturePlan.rules.restDays) {
      expect(getPostureDay(day)?.corsetOff).toBe(true);
    }
  });

  it('ссылки exerciseRef указывают на существующие упражнения', () => {
    const known = new Set([
      ...exercises.warmups.map((item) => item.id),
      ...exercises.bodyBlocks.map((item) => item.id),
      'postureTrainingStructure',
    ]);
    const refs = [...workoutPlan.days, ...posturePlan.days]
      .flatMap((day) => day.tasks)
      .map((task) => task.exerciseRef)
      .filter((ref): ref is string => Boolean(ref));
    for (const ref of refs) expect(known.has(ref)).toBe(true);
  });

  it('день 29 содержит тесты на максимум, очки уровней по возрастанию', () => {
    const types = getWorkoutDay(29)?.tasks.map((task) => task.type) ?? [];
    expect(types.filter((type) => type === 'max-test')).toHaveLength(2);
    const thresholds = gamification.levels.map((level) => level.xp).filter((xp) => xp !== null);
    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
  });
});
