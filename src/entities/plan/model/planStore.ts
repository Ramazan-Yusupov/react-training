import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createPlanDayActions } from './planStore.dayActions';
import { createPlanGroupActions } from './planStore.groupActions';
import { createPlanTaskActions } from './planStore.taskActions';
import { createPlanWidgetActions } from './planStore.widgetActions';
import { createInitialPlan, normalizePlanData } from './planStore.helpers';

import type { PlanState } from './planStore.types';
import type { UserPlanData } from './planSchema';

const STORAGE_KEY = 'planer-user-plan-v2';
const STORAGE_VERSION = 5;

export type { EditScope, PlanState } from './planStore.types';
export type { TaskInput, TaskUpdate, WidgetUpdate } from './planStore.types';
export { createInitialPlan, normalizePlanData } from './planStore.helpers';

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      ...createInitialPlan(),
      ...createPlanDayActions(set, get),
      ...createPlanGroupActions(set, get),
      ...createPlanTaskActions(set, get),
      ...createPlanWidgetActions(set, get),

      replaceAll: (data: UserPlanData) => {
        set(normalizePlanData(data));
      },

      reset: () => set(createInitialPlan()),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => normalizePlanData(persistedState, true),
      partialize: (state): UserPlanData => ({
        schemaVersion: state.schemaVersion,
        template: state.template,
        dayOverrides: state.dayOverrides,
      }),
    },
  ),
);
