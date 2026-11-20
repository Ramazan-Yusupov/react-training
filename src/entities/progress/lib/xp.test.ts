import { describe, expect, it } from 'vitest';
import {
  type DayLike,
  type LevelLike,
  type XpConfig,
  dayXp,
  getLevelState,
  getStreak,
  isDayComplete,
  requiredProgress,
  taskXp,
  totalXp,
} from './xp';

const config: XpConfig = { microBreakCap: 8, dayBonus: 10 };

const day = (number: number): DayLike => ({
  day: number,
  tasks: [
    { id: `d${number}-a`, type: 'pushup-set', xp: 10, required: true },
    { id: `d${number}-b`, type: 'pushup-set', xp: 10, required: true },
    { id: `d${number}-micro`, type: 'micro-break', xp: 0, required: false, xpPerUnit: 2 },
  ],
});

const snapshot = (completed: string[], microBreaks: Record<number, number> = {}) => ({
  completed: Object.fromEntries(completed.map((id) => [id, '2026-11-23T08:00:00Z'])),
  microBreaks,
});

describe('очки', () => {
  it('taskXp: обычная задача и микро-паузы с лимитом', () => {
    const [a, , micro] = day(1).tasks;
    expect(taskXp(a!, 1, snapshot(['d1-a']), config)).toBe(10);
    expect(taskXp(a!, 1, snapshot([]), config)).toBe(0);
    expect(taskXp(micro!, 1, snapshot([], { 1: 5 }), config)).toBe(10);
    expect(taskXp(micro!, 1, snapshot([], { 1: 20 }), config)).toBe(16);
  });

  it('бонус дня начисляется только когда выполнены все обязательные задачи', () => {
    expect(isDayComplete(day(1), snapshot(['d1-a']))).toBe(false);
    expect(dayXp(day(1), snapshot(['d1-a']), config)).toBe(10);
    expect(isDayComplete(day(1), snapshot(['d1-a', 'd1-b']))).toBe(true);
    expect(dayXp(day(1), snapshot(['d1-a', 'd1-b']), config)).toBe(30);
    expect(dayXp(day(1), snapshot(['d1-a', 'd1-b']), config, false)).toBe(20);
    expect(requiredProgress(day(1), snapshot(['d1-a']))).toEqual({ done: 1, total: 2 });
  });

  it('день без обязательных задач не считается выполненным', () => {
    expect(isDayComplete({ day: 1, tasks: [] }, snapshot([]))).toBe(false);
  });

  it('totalXp суммирует по дням', () => {
    const all = snapshot(['d1-a', 'd1-b', 'd2-a'], { 2: 3 });
    expect(totalXp([day(1), day(2)], all, config)).toBe(30 + 10 + 6);
  });
});

describe('уровни', () => {
  const levels: LevelLike[] = [
    { id: 'bronze', title: 'Бронза', xp: 500 },
    { id: 'silver', title: 'Серебро', xp: 1200 },
    { id: 'boss', title: 'Босс', xp: null },
  ];

  it('до первого уровня', () => {
    const state = getLevelState(250, levels);
    expect(state.current).toBeNull();
    expect(state.next?.id).toBe('bronze');
    expect(state.progress).toBe(0.5);
    expect(state.xpToNext).toBe(250);
  });

  it('между уровнями и на максимуме', () => {
    expect(getLevelState(500, levels).current?.id).toBe('bronze');
    expect(getLevelState(850, levels).progress).toBeCloseTo(0.5);
    const top = getLevelState(5000, levels);
    expect(top.current?.id).toBe('silver');
    expect(top.next).toBeNull();
    expect(top.progress).toBe(1);
  });
});

describe('серия дней', () => {
  const days = [day(1), day(2), day(3), day(4)];
  const done = (...numbers: number[]) => snapshot(numbers.flatMap((n) => [`d${n}-a`, `d${n}-b`]));

  it('считает подряд идущие выполненные дни', () => {
    expect(getStreak(days, done(1, 2, 3), 3)).toBe(3);
  });

  it('сегодняшний невыполненный день не обнуляет серию', () => {
    expect(getStreak(days, done(1, 2), 3)).toBe(2);
  });

  it('пропуск прерывает серию', () => {
    expect(getStreak(days, done(1, 3), 3)).toBe(1);
    expect(getStreak(days, done(), 1)).toBe(0);
  });
});
