import { userPlanSchema } from './planSchema';
import type { PlanDay, PlanGroup, PlanTask, UserPlanData } from './planSchema';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type EditScope = 'all' | 'day';

const MAX_TASKS_PER_GROUP = 10;
const STORAGE_KEY = 'planer-user-plan-v2';

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

interface PlanActions {
  addDay: () => void;
  removeLastDay: () => void;

  updatePlanInfo: (title: string, description: string) => void;

  addGroup: (day: number, title: string, scope: EditScope) => string;
  updateGroup: (day: number, groupId: string, title: string, scope: EditScope) => void;
  deleteGroup: (day: number, groupId: string, scope: EditScope) => void;

  addTask: (day: number, groupId: string, input: TaskInput, scope: EditScope) => string | null;
  updateTask: (day: number, taskId: string, updates: TaskUpdate, scope: EditScope) => void;
  deleteTask: (day: number, taskId: string, scope: EditScope) => void;

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
      [String(dayNumber)]: updater(currentDay),
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
      days: state.template.days.map(updater),
    },
    dayOverrides: Object.fromEntries(
      Object.entries(state.dayOverrides).map(([key, day]) => [key, updater(day)]),
    ),
  };
}

function countGroupTasks(day: PlanDay, groupId: string): number {
  return day.tasks.filter((task) => task.groupId === groupId).length;
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

        if (!selectedDay?.groups.some((group) => group.id === groupId)) {
          return null;
        }

        if (scope === 'day') {
          if (countGroupTasks(selectedDay, groupId) >= MAX_TASKS_PER_GROUP) {
            return null;
          }
        } else {
          const hasLimit = state.template.days.some((templateDay) => {
            const currentDay = getDay(state, templateDay.day);

            return (
              currentDay?.groups.some((group) => group.id === groupId) &&
              countGroupTasks(currentDay, groupId) >= MAX_TASKS_PER_GROUP
            );
          });

          if (hasLimit) return null;
        }

        const originId = createId();

        const createTask = (dayNumber: number): PlanTask => ({
          id: `${originId}-day-${dayNumber}`,
          originId,
          title,
          durationMin: input.durationMin ?? 5,
          xp: input.xp ?? 5,
          required: input.required ?? true,
          groupId,
          ...(input.scheduledTime ? { scheduledTime: input.scheduledTime } : {}),
        });

        if (scope === 'all') {
          set((currentState) =>
            updateAllDays(currentState, (currentDay) => {
              if (!currentDay.groups.some((group) => group.id === groupId)) {
                return currentDay;
              }

              return {
                ...currentDay,
                tasks: [...currentDay.tasks, createTask(currentDay.day)],
              };
            }),
          );
        } else {
          set((currentState) =>
            updateOneDay(currentState, day, (currentDay) => ({
              ...currentDay,
              tasks: [...currentDay.tasks, createTask(day)],
            })),
          );
        }

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
            return {
              ...currentDay,
              tasks: [
                ...currentDay.tasks,
                {
                  ...selectedTask,
                  ...updates,
                  id: `${originId}-day-${currentDay.day}`,
                  originId,
                },
              ],
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
        });

        set((currentState) =>
          scope === 'all'
            ? updateAllDays(currentState, updater)
            : updateOneDay(currentState, day, updater),
        );
      },

      replaceAll: (data) => {
        set(userPlanSchema.parse(data));
      },

      reset: () => set(createInitialPlan()),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: () => createInitialPlan(),
      partialize: (state): UserPlanData => ({
        schemaVersion: state.schemaVersion,
        template: state.template,
        dayOverrides: state.dayOverrides,
      }),
    },
  ),
);
