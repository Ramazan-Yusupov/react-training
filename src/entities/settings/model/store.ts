import { STORAGE_KEYS } from '@/shared/config';
import { clamp } from '@/shared/lib';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SettingsData {
  /** Во сколько обычно садишься за ПК (час) */
  workStartHour: number;
  /** Награды за уровни, которые выбрал сам пользователь */
  rewards: Record<string, string>;
}

interface SettingsActions {
  setWorkStartHour: (hour: number) => void;
  setReward: (levelId: string, reward: string) => void;
  replaceAll: (data: SettingsData) => void;
}

export const DEFAULT_SETTINGS: SettingsData = {
  workStartHour: 8,
  rewards: {},
};

export const useSettingsStore = create<SettingsData & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setWorkStartHour: (hour) => set({ workStartHour: clamp(Math.round(hour), 5, 12) }),
      setReward: (levelId, reward) =>
        set((state) => ({ rewards: { ...state.rewards, [levelId]: reward } })),
      replaceAll: (data) => set({ ...data }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): SettingsData => ({
        workStartHour: state.workStartHour,
        rewards: state.rewards,
      }),
    },
  ),
);
