import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMinutesToTime,
  diffDays,
  formatDayMonth,
  getIsoWeekday,
  weekdayShort,
} from './date';

describe('date', () => {
  it('addDays переходит через конец месяца и года', () => {
    expect(addDays('2026-11-23', 8)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-11-23', -23)).toBe('2026-10-31');
  });

  it('diffDays считает дни со знаком', () => {
    expect(diffDays('2026-11-23', '2026-12-22')).toBe(29);
    expect(diffDays('2026-11-23', '2026-11-20')).toBe(-3);
  });

  it('getIsoWeekday: понедельник = 1, воскресенье = 7', () => {
    expect(getIsoWeekday('2026-11-23')).toBe(1);
    expect(getIsoWeekday('2026-11-29')).toBe(7);
    expect(weekdayShort(1)).toBe('Пн');
  });

  it('formatDayMonth', () => {
    expect(formatDayMonth('2026-11-03')).toBe('03.11');
  });

  it('addMinutesToTime переходит через полночь', () => {
    expect(addMinutesToTime('08:00', 60)).toBe('09:00');
    expect(addMinutesToTime('23:30', 45)).toBe('00:15');
  });
});
