/** Все даты в проекте хранятся строкой "ГГГГ-ММ-ДД" (локальная дата, без часовых поясов). */

const pad = (value: number) => String(value).padStart(2, '0');

export function parseISODate(iso: string): Date {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Сколько дней от `fromIso` до `toIso` (может быть отрицательным). */
export function diffDays(fromIso: string, toIso: string): number {
  return Math.round((parseISODate(toIso).getTime() - parseISODate(fromIso).getTime()) / 86_400_000);
}

/** 1 = понедельник ... 7 = воскресенье */
export function getIsoWeekday(iso: string): number {
  const day = parseISODate(iso).getDay();
  return day === 0 ? 7 : day;
}

export function formatDayMonth(iso: string): string {
  const [, month = '', day = ''] = iso.split('-');
  return `${day}.${month}`;
}

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export function weekdayShort(isoWeekday: number): string {
  return WEEKDAYS_SHORT[(isoWeekday - 1 + 7) % 7] ?? '';
}

/** "08:00" + 60 минут = "09:00" (переход через полночь учитывается). */
export function addMinutesToTime(time: string, minutes: number): string {
  const [hours = 0, mins = 0] = time.split(':').map(Number);
  const total = (((hours * 60 + mins + minutes) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}
