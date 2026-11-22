import { FOCUS_TIMER, STORAGE_KEYS } from '@/shared/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface FocusTimerSettings {
  workDurationMin: number;
  breakDurationMin: number;
  workLabel: string;
}

export interface SettingsData extends FocusTimerSettings {
  rewards: Record<string, string>;
}

interface SettingsActions {
  setReward: (levelId: string, reward: string) => void;
  setFocusTimerDurations: (
    durations: Pick<FocusTimerSettings, 'workDurationMin' | 'breakDurationMin'>,
  ) => void;
  setFocusTimerLabel: (label: string) => void;
  replaceAll: (data: SettingsData) => void;
}

export const DEFAULT_SETTINGS: SettingsData = {
  rewards: {},
  workDurationMin: FOCUS_TIMER.WORK / 60,
  breakDurationMin: FOCUS_TIMER.BREAK / 60,
  workLabel: 'Работа',
};

export const useSettingsStore = create<SettingsData & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setReward: (levelId, reward) =>
        set((state) => ({
          rewards: { ...state.rewards, [levelId]: reward },
        })),

      setFocusTimerDurations: (durations) => set(durations),

      setFocusTimerLabel: (workLabel) => set({ workLabel }),

      replaceAll: (data) => set({ ...data }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): SettingsData => ({
        rewards: state.rewards,
        workDurationMin: state.workDurationMin,
        breakDurationMin: state.breakDurationMin,
        workLabel: state.workLabel,
      }),
    },
  ),
);
