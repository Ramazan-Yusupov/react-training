import { workoutPlan } from './plans';
import { userWorkoutPlanSchema } from './userPlanSchema';
import type { UserWorkoutPlanData } from './userPlanSchema';
import { STORAGE_KEYS } from '@/shared/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserWorkoutPlanActions {
  setDayOverride: (day: number, value: UserWorkoutPlanData['template']['days'][number]) => void;
  clearDayOverride: (day: number) => void;
  replaceAll: (data: UserWorkoutPlanData) => void;
  reset: () => void;
}

export type UserWorkoutPlanState = UserWorkoutPlanData & UserWorkoutPlanActions;

/** Новый пользователь получает копию исходного JSON-плана. */
export const createInitialUserWorkoutPlan = (): UserWorkoutPlanData =>
  userWorkoutPlanSchema.parse({
    schemaVersion: 1,
    template: workoutPlan,
    dayOverrides: {},
  });

export const useUserWorkoutPlanStore = create<UserWorkoutPlanState>()(
  persist(
    (set) => ({
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

      replaceAll: (data) => set(userWorkoutPlanSchema.parse(data)),

      reset: () => set(createInitialUserWorkoutPlan()),
    }),
    {
      name: STORAGE_KEYS.USER_PLAN,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): UserWorkoutPlanData => ({
        schemaVersion: state.schemaVersion,
        template: state.template,
        dayOverrides: state.dayOverrides,
      }),
    },
  ),
);
