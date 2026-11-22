import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { userPlanSchema } from './planSchema';
import type {
  PlanContentOrderItem,
  PlanDay,
  PlanGroup,
  PlanTask,
  PlanWidget,
  PlanWidgetType,
  UserPlanData,
} from './planSchema';

export type EditScope = 'all' | 'day';

const MAX_TASKS_PER_GROUP = 10;
const STORAGE_KEY = 'planer-user-plan-v2';
const STORAGE_VERSION = 4;

type TaskInput = {
  title: string;
  durationMin?: number;
  xp?: number;
  required?: boolean;
  scheduledTime?: string;
};

type TaskUpdate = Partial<
  Pick<PlanTask, 'title' | 'durationMin' | 'xp' | 'required' | 'scheduledTime'>
>;

type WidgetUpdate = Partial<Pick<PlanWidget, 'enabled'>>;

interface PlanActions {
  addDay: () => void;
  removeLastDay: () => void;

  updatePlanInfo: (title: string, description: string) => void;

  addGroup: (day: number, title: string, scope: EditScope) => string;
  updateGroup: (day: number, groupId: string, title: string, scope: EditScope) => void;
  deleteGroup: (day: number, groupId: string, scope: EditScope) => void;

  addTask: (
    day: number,
    groupId: string | null,
    input: TaskInput,
    scope: EditScope,
  ) => string | null;

  addTaskToAllDaysWithGroup: (day: number, groupId: string, input: TaskInput) => string | null;

  updateTask: (day: number, taskId: string, updates: TaskUpdate, scope: EditScope) => void;

  deleteTask: (day: number, taskId: string, scope: EditScope) => void;

  moveTask: (
    day: number,
    taskId: string,
    targetGroupId: string | null,
    targetIndex: number,
  ) => void;

  moveContent: (day: number, active: PlanContentOrderItem, over: PlanContentOrderItem) => void;

  addWidget: (day: number, type: PlanWidgetType, scope: EditScope) => string | null;

  updateWidget: (day: number, widgetId: string, updates: WidgetUpdate, scope: EditScope) => void;

  updateWidgetNotes: (day: number, widgetId: string, notes: string) => void;

  deleteWidget: (day: number, widgetId: string, scope: EditScope) => void;

  replaceAll: (data: UserPlanData) => void;
  reset: () => void;
}

export type PlanState = UserPlanData & PlanActions;

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const STARTER_GROUP_ID = 'starter-morning';
const STARTER_TASK_ID = 'starter-create-plan';

function createStarterDay(day: number): PlanDay {
  return {
    day,
    groups: [
      {
        id: STARTER_GROUP_ID,
        title: 'Утро',
      },
    ],
    tasks: [
      {
        id: `${STARTER_TASK_ID}-day-${day}`,
        originId: STARTER_TASK_ID,
        title: 'Создать план',
        durationMin: 5,
        xp: 5,
        required: true,
        groupId: STARTER_GROUP_ID,
      },
    ],
    widgets: [],
    contentOrder: [{ type: 'group', id: STARTER_GROUP_ID }],
  };
}

/**
 * Преобразует старые Accordion-виджеты в заметки,
 * сохраняя заголовки и содержимое их секций.
 */
