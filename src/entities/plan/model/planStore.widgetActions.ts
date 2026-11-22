import type { PlanDay, PlanWidget, PlanWidgetType } from './planSchema';
import type { EditScope, PlanSetState, PlanGetState, WidgetUpdate } from './planStore.types';
import {
  appendContentOrder,
  createId,
  getDay,
  getWidgetSeriesId,
  updateAllDays,
  updateOneDay,
} from './planStore.helpers';

export function createPlanWidgetActions(set: PlanSetState, get: PlanGetState) {
  return {
    addWidget: (day: number, type: PlanWidgetType, scope: EditScope): string | null => {
      const selectedDay = getDay(get(), day);
      if (!selectedDay) return null;

      if (scope === 'day') {
        const widget: PlanWidget = {
          id: createId(),
          type,
          enabled: true,
          notes: '',
        };

        set((state) =>
          updateOneDay(state, day, (currentDay) => ({
            ...currentDay,
            widgets: [...(currentDay.widgets ?? []), widget],
            contentOrder: appendContentOrder(currentDay, { type: 'widget', id: widget.id }),
          })),
        );

        return widget.id;
      }

      // Общая серия, но отдельный экземпляр и отдельный id для каждого дня.
      const seriesId = createId();

      set((state) =>
        updateAllDays(state, (currentDay) => {
          const widget: PlanWidget = {
            id: createId(),
            seriesId,
            type,
            enabled: true,
            notes: '',
          };

          return {
            ...currentDay,
            widgets: [...(currentDay.widgets ?? []), widget],
            contentOrder: appendContentOrder(currentDay, { type: 'widget', id: widget.id }),
          };
        }),
      );

      return seriesId;
    },

    updateWidget: (
      day: number,
      widgetId: string,
      updates: WidgetUpdate,
      scope: EditScope,
    ) => {
      const selectedDay = getDay(get(), day);
      const selectedWidget = selectedDay?.widgets?.find((widget) => widget.id === widgetId);
      if (!selectedWidget) return;

      const seriesId = getWidgetSeriesId(selectedWidget);
      const updater = (currentDay: PlanDay): PlanDay => ({
        ...currentDay,
        widgets: (currentDay.widgets ?? []).map((widget) =>
          getWidgetSeriesId(widget) === seriesId ? { ...widget, ...updates } : widget,
        ),
      });

      set((state) =>
        scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
      );
    },

    updateWidgetNotes: (day: number, widgetId: string, notes: string) => {
      const selectedDay = getDay(get(), day);
      if (!selectedDay?.widgets?.some((widget) => widget.id === widgetId)) return;

      // Заметки всегда обновляются только у выбранного экземпляра.
      set((state) =>
        updateOneDay(state, day, (currentDay) => ({
          ...currentDay,
          widgets: (currentDay.widgets ?? []).map((widget) =>
            widget.id === widgetId ? { ...widget, notes } : widget,
          ),
        })),
      );
    },

    deleteWidget: (day: number, widgetId: string, scope: EditScope) => {
      const selectedDay = getDay(get(), day);
      const selectedWidget = selectedDay?.widgets?.find((widget) => widget.id === widgetId);
      if (!selectedWidget) return;

      const seriesId = getWidgetSeriesId(selectedWidget);
      const updater = (currentDay: PlanDay): PlanDay => {
        const widgets = (currentDay.widgets ?? []).filter((widget) =>
          scope === 'all' ? getWidgetSeriesId(widget) !== seriesId : widget.id !== widgetId,
        );

        const remainingWidgetIds = new Set(widgets.map((widget) => widget.id));

        return {
          ...currentDay,
          widgets,
          contentOrder: (currentDay.contentOrder ?? []).filter(
            (item) => item.type !== 'widget' || remainingWidgetIds.has(item.id),
          ),
        };
      };

      set((state) =>
        scope === 'all' ? updateAllDays(state, updater) : updateOneDay(state, day, updater),
      );
    },
  };
}
