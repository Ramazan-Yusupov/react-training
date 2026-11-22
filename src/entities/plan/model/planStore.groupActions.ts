import type { PlanDay, PlanGroup } from './planSchema';
import type { EditScope, PlanSetState, PlanGetState } from './planStore.types';
import { appendContentOrder, createId, updateAllDays, updateOneDay } from './planStore.helpers';

export function createPlanGroupActions(set: PlanSetState, _get: PlanGetState) {
  return {
    addGroup: (day: number, title: string, scope: EditScope): string => {
      const normalizedTitle = title.trim();
      if (!normalizedTitle) return '';

      const group: PlanGroup = { id: createId(), title: normalizedTitle };
      const updater = (currentDay: PlanDay): PlanDay => ({
        ...currentDay,
        groups: [...currentDay.groups, group],
        contentOrder: appendContentOrder(currentDay, { type: 'group', id: group.id }),
      });

      set((state) =>
        scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
      );

      return group.id;
    },

    updateGroup: (day: number, groupId: string, title: string, scope: EditScope) => {
      const normalizedTitle = title.trim();
      if (!normalizedTitle) return;

      const updater = (currentDay: PlanDay): PlanDay => ({
        ...currentDay,
        groups: currentDay.groups.map((group) =>
          group.id === groupId ? { ...group, title: normalizedTitle } : group,
        ),
      });

      set((state) =>
        scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
      );
    },

    deleteGroup: (day: number, groupId: string, scope: EditScope) => {
      const updater = (currentDay: PlanDay): PlanDay => ({
        ...currentDay,
        groups: currentDay.groups.filter((group) => group.id !== groupId),
        tasks: currentDay.tasks.filter((task) => task.groupId !== groupId),
        contentOrder: (currentDay.contentOrder ?? []).filter(
          (item) => !(item.type === 'group' && item.id === groupId),
        ),
      });

      set((state) =>
        scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
      );
    },
  };
}
