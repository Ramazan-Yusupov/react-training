import { describe, expect, it } from 'vitest';
import { gamification, getWorkoutDay, workoutPlan } from './plans';

describe('данные плана', () => {
  it('в исходном плане 30 дней с уникальными номерами', () => {
    expect(workoutPlan.days).toHaveLength(30);
    expect(new Set(workoutPlan.days.map((day) => day.day)).size).toBe(30);
  });

  it('id задач уникальны в рамках плана', () => {
    const ids = workoutPlan.days.flatMap((day) => day.tasks.map((task) => task.id));

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('день 29 содержит два теста на максимум', () => {
    const types = getWorkoutDay(29)?.tasks.map((task) => task.type) ?? [];

    expect(types.filter((type) => type === 'max-test')).toHaveLength(2);
  });

  it('пороговые значения уровней расположены по возрастанию', () => {
    const thresholds = gamification.levels
      .map((level) => level.xp)
      .filter((xp): xp is number => xp !== null);

    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
  });
});
