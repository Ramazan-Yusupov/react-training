import { FOCUS_TIMER, STORAGE_KEYS } from '@/shared/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface FocusTimerSettings {
  workDurationMin: number;
  breakDurationMin: number;
}

export interface SettingsData extends FocusTimerSettings {
  /** Награды за уровни, которые выбрал сам пользователь */
  rewards: Record<string, string>;
}

interface SettingsActions {
  setReward: (levelId: string, reward: string) => void;
  setFocusTimerDurations: (durations: FocusTimerSettings) => void;
  replaceAll: (data: SettingsData) => void;
}

export const DEFAULT_SETTINGS: SettingsData = {
  rewards: {},
  workDurationMin: FOCUS_TIMER.WORK / 60,
  breakDurationMin: FOCUS_TIMER.BREAK / 60,
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
      }),
    },
  ),
);
