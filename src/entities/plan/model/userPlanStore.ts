import { workoutPlan } from './plans';
import { userWorkoutPlanSchema } from './userPlanSchema';
import type { UserWorkoutPlanData } from './userPlanSchema';
import type { Task, WorkoutDay, WorkoutGroup } from './types';
import { STORAGE_KEYS } from '@/shared/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type EditScope = 'all' | 'day';

const MAX_CUSTOM_TASKS_PER_GROUP = 10;

type CustomTaskInput = {
  title: string;
  durationMin?: number;
  xp?: number;
  required?: boolean;
};

type TaskUpdate = Partial<Pick<Task, 'title' | 'durationMin' | 'xp' | 'required'>>;

interface UserWorkoutPlanActions {
  setDayOverride: (day: number, value: WorkoutDay) => void;
  clearDayOverride: (day: number) => void;

  addGroup: (day: number, title: string, scope: EditScope) => string;
  updateGroup: (day: number, groupId: string, title: string, scope: EditScope) => void;
  deleteGroup: (day: number, groupId: string, scope: EditScope) => void;

  addCustomTask: (
    day: number,
    groupId: string,
    input: CustomTaskInput,
    scope: EditScope,
  ) => string | null;
  updateTask: (day: number, taskId: string, updates: TaskUpdate, scope: EditScope) => void;
  deleteTask: (day: number, taskId: string, scope: EditScope) => void;

  replaceAll: (data: UserWorkoutPlanData) => void;
  reset: () => void;
}

export type UserWorkoutPlanState = UserWorkoutPlanData & UserWorkoutPlanActions;

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function addTaskOrigins(plan: UserWorkoutPlanData): UserWorkoutPlanData {
  const normalizeDay = (day: WorkoutDay): WorkoutDay => ({
    ...day,
    tasks: day.tasks.map((task) => ({
      ...task,
      originId: task.originId ?? task.id.replace(/^d\d+-/, ''),
    })),
  });

  return {
    ...plan,
    template: {
      ...plan.template,
      days: plan.template.days.map(normalizeDay),
    },
    dayOverrides: Object.fromEntries(
      Object.entries(plan.dayOverrides).map(([day, value]) => [day, normalizeDay(value)]),
    ),
  };
}

const DEFAULT_GROUP_ID = 'default-workout-group';
const DEFAULT_GROUP_TITLE = 'Мой план';

function ensureDefaultGroup(plan: UserWorkoutPlanData): UserWorkoutPlanData {
  const normalizeDay = (day: WorkoutDay): WorkoutDay => {
    const groups = day.groups ?? [];

    const hasDefaultGroup = groups.some((group) => group.id === DEFAULT_GROUP_ID);

    return {
      ...day,
      groups: hasDefaultGroup
        ? groups
        : [...groups, { id: DEFAULT_GROUP_ID, title: DEFAULT_GROUP_TITLE }],
      tasks: day.tasks.map((task) =>
        task.groupId
          ? task
          : {
              ...task,
              groupId: DEFAULT_GROUP_ID,
            },
      ),
    };
  };

  return {
    ...plan,
    template: {
      ...plan.template,
      days: plan.template.days.map(normalizeDay),
    },
    dayOverrides: Object.fromEntries(
      Object.entries(plan.dayOverrides).map(([day, value]) => [day, normalizeDay(value)]),
    ),
  };
}

export const createInitialUserWorkoutPlan = (): UserWorkoutPlanData => {
  const parsed = userWorkoutPlanSchema.parse({
    schemaVersion: 1,
    template: workoutPlan,
    dayOverrides: {},
  });

  return ensureDefaultGroup(addTaskOrigins(parsed));
};

