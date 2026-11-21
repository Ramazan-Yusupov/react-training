import { STORAGE_KEYS } from '@/shared/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  createInitialMicroBreaks,
  type CreateMicroBreakInput,
  type MicroBreak,
  type MicroBreakData,
  type UpdateMicroBreakInput,
} from './schema';

interface MicroBreakActions {
  addBreak: (input: CreateMicroBreakInput) => string | null;
  updateBreak: (id: string, updates: UpdateMicroBreakInput) => void;
  removeBreak: (id: string) => void;
  toggleBreak: (id: string) => void;
  reorderBreaks: (ids: string[]) => void;
  replaceAll: (data: MicroBreakData) => void;
  reset: () => void;
}

export type MicroBreakState = MicroBreakData & MicroBreakActions;

const MIN_DURATION = 1;
const MAX_DURATION = 60;

const normalizeDuration = (duration: number): number =>
  Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.round(duration)));

const createId = (): string => crypto.randomUUID();

const sortByOrder = (items: MicroBreak[]): MicroBreak[] =>
  [...items].sort((a, b) => a.order - b.order);

export const useMicroBreakStore = create<MicroBreakState>()(
  persist(
    (set, get) => ({
      ...createInitialMicroBreaks(),

      addBreak: ({ text, durationMinutes = 2 }) => {
        const normalizedText = text.trim();

        if (!normalizedText) {
          return null;
        }

        const items = get().items;
        const id = createId();

        const newBreak: MicroBreak = {
          id,
          text: normalizedText,
          durationMinutes: normalizeDuration(durationMinutes),
          enabled: true,
          order: items.length,
        };

        set({ items: [...items, newBreak] });

        return id;
      },

      updateBreak: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) {
              return item;
            }

            const nextItem = { ...item };

            if (updates.text !== undefined) {
              const text = updates.text.trim();

              if (text) {
                nextItem.text = text;
              }
            }

            if (updates.durationMinutes !== undefined) {
              nextItem.durationMinutes = normalizeDuration(updates.durationMinutes);
            }

            if (updates.enabled !== undefined) {
              nextItem.enabled = updates.enabled;
            }

            return nextItem;
          }),
        })),

      removeBreak: (id) =>
        set((state) => ({
          items: sortByOrder(state.items.filter((item) => item.id !== id)).map((item, index) => ({
            ...item,
            order: index,
          })),
        })),

      toggleBreak: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, enabled: !item.enabled } : item,
          ),
        })),

      reorderBreaks: (ids) =>
        set((state) => {
          const itemsById = new Map(state.items.map((item) => [item.id, item]));

          const orderedItems = ids
            .map((id) => itemsById.get(id))
            .filter((item): item is MicroBreak => Boolean(item));

          const includedIds = new Set(orderedItems.map((item) => item.id));

          const remainingItems = sortByOrder(
            state.items.filter((item) => !includedIds.has(item.id)),
          );

          return {
            items: [...orderedItems, ...remainingItems].map((item, index) => ({
              ...item,
              order: index,
            })),
          };
        }),

      replaceAll: (data) => set({ items: data.items }),

      reset: () => set(createInitialMicroBreaks()),
    }),
    {
      name: STORAGE_KEYS.MICRO_BREAKS,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): MicroBreakData => ({
        items: state.items,
      }),
    },
  ),
);
