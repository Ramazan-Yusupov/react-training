import { STORAGE_KEYS } from '@/shared/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SettingsData {
  /** Награды за уровни, которые выбрал сам пользователь */
  rewards: Record<string, string>;
}

interface SettingsActions {
  setReward: (levelId: string, reward: string) => void;
  replaceAll: (data: SettingsData) => void;
}

export const DEFAULT_SETTINGS: SettingsData = {
  rewards: {},
};

export const useSettingsStore = create<SettingsData & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setReward: (levelId, reward) =>
        set((state) => ({ rewards: { ...state.rewards, [levelId]: reward } })),

      replaceAll: (data) => set({ ...data }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): SettingsData => ({
        rewards: state.rewards,
      }),
    },
  ),
);