function updateAllDays(
  state: UserWorkoutPlanData,
  updater: (day: WorkoutDay) => WorkoutDay,
): Partial<UserWorkoutPlanData> {
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

function updateSingleDay(
  state: UserWorkoutPlanData,
  dayNumber: number,
  updater: (day: WorkoutDay) => WorkoutDay,
): Partial<UserWorkoutPlanData> | null {
  const currentDay =
    state.dayOverrides[String(dayNumber)] ??
    state.template.days.find((day) => day.day === dayNumber);

  if (!currentDay) return null;

  return {
    dayOverrides: {
      ...state.dayOverrides,
      [String(dayNumber)]: updater(currentDay),
    },
  };
}

function countGroupTasks(day: WorkoutDay, groupId: string): number {
  return day.tasks.filter((task) => task.groupId === groupId && task.type === 'custom').length;
}

export const useUserWorkoutPlanStore = create<UserWorkoutPlanState>()(
  persist(
    (set, get) => ({
      ...createInitialUserWorkoutPlan(),

      setDayOverride: (day, value) =>
        set((state) => ({
          dayOverrides: {
            ...state.dayOverrides,
            [String(day)]: value,
          },
        })),

      clearDayOverride: (day) =>
        set((state) => {
          const dayOverrides = { ...state.dayOverrides };
          delete dayOverrides[String(day)];

          return { dayOverrides };
        }),

      /** Создаёт новую карточку в выбранной области плана. */
      addGroup: (day, title, scope) => {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) return '';

        const group: WorkoutGroup = {
          id: createId(),
          title: normalizedTitle,
        };

        const updater = (currentDay: WorkoutDay): WorkoutDay => ({
          ...currentDay,
          groups: [...(currentDay.groups ?? []), group],
        });

        set((state) =>
          scope === 'all'
            ? updateAllDays(state, updater)
            : (updateSingleDay(state, day, updater) ?? {}),
        );

        return group.id;
      },

      updateGroup: (day, groupId, title, scope) => {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) return;

        const updater = (currentDay: WorkoutDay): WorkoutDay => {
          const groups = currentDay.groups ?? [];
          const groupExists = groups.some((group) => group.id === groupId);

          return {
            ...currentDay,
            groups: groupExists
              ? groups.map((group) =>
                  group.id === groupId ? { ...group, title: normalizedTitle } : group,
                )
              : [...groups, { id: groupId, title: normalizedTitle }],
          };
        };

        set((state) =>
          scope === 'all'
            ? updateAllDays(state, updater)
            : (updateSingleDay(state, day, updater) ?? {}),
        );
      },

      deleteGroup: (day, groupId, scope) => {
        const updater = (currentDay: WorkoutDay): WorkoutDay => ({
          ...currentDay,
          groups: (currentDay.groups ?? []).filter((group) => group.id !== groupId),
          tasks: currentDay.tasks.filter((task) => task.groupId !== groupId),
        });

        set((state) =>
          scope === 'all'
            ? updateAllDays(state, updater)
            : (updateSingleDay(state, day, updater) ?? {}),
        );
      },

      addCustomTask: (day, groupId, input, scope) => {
        const title = input.title.trim();

        if (!title) return null;

        const state = get();

        const selectedDay =
          state.dayOverrides[String(day)] ?? state.template.days.find((item) => item.day === day);

        if (!selectedDay?.groups?.some((group) => group.id === groupId)) {
          return null;
        }

        if (scope === 'day') {
          if (countGroupTasks(selectedDay, groupId) >= MAX_CUSTOM_TASKS_PER_GROUP) {
            return null;
          }
        } else {
          const targetDays = state.template.days
            .map((templateDay) => state.dayOverrides[String(templateDay.day)] ?? templateDay)
            .filter((currentDay) => currentDay.groups?.some((group) => group.id === groupId));

          if (
            targetDays.some(
              (currentDay) => countGroupTasks(currentDay, groupId) >= MAX_CUSTOM_TASKS_PER_GROUP,
            )
          ) {
            return null;
          }
        }

        const originId = createId();

        const createTask = (dayNumber: number): Task => ({
          id: `${originId}-day-${dayNumber}`,
          originId,
          type: 'custom',
          title,
          durationMin: input.durationMin ?? 5,
          xp: input.xp ?? 5,
          required: input.required ?? false,
          groupId,
        });

        if (scope === 'all') {
          set((currentState) =>
            updateAllDays(currentState, (currentDay) => {
              if (!currentDay.groups?.some((group) => group.id === groupId)) {
                return currentDay;
              }

              return {
                ...currentDay,
                tasks: [...currentDay.tasks, createTask(currentDay.day)],
              };
            }),
          );

          return originId;
        }

        set((currentState) => {
          const update = updateSingleDay(currentState, day, (currentDay) => ({
            ...currentDay,
            tasks: [...currentDay.tasks, createTask(day)],
          }));

          return update ?? {};
        });

        return originId;
      },

      updateTask: (day, taskId, updates, scope) => {
        const state = get();

        const selectedDay =
          state.dayOverrides[String(day)] ?? state.template.days.find((item) => item.day === day);

        const selectedTask = selectedDay?.tasks.find((task) => task.id === taskId);

        if (!selectedTask) return;

        const originId = selectedTask.originId ?? selectedTask.id;
        const selectedGroup = selectedTask.groupId
          ? selectedDay?.groups?.find((group) => group.id === selectedTask.groupId)
          : undefined;

        const updater = (currentDay: WorkoutDay): WorkoutDay => {
          const existingTask = currentDay.tasks.find(
            (task) => (task.originId ?? task.id) === originId,
          );

          const groups = currentDay.groups ?? [];
          const groupExists =
            !selectedGroup || groups.some((group) => group.id === selectedGroup.id);

          const nextGroups = selectedGroup && !groupExists ? [...groups, selectedGroup] : groups;

          if (existingTask) {
            return {
              ...currentDay,
              groups: nextGroups,
              tasks: currentDay.tasks.map((task) =>
                task.id === existingTask.id ? { ...task, ...updates, id: task.id } : task,
              ),
            };
          }

          return {
            ...currentDay,
            groups: nextGroups,
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
        };

        set((currentState) =>
          scope === 'all'
            ? updateAllDays(currentState, updater)
            : (updateSingleDay(currentState, day, updater) ?? {}),
        );
      },

      deleteTask: (day, taskId, scope) => {
        const state = get();

        const selectedDay =
          state.dayOverrides[String(day)] ?? state.template.days.find((item) => item.day === day);

        const selectedTask = selectedDay?.tasks.find((task) => task.id === taskId);

        if (!selectedTask) return;

        const originId = selectedTask.originId ?? selectedTask.id;

        const updater = (currentDay: WorkoutDay): WorkoutDay => ({
          ...currentDay,
          tasks: currentDay.tasks.filter((task) => {
            const taskOriginId = task.originId ?? task.id;
            return taskOriginId !== originId;
          }),
        });

        set((currentState) =>
          scope === 'all'
            ? updateAllDays(currentState, updater)
            : (updateSingleDay(currentState, day, updater) ?? {}),
        );
      },

      replaceAll: (data) => set(addTaskOrigins(userWorkoutPlanSchema.parse(data))),

      reset: () => set(createInitialUserWorkoutPlan()),
    }),
    {
      name: STORAGE_KEYS.USER_PLAN,

      version: 3,
      storage: createJSONStorage(() => localStorage),

      migrate: (persistedState) => {
        const parsed = userWorkoutPlanSchema.parse(persistedState);
        return ensureDefaultGroup(addTaskOrigins(parsed));
      },

      partialize: (state): UserWorkoutPlanData => ({
        schemaVersion: state.schemaVersion,
        template: state.template,
        dayOverrides: state.dayOverrides,
      }),
    },
  ),
);