function migrateLegacyWidgetData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const record = data as Record<string, unknown>;

  const migrateDay = (day: unknown): unknown => {
    if (!day || typeof day !== 'object') {
      return day;
    }

    const dayRecord = day as Record<string, unknown>;

    if (!Array.isArray(dayRecord.widgets)) {
      return day;
    }

    const widgets = dayRecord.widgets.map((widget) => {
      if (!widget || typeof widget !== 'object') {
        return widget;
      }

      const widgetRecord = widget as Record<string, unknown>;

      const { accordionItems, ...widgetWithoutAccordion } = widgetRecord;

      if (widgetRecord.type === 'accordion') {
        const migratedNotes = Array.isArray(accordionItems)
          ? accordionItems
              .map((item) => {
                if (!item || typeof item !== 'object') {
                  return '';
                }

                const section = item as Record<string, unknown>;
                const title = typeof section.title === 'string' ? section.title : '';
                const content = typeof section.content === 'string' ? section.content : '';

                return [title, content].filter(Boolean).join('\n');
              })
              .filter(Boolean)
              .join('\n\n')
          : '';

        return {
          ...widgetWithoutAccordion,
          type: 'day-notes',
          notes: typeof widgetRecord.notes === 'string' ? widgetRecord.notes : migratedNotes,
        };
      }

      return {
        ...widgetWithoutAccordion,
        notes: typeof widgetRecord.notes === 'string' ? widgetRecord.notes : '',
      };
    });

    return {
      ...dayRecord,
      widgets,
    };
  };

  const template =
    record.template && typeof record.template === 'object'
      ? (record.template as Record<string, unknown>)
      : null;

  const dayOverrides =
    record.dayOverrides && typeof record.dayOverrides === 'object'
      ? (record.dayOverrides as Record<string, unknown>)
      : null;

  return {
    ...record,
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
function appendContentOrder(day: PlanDay, item: PlanContentOrderItem): PlanContentOrderItem[] {
  const contentOrder = day.contentOrder ?? [];

  const exists = contentOrder.some(
    (current) => current.type === item.type && current.id === item.id,
  );

  return exists ? contentOrder : [...contentOrder, item];
}

/** Восстанавливает порядок и добавляет элементы, которых в нём ещё нет. */
function normalizePlanDay(day: PlanDay): PlanDay {
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

  return {
    ...day,
    widgets,
    contentOrder,
  };
}

/** Нормализует данные при миграции и импорте, сохраняя существующий план. */
function normalizePlanData(data: unknown): UserPlanData {
  const migratedData = migrateLegacyWidgetData(data);
  const parsed = userPlanSchema.safeParse(migratedData);

  if (!parsed.success) {
    return createInitialPlan();
  }

  return {
    ...parsed.data,
    template: {
      ...parsed.data.template,
      days: parsed.data.template.days.map(normalizePlanDay),
    },
    dayOverrides: Object.fromEntries(
      Object.entries(parsed.data.dayOverrides).map(([key, day]) => [key, normalizePlanDay(day)]),
    ),
  };
}

export function createInitialPlan(): UserPlanData {
  return {
    schemaVersion: 1,
    template: {
      id: 'user-plan',
      title: 'Мой план',
      description: 'Мои задачи и цели',
      days: Array.from({ length: 7 }, (_, index) => createStarterDay(index + 1)),
    },
    dayOverrides: {},
  };
}

function getDay(state: UserPlanData, dayNumber: number): PlanDay | undefined {
  return (
    state.dayOverrides[String(dayNumber)] ??
    state.template.days.find((item) => item.day === dayNumber)
  );
}

function updateOneDay(
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

function updateAllDays(
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

function countGroupTasks(day: PlanDay, groupId: string): number {
  return day.tasks.filter((task) => task.groupId === groupId).length;
}

function createTask(
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

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      ...createInitialPlan(),

      addDay: () => {
        set((state) => {
          const lastDay = Math.max(...state.template.days.map((day) => day.day));

          return {
            template: {
              ...state.template,
              days: [
                ...state.template.days,
                {
                  day: lastDay + 1,
                  groups: [],
                  tasks: [],
                  widgets: [],
                  contentOrder: [],
                },
              ],
            },
          };
        });
      },

      removeLastDay: () => {
        set((state) => {
          if (state.template.days.length <= 1) return {};

          const lastDay = Math.max(...state.template.days.map((day) => day.day));

          const dayOverrides = { ...state.dayOverrides };
          delete dayOverrides[String(lastDay)];

          return {
            template: {
              ...state.template,
              days: state.template.days.filter((day) => day.day !== lastDay),
            },
            dayOverrides,
          };
        });
      },

      updatePlanInfo: (title, description) => {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) return;

        set((state) => ({
          template: {
            ...state.template,
            title: normalizedTitle,
            description: description.trim(),
          },
        }));
      },

      addGroup: (day, title, scope) => {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) return '';

        const group: PlanGroup = {
          id: createId(),
          title: normalizedTitle,
        };

        const updater = (currentDay: PlanDay): PlanDay => ({
          ...currentDay,
          groups: [...currentDay.groups, group],
          contentOrder: appendContentOrder(currentDay, {
            type: 'group',
            id: group.id,
          }),
        });

        set((state) =>
          scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
        );

        return group.id;
      },

      updateGroup: (day, groupId, title, scope) => {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) return;

        const updater = (currentDay: PlanDay): PlanDay => ({
          ...currentDay,
          groups: currentDay.groups.map((group) =>
            group.id === groupId ? { ...group, title: normalizedTitle } : group,
          ),
        });

        set((state) =>
          scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
        );
      },

      deleteGroup: (day, groupId, scope) => {
        const updater = (currentDay: PlanDay): PlanDay => ({
          ...currentDay,
          groups: currentDay.groups.filter((group) => group.id !== groupId),
          tasks: currentDay.tasks.filter((task) => task.groupId !== groupId),
          contentOrder: (currentDay.contentOrder ?? []).filter(
            (item) => !(item.type === 'group' && item.id === groupId),
          ),
        });

        set((state) =>
          scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
        );
      },

      addTask: (day, groupId, input, scope) => {
        const title = input.title.trim();

        if (!title) return null;

        const state = get();
        const selectedDay = getDay(state, day);

        if (!selectedDay) return null;

        if (groupId !== null && !selectedDay.groups.some((group) => group.id === groupId)) {
          return null;
        }

        if (scope === 'day') {
          if (groupId !== null && countGroupTasks(selectedDay, groupId) >= MAX_TASKS_PER_GROUP) {
            return null;
          }
        } else if (groupId !== null) {
          const hasLimit = state.template.days.some((templateDay) => {
            const currentDay = getDay(state, templateDay.day);

            return (
              currentDay?.groups.some((group) => group.id === groupId) &&
              currentDay &&
              countGroupTasks(currentDay, groupId) >= MAX_TASKS_PER_GROUP
            );
          });

          if (hasLimit) return null;
        }

        const originId = createId();

        if (scope === 'all') {
          set((currentState) =>
            updateAllDays(currentState, (currentDay) => {
              if (groupId !== null && !currentDay.groups.some((group) => group.id === groupId)) {
                return currentDay;
              }

              if (groupId !== null && countGroupTasks(currentDay, groupId) >= MAX_TASKS_PER_GROUP) {
                return currentDay;
              }

              const task = createTask(originId, currentDay.day, groupId, input);

              return {
                ...currentDay,
                tasks: [...currentDay.tasks, task],
                contentOrder:
                  groupId === null
                    ? appendContentOrder(currentDay, { type: 'task', id: task.id })
                    : currentDay.contentOrder,
              };
            }),
          );
        } else {
          set((currentState) =>
            updateOneDay(currentState, day, (currentDay) => {
              const task = createTask(originId, day, groupId, input);

              return {
                ...currentDay,
                tasks: [...currentDay.tasks, task],
                contentOrder:
                  groupId === null
                    ? appendContentOrder(currentDay, { type: 'task', id: task.id })
                    : currentDay.contentOrder,
              };
            }),
          );
        }

        return originId;
      },

      addTaskToAllDaysWithGroup: (day, groupId, input) => {
        const title = input.title.trim();

        if (!title) return null;

        const state = get();
        const selectedDay = getDay(state, day);
        const selectedGroup = selectedDay?.groups.find((group) => group.id === groupId);

        if (!selectedGroup) return null;

        const hasLimit = state.template.days.some((templateDay) => {
          const currentDay = getDay(state, templateDay.day);

          return (
            currentDay &&
            currentDay.groups.some((group) => group.id === groupId) &&
            countGroupTasks(currentDay, groupId) >= MAX_TASKS_PER_GROUP
          );
        });

        if (hasLimit) return null;

        const originId = createId();

        set((currentState) =>
          updateAllDays(currentState, (currentDay) => {
            const hasGroup = currentDay.groups.some((group) => group.id === groupId);
            const task = createTask(originId, currentDay.day, groupId, input);

            return {
              ...currentDay,
              groups: hasGroup ? currentDay.groups : [...currentDay.groups, { ...selectedGroup }],
              tasks: [...currentDay.tasks, task],
              contentOrder: hasGroup
                ? currentDay.contentOrder
                : appendContentOrder(currentDay, { type: 'group', id: groupId }),
            };
          }),
        );

        return originId;
      },

      updateTask: (day, taskId, updates, scope) => {
        const state = get();
        const selectedDay = getDay(state, day);
        const selectedTask = selectedDay?.tasks.find((task) => task.id === taskId);

        if (!selectedTask) return;

        const originId = selectedTask.originId ?? selectedTask.id;

        const updater = (currentDay: PlanDay): PlanDay => {
          const existingTask = currentDay.tasks.find(
            (task) => (task.originId ?? task.id) === originId,
          );

          if (!existingTask) {
            const newTask = {
              ...selectedTask,
              ...updates,
              id: `${originId}-day-${currentDay.day}`,
              originId,
            };

            return {
              ...currentDay,
              tasks: [...currentDay.tasks, newTask],
              contentOrder:
                newTask.groupId === null
                  ? appendContentOrder(currentDay, {
                      type: 'task',
                      id: newTask.id,
                    })
                  : currentDay.contentOrder,
            };
          }

          return {
            ...currentDay,
            tasks: currentDay.tasks.map((task) =>
              task.id === existingTask.id ? { ...task, ...updates } : task,
            ),
          };
        };

        set((currentState) =>
          scope === 'all'
            ? updateAllDays(currentState, updater)
            : updateOneDay(currentState, day, updater),
        );
      },

      deleteTask: (day, taskId, scope) => {
        const state = get();
        const selectedDay = getDay(state, day);
        const selectedTask = selectedDay?.tasks.find((task) => task.id === taskId);

        if (!selectedTask) return;

        const originId = selectedTask.originId ?? selectedTask.id;

        const updater = (currentDay: PlanDay): PlanDay => ({
          ...currentDay,
          tasks: currentDay.tasks.filter((task) => (task.originId ?? task.id) !== originId),
          contentOrder:
            selectedTask.groupId === null
              ? (currentDay.contentOrder ?? []).filter(
                  (item) => item.type !== 'task' || item.id !== taskId,
                )
              : currentDay.contentOrder,
        });

        set((currentState) =>
          scope === 'all'
            ? updateAllDays(currentState, updater)
            : updateOneDay(currentState, day, updater),
        );
      },

      addWidget: (day, type, scope) => {
        const selectedDay = getDay(get(), day);

        if (!selectedDay) return null;

        const widgetId = createId();

        const widget: PlanWidget = {
          id: widgetId,
          type,
          enabled: true,
          notes: '',
        };

        const updater = (currentDay: PlanDay): PlanDay => {
          const widgets = currentDay.widgets ?? [];

          if (widgets.some((item) => item.id === widgetId)) {
            return {
              ...currentDay,
              widgets,
            };
          }

          return {
            ...currentDay,
            widgets: [...widgets, widget],
            contentOrder: appendContentOrder(currentDay, {
              type: 'widget',
              id: widgetId,
            }),
          };
        };

        set((state) =>
          scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
        );

        return widgetId;
      },

      updateWidget: (day, widgetId, updates, scope) => {
        const selectedDay = getDay(get(), day);

        if (!selectedDay?.widgets?.some((widget) => widget.id === widgetId)) {
          return;
        }

        const updater = (currentDay: PlanDay): PlanDay => ({
          ...currentDay,
          widgets: (currentDay.widgets ?? []).map((widget) =>
            widget.id === widgetId ? { ...widget, ...updates } : widget,
          ),
        });

        set((state) =>
          scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
        );
      },

      updateWidgetNotes: (day, widgetId, notes) => {
        const selectedDay = getDay(get(), day);

        if (!selectedDay?.widgets?.some((widget) => widget.id === widgetId)) {
          return;
        }

        set((state) =>
          updateOneDay(state, day, (currentDay) => ({
            ...currentDay,
            widgets: (currentDay.widgets ?? []).map((widget) =>
              widget.id === widgetId ? { ...widget, notes } : widget,
            ),
          })),
        );
      },

      moveTask: (day, taskId, targetGroupId, targetIndex) => {
        set((state) =>
          updateOneDay(state, day, (currentDay) => {
            const sourceTask = currentDay.tasks.find((task) => task.id === taskId);

            if (!sourceTask || sourceTask.groupId === targetGroupId) {
              // Перемещение внутри одной карточки тоже разрешено.
              if (!sourceTask) return currentDay;
            }

            if (
              targetGroupId !== null &&
              !currentDay.groups.some((group) => group.id === targetGroupId)
            ) {
              return currentDay;
            }

            const remainingTasks = currentDay.tasks.filter((task) => task.id !== taskId);

            if (
              targetGroupId !== null &&
              remainingTasks.filter((task) => task.groupId === targetGroupId).length >=
                MAX_TASKS_PER_GROUP
            ) {
              return currentDay;
            }

            const movedTask = {
              ...sourceTask,
              groupId: targetGroupId,
            };

            const updatedTasks = [...remainingTasks];
            const targetTasks = updatedTasks.filter((task) => task.groupId === targetGroupId);

            const safeIndex = Math.max(0, Math.min(targetIndex, targetTasks.length));

            let insertIndex = updatedTasks.length;

            const targetTask = targetTasks[safeIndex];

            if (targetTask) {
              insertIndex = updatedTasks.findIndex((task) => task.id === targetTask.id);
            } else {
              const lastTask = targetTasks[targetTasks.length - 1];

              if (lastTask) {
                insertIndex = updatedTasks.findIndex((task) => task.id === lastTask.id) + 1;
              }
            }

            updatedTasks.splice(insertIndex, 0, movedTask);

            let contentOrder = [...(currentDay.contentOrder ?? [])];

            contentOrder = contentOrder.filter(
              (item) => !(item.type === 'task' && item.id === taskId),
            );

            if (targetGroupId === null) {
              contentOrder.push({
                type: 'task',
                id: taskId,
              });
            }

            return {
              ...currentDay,
              tasks: updatedTasks,
              contentOrder,
            };
          }),
        );
      },

      moveContent: (day, active, over) => {
        set((state) =>
          updateOneDay(state, day, (currentDay) => {
            const contentOrder = [...(currentDay.contentOrder ?? [])];

            const activeIndex = contentOrder.findIndex(
              (item) => item.type === active.type && item.id === active.id,
            );

            const overIndex = contentOrder.findIndex(
              (item) => item.type === over.type && item.id === over.id,
            );

            if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
              return currentDay;
            }

            const movedItem = contentOrder[activeIndex];

            if (!movedItem) {
              return currentDay;
            }

            contentOrder.splice(activeIndex, 1);

            const nextOverIndex = contentOrder.findIndex(
              (item) => item.type === over.type && item.id === over.id,
            );

            if (nextOverIndex === -1) {
              return currentDay;
            }

            contentOrder.splice(nextOverIndex, 0, movedItem);

            return {
              ...currentDay,
              contentOrder,
            };
          }),
        );
      },

      deleteWidget: (day, widgetId, scope) => {
        const selectedDay = getDay(get(), day);

        if (!selectedDay?.widgets?.some((widget) => widget.id === widgetId)) {
          return;
        }

        const updater = (currentDay: PlanDay): PlanDay => ({
          ...currentDay,
          widgets: (currentDay.widgets ?? []).filter((widget) => widget.id !== widgetId),
          contentOrder: (currentDay.contentOrder ?? []).filter(
            (item) => !(item.type === 'widget' && item.id === widgetId),
          ),
        });

        set((state) =>
          scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
        );
      },

      replaceAll: (data) => {
        set(normalizePlanData(data));
      },

      reset: () => set(createInitialPlan()),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => normalizePlanData(persistedState),
      partialize: (state): UserPlanData => ({
        schemaVersion: state.schemaVersion,
        template: state.template,
        dayOverrides: state.dayOverrides,
      }),
    },
  ),
);
