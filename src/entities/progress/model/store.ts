import { DEFAULT_START_DATE, STORAGE_KEYS } from '@/shared/config';
import { todayISO } from '@/shared/lib';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ProgressData {
  /** Дата дня 1 тренировочного плана */
  startDate: string;
  /** Дата дня 1 плана осанки (null, пока не начат) */
  postureStartDate: string | null;
  /** id задачи -> когда отмечена */
  completed: Record<string, string>;
  /** номер дня -> сколько микро-пауз сделано */
  microBreaks: Record<number, number>;
  /** номер дня плана осанки -> сколько минут носил корсет */
  corsetMinutes: Record<number, number>;
  /** id задачи замера -> значения полей */
  measurements: Record<string, Record<string, string>>;
}

interface ProgressActions {
  /** Возвращает новое состояние задачи: true = выполнена */
  toggleTask: (taskId: string) => boolean;
  setMicroBreaks: (day: number, count: number) => void;
  setCorsetMinutes: (day: number, minutes: number) => void;
  saveMeasurement: (taskId: string, values: Record<string, string>) => void;
  startWorkoutToday: () => void;
  startPostureToday: () => void;
  replaceAll: (data: ProgressData) => void;
  reset: () => void;
}

export type ProgressState = ProgressData & ProgressActions;

export const createInitialProgress = (): ProgressData => ({
  startDate: DEFAULT_START_DATE,
  postureStartDate: null,
  completed: {},
  microBreaks: {},
  corsetMinutes: {},
  measurements: {},
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

      setCorsetMinutes: (day, minutes) =>
        set((state) => ({
          corsetMinutes: { ...state.corsetMinutes, [day]: Math.max(0, minutes) },
        })),

      saveMeasurement: (taskId, values) =>
        set((state) => ({
          measurements: { ...state.measurements, [taskId]: values },
          completed: {
            ...state.completed,
            [taskId]: state.completed[taskId] ?? new Date().toISOString(),
          },
        })),

      startWorkoutToday: () => set({ startDate: todayISO() }),
      startPostureToday: () => set({ postureStartDate: todayISO() }),
      replaceAll: (data) => set({ ...data }),
      reset: () => set({ ...createInitialProgress() }),
    }),
    {
      name: STORAGE_KEYS.PROGRESS,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): ProgressData => ({
        startDate: state.startDate,
        postureStartDate: state.postureStartDate,
        completed: state.completed,
        microBreaks: state.microBreaks,
        corsetMinutes: state.corsetMinutes,
        measurements: state.measurements,
      }),
    },
  ),
);
