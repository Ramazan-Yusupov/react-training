import { STORAGE_KEYS } from '@/shared/config';
import { todayISO } from '@/shared/lib';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ProgressData {
  startDate: string;
  completed: Record<string, string>;
  microBreaks: Record<number, number>;
}

interface ProgressActions {
  toggleTask: (taskId: string) => boolean;
  setMicroBreaks: (day: number, count: number) => void;
  replaceAll: (data: ProgressData) => void;
  reset: () => void;
}

export type ProgressState = ProgressData & ProgressActions;

export const createInitialProgress = (): ProgressData => ({
  startDate: todayISO(),
  completed: {},
  microBreaks: {},
});

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...createInitialProgress(),

      toggleTask: (taskId) => {
        const isDone = Boolean(get().completed[taskId]);
        set((state) => {
          const completed = { ...state.completed };
          if (isDone) delete completed[taskId];
          else completed[taskId] = new Date().toISOString();
          return { completed };
        });
        return !isDone;
      },

      setMicroBreaks: (day, count) =>
        set((state) => ({ microBreaks: { ...state.microBreaks, [day]: Math.max(0, count) } })),

      startWorkoutToday: () => set({ startDate: todayISO() }),

      replaceAll: (data) => set({ ...data }),
      reset: () => set({ ...createInitialProgress() }),
    }),
    {
      name: STORAGE_KEYS.PROGRESS,
      version: 2,
      migrate: () => createInitialProgress(),
      storage: createJSONStorage(() => localStorage),
      partialize: (state): ProgressData => ({
        startDate: state.startDate,
        completed: state.completed,
        microBreaks: state.microBreaks,
      }),
    },
  ),
);
