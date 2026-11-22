import {
  planContentOrderItemSchema,
  planGroupSchema,
  planTaskSchema,
  planWidgetSchema,
} from './planSchema';

import type {
  PlanContentOrderItem,
  PlanDay,
  PlanGroup,
  PlanTask,
  PlanWidget,
  UserPlanData,
} from './planSchema';

import type { TaskInput } from './planStore.types';

export const MAX_TASKS_PER_GROUP = 10;
export const PLAN_DAYS_COUNT = 30;

const STARTER_GROUP_ID = 'starter-morning';
const STARTER_TASK_ID = 'starter-create-plan';

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function createStarterDay(day: number): PlanDay {
  return {
    day,
    groups: [{ id: STARTER_GROUP_ID, title: 'Утро' }],
    tasks: [{
      id: `${STARTER_TASK_ID}-day-${day}`,
      originId: STARTER_TASK_ID,
      title: 'Создать план',
      durationMin: 5,
      xp: 5,
      required: true,
      groupId: STARTER_GROUP_ID,
    }],
    widgets: [],
    contentOrder: [{ type: 'group', id: STARTER_GROUP_ID }],
  };
}

/** Старые виджеты без seriesId остаются совместимыми: их серия равна id. */
export function getWidgetSeriesId(widget: PlanWidget): string {
  return widget.seriesId ?? widget.id;
}

/** Переносит содержимое старых Accordion-виджетов в заметки дня. */
function migrateLegacyWidgetData(data: unknown): unknown {
  if (!isRecord(data)) return data;

  const migrateDay = (day: unknown): unknown => {
    if (!isRecord(day) || !Array.isArray(day.widgets)) return day;

    const widgets = day.widgets.map((widget) => {
      if (!isRecord(widget)) return widget;

      const { accordionItems, ...widgetWithoutAccordion } = widget;

      if (widget.type === 'accordion') {
        const migratedNotes = Array.isArray(accordionItems)
          ? accordionItems
              .map((item) => {
                if (!isRecord(item)) return '';
                const title = typeof item.title === 'string' ? item.title : '';
                const content = typeof item.content === 'string' ? item.content : '';
                return [title, content].filter(Boolean).join('\n');
              })
              .filter(Boolean)
              .join('\n\n')
          : '';

        return {
          ...widgetWithoutAccordion,
          type: 'day-notes',
          notes: typeof widget.notes === 'string' ? widget.notes : migratedNotes,
        };
      }

      return {
        ...widgetWithoutAccordion,
        notes: typeof widget.notes === 'string' ? widget.notes : '',
      };
    });

    return { ...day, widgets };
  };

  const template = isRecord(data.template) ? data.template : null;
  const dayOverrides = isRecord(data.dayOverrides) ? data.dayOverrides : null;

  return {
    ...data,
    ...(template
      ? {
          template: {
            ...template,
            days: Array.isArray(template.days) ? template.days.map(migrateDay) : template.days,
          },
        }
      : {}),
    ...(dayOverrides
      ? {
          dayOverrides: Object.fromEntries(
            Object.entries(dayOverrides).map(([key, day]) => [key, migrateDay(day)]),
          ),
        }
      : {}),
  };
}

/** Добавляет элемент в конец общего порядка, не создавая дубликатов. */
export function appendContentOrder(
  day: PlanDay,
  item: PlanContentOrderItem,
): PlanContentOrderItem[] {
  const contentOrder = day.contentOrder ?? [];
  const exists = contentOrder.some(
    (current) => current.type === item.type && current.id === item.id,
  );
  return exists ? contentOrder : [...contentOrder, item];
}

