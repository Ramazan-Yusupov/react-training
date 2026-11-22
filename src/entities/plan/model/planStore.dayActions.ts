import type { PlanSetState, PlanGetState } from './planStore.types';

export function createPlanDayActions(set: PlanSetState, _get: PlanGetState) {
  return {
    addDay: () => {
      set((state) => {
        const lastDay = Math.max(...state.template.days.map((day) => day.day));
        return {
          template: {
            ...state.template,
            days: [
              ...state.template.days,
              { day: lastDay + 1, groups: [], tasks: [], widgets: [], contentOrder: [] },
            ],
          },
        };
      });
    },

    removeLastDay: () => {
      set((state) => {
        if (state.template.days.length <= 1) return {};

        const lastDay = Math.max(...state.template.days.map((day) => day.day));
        const dayOverrides = { ...state.dayOverrides };
        delete dayOverrides[String(lastDay)];

        return {
          template: {
            ...state.template,
            days: state.template.days.filter((day) => day.day !== lastDay),
          },
          dayOverrides,
        };
      });
    },

    updatePlanInfo: (title: string, description: string) => {
      const normalizedTitle = title.trim();
      if (!normalizedTitle) return;

      set((state) => ({
        template: {
          ...state.template,
          title: normalizedTitle,
          description: description.trim(),
        },
      }));
    },
  };
}