/** Восстанавливает порядок и добавляет элементы, которых в нём ещё нет. */
export function normalizePlanDay(day: PlanDay): PlanDay {
  const widgets = day.widgets ?? [];
  const validGroups = new Set(day.groups.map((group) => group.id));
  const standaloneTasks = day.tasks.filter((task) => task.groupId === null);
  const validTasks = new Set(standaloneTasks.map((task) => task.id));
  const validWidgets = new Set(widgets.map((widget) => widget.id));

  const contentOrder: PlanContentOrderItem[] = [];
  const seen = new Set<string>();

  for (const item of day.contentOrder ?? []) {
    if (item.type === 'group' && !validGroups.has(item.id)) continue;
    if (item.type === 'task' && !validTasks.has(item.id)) continue;
    if (item.type === 'widget' && !validWidgets.has(item.id)) continue;

    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) continue;

    seen.add(key);
    contentOrder.push(item);
  }

  for (const group of day.groups) {
    const key = `group:${group.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      contentOrder.push({ type: 'group', id: group.id });
    }
  }

  for (const task of standaloneTasks) {
    const key = `task:${task.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      contentOrder.push({ type: 'task', id: task.id });
    }
  }

  for (const widget of widgets) {
    const key = `widget:${widget.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      contentOrder.push({ type: 'widget', id: widget.id });
    }
  }

  return { ...day, widgets, contentOrder };
}

/** Безопасно разбирает один день; повреждённые записи пропускаются по отдельности. */
function parsePlanDay(data: unknown, fallbackDay: number): PlanDay | null {
  if (!isRecord(data)) return null;

  const dayNumber =
    typeof data.day === 'number' && Number.isInteger(data.day) && data.day > 0
      ? data.day
      : fallbackDay;

  const groups = Array.isArray(data.groups)
    ? data.groups.flatMap((item) => {
        const parsed = planGroupSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

  const tasks = Array.isArray(data.tasks)
    ? data.tasks.flatMap((item) => {
        const parsed = planTaskSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

  const widgets = Array.isArray(data.widgets)
    ? data.widgets.flatMap((item) => {
        const parsed = planWidgetSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

  const contentOrder = Array.isArray(data.contentOrder)
    ? data.contentOrder.flatMap((item) => {
        const parsed = planContentOrderItemSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

  return normalizePlanDay({ day: dayNumber, groups, tasks, widgets, contentOrder });
}

/**
 * Нормализует данные при миграции и импорте.
 * ensureDays=true добавляет недостающие дни до 30 только при миграции LocalStorage.
 */
export function normalizePlanData(data: unknown, ensureDays = false): UserPlanData {
  const migratedData = migrateLegacyWidgetData(data);
  const basePlan = createInitialPlan();

  if (!isRecord(migratedData)) return basePlan;

  const rawTemplate = isRecord(migratedData.template) ? migratedData.template : {};
  const rawDays = Array.isArray(rawTemplate.days) ? rawTemplate.days : [];
  const daysByNumber = new Map<number, PlanDay>();

  rawDays.forEach((rawDay, index) => {
    const day = parsePlanDay(rawDay, index + 1);
    if (day) daysByNumber.set(day.day, day);
  });

  if (ensureDays) {
    for (let dayNumber = 1; dayNumber <= PLAN_DAYS_COUNT; dayNumber += 1) {
      if (!daysByNumber.has(dayNumber)) {
        daysByNumber.set(dayNumber, createStarterDay(dayNumber));
      }
    }
  }

  const days =
    daysByNumber.size > 0
      ? [...daysByNumber.values()].sort((a, b) => a.day - b.day)
      : basePlan.template.days;

  const rawOverrides = isRecord(migratedData.dayOverrides) ? migratedData.dayOverrides : {};
  const dayOverrides: Record<string, PlanDay> = {};

  for (const [key, rawDay] of Object.entries(rawOverrides)) {
    const dayNumber = Number(key);
    if (!Number.isInteger(dayNumber) || dayNumber <= 0 || !isRecord(rawDay)) continue;

    const day = parsePlanDay({ ...rawDay, day: dayNumber }, dayNumber);
    if (day) dayOverrides[key] = day;
  }

  return {
    schemaVersion:
      typeof migratedData.schemaVersion === 'number' ? migratedData.schemaVersion : 1,
    template: {
      id: typeof rawTemplate.id === 'string' ? rawTemplate.id : basePlan.template.id,
      title:
        typeof rawTemplate.title === 'string' && rawTemplate.title.trim()
          ? rawTemplate.title.trim()
          : basePlan.template.title,
      description:
        typeof rawTemplate.description === 'string'
          ? rawTemplate.description
          : basePlan.template.description,
      days,
    },
    dayOverrides,
  };
}

export function createInitialPlan(): UserPlanData {
  return {
    schemaVersion: 1,
    template: {
      id: 'user-plan',
      title: 'Мой план',
      description: 'Мои задачи и цели',
      days: Array.from({ length: PLAN_DAYS_COUNT }, (_, index) => createStarterDay(index + 1)),
    },
    dayOverrides: {},
  };
}

export function getDay(state: UserPlanData, dayNumber: number): PlanDay | undefined {
  return (
    state.dayOverrides[String(dayNumber)] ??
    state.template.days.find((item) => item.day === dayNumber)
  );
}

export function updateOneDay(
  state: UserPlanData,
  dayNumber: number,
  updater: (day: PlanDay) => PlanDay,
): Partial<UserPlanData> {
  const currentDay = getDay(state, dayNumber);
  if (!currentDay) return {};

  return {
    dayOverrides: {
      ...state.dayOverrides,
      [String(dayNumber)]: normalizePlanDay(updater(normalizePlanDay(currentDay))),
    },
  };
}

export function updateAllDays(
  state: UserPlanData,
  updater: (day: PlanDay) => PlanDay,
): Partial<UserPlanData> {
  return {
    template: {
      ...state.template,
      days: state.template.days.map((day) => normalizePlanDay(updater(normalizePlanDay(day)))),
    },
    dayOverrides: Object.fromEntries(
      Object.entries(state.dayOverrides).map(([key, day]) => [
        key,
        normalizePlanDay(updater(normalizePlanDay(day))),
      ]),
    ),
  };
}

export function countGroupTasks(day: PlanDay, groupId: string): number {
  return day.tasks.filter((task) => task.groupId === groupId).length;
}

export function createTask(
  originId: string,
  dayNumber: number,
  groupId: string | null,
  input: TaskInput,
): PlanTask {
  return {
    id: `${originId}-day-${dayNumber}`,
    originId,
    title: input.title.trim(),
    durationMin: input.durationMin ?? 5,
    xp: input.xp ?? 5,
    required: input.required ?? true,
    groupId,
    ...(input.scheduledTime ? { scheduledTime: input.scheduledTime } : {}),
  };
}

export type { PlanGroup };
