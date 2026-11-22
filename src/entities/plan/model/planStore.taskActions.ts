import type { PlanContentOrderItem, PlanDay } from './planSchema';
import type { EditScope, PlanSetState, PlanGetState, TaskInput, TaskUpdate } from './planStore.types';
import {
  MAX_TASKS_PER_GROUP,
  appendContentOrder,
  countGroupTasks,
  createId,
  createTask,
  getDay,
  updateAllDays,
  updateOneDay,
} from './planStore.helpers';

export function createPlanTaskActions(set: PlanSetState, get: PlanGetState) {
  return {
    addTask: (
      day: number,
      groupId: string | null,
      input: TaskInput,
      scope: EditScope,
    ): string | null => {
      const title = input.title.trim();
      if (!title) return null;

      const state = get();
      const selectedDay = getDay(state, day);
      if (!selectedDay) return null;

      if (groupId !== null && !selectedDay.groups.some((group) => group.id === groupId)) {
        return null;
      }

      if (scope === 'day') {
        if (groupId !== null && countGroupTasks(selectedDay, groupId) >= MAX_TASKS_PER_GROUP) {
          return null;
        }
      } else if (groupId !== null) {
        const hasLimit = state.template.days.some((templateDay) => {
          const currentDay = getDay(state, templateDay.day);
          return (
            currentDay?.groups.some((group) => group.id === groupId) &&
            currentDay &&
            countGroupTasks(currentDay, groupId) >= MAX_TASKS_PER_GROUP
          );
        });
        if (hasLimit) return null;
      }

      const originId = createId();

      if (scope === 'all') {
        set((currentState) =>
          updateAllDays(currentState, (currentDay) => {
            if (groupId !== null && !currentDay.groups.some((group) => group.id === groupId)) {
              return currentDay;
            }
            if (groupId !== null && countGroupTasks(currentDay, groupId) >= MAX_TASKS_PER_GROUP) {
              return currentDay;
            }

            const task = createTask(originId, currentDay.day, groupId, input);
            return {
              ...currentDay,
              tasks: [...currentDay.tasks, task],
              contentOrder:
                groupId === null
                  ? appendContentOrder(currentDay, { type: 'task', id: task.id })
                  : currentDay.contentOrder,
            };
          }),
        );
      } else {
        set((currentState) =>
          updateOneDay(currentState, day, (currentDay) => {
            const task = createTask(originId, day, groupId, input);
            return {
              ...currentDay,
              tasks: [...currentDay.tasks, task],
              contentOrder:
                groupId === null
                  ? appendContentOrder(currentDay, { type: 'task', id: task.id })
                  : currentDay.contentOrder,
            };
          }),
        );
      }

      return originId;
    },

    addTaskToAllDaysWithGroup: (
      day: number,
      groupId: string,
      input: TaskInput,
    ): string | null => {
      if (!input.title.trim()) return null;

      const state = get();
      const selectedDay = getDay(state, day);
      const selectedGroup = selectedDay?.groups.find((group) => group.id === groupId);
      if (!selectedGroup) return null;

      const hasLimit = state.template.days.some((templateDay) => {
        const currentDay = getDay(state, templateDay.day);
        return (
          currentDay &&
          currentDay.groups.some((group) => group.id === groupId) &&
          countGroupTasks(currentDay, groupId) >= MAX_TASKS_PER_GROUP
        );
      });
      if (hasLimit) return null;

      const originId = createId();
      set((currentState) =>
        updateAllDays(currentState, (currentDay) => {
          const hasGroup = currentDay.groups.some((group) => group.id === groupId);
          const task = createTask(originId, currentDay.day, groupId, input);

          return {
            ...currentDay,
            groups: hasGroup ? currentDay.groups : [...currentDay.groups, { ...selectedGroup }],
            tasks: [...currentDay.tasks, task],
            contentOrder: hasGroup
              ? currentDay.contentOrder
              : appendContentOrder(currentDay, { type: 'group', id: groupId }),
          };
        }),
      );

      return originId;
    },

    updateTask: (day: number, taskId: string, updates: TaskUpdate, scope: EditScope) => {
      const state = get();
      const selectedDay = getDay(state, day);
      const selectedTask = selectedDay?.tasks.find((task) => task.id === taskId);
      if (!selectedTask) return;

      const originId = selectedTask.originId ?? selectedTask.id;

      const updater = (currentDay: PlanDay): PlanDay => {
        const existingTask = currentDay.tasks.find(
          (task) => (task.originId ?? task.id) === originId,
        );

        if (!existingTask) {
          const newTask = {
            ...selectedTask,
            ...updates,
            id: `${originId}-day-${currentDay.day}`,
            originId,
          };

          return {
            ...currentDay,
            tasks: [...currentDay.tasks, newTask],
            contentOrder:
              newTask.groupId === null
                ? appendContentOrder(currentDay, { type: 'task', id: newTask.id })
                : currentDay.contentOrder,
          };
        }

        return {
          ...currentDay,
          tasks: currentDay.tasks.map((task) =>
            task.id === existingTask.id ? { ...task, ...updates } : task,
          ),
        };
      };

      set((currentState) =>
        scope === 'all'
          ? updateAllDays(currentState, updater)
          : updateOneDay(currentState, day, updater),
      );
    },

    deleteTask: (day: number, taskId: string, scope: EditScope) => {
      const state = get();
      const selectedDay = getDay(state, day);
      const selectedTask = selectedDay?.tasks.find((task) => task.id === taskId);
      if (!selectedTask) return;

      const originId = selectedTask.originId ?? selectedTask.id;
      const updater = (currentDay: PlanDay): PlanDay => ({
        ...currentDay,
        tasks: currentDay.tasks.filter((task) => (task.originId ?? task.id) !== originId),
        contentOrder:
          selectedTask.groupId === null
            ? (currentDay.contentOrder ?? []).filter(
                (item) => item.type !== 'task' || item.id !== taskId,
              )
            : currentDay.contentOrder,
      });

      set((currentState) =>
        scope === 'all'
          ? updateAllDays(currentState, updater)
          : updateOneDay(currentState, day, updater),
      );
    },

    moveTask: (
      day: number,
      taskId: string,
      targetGroupId: string | null,
      targetIndex: number,
    ) => {
      set((state) =>
        updateOneDay(state, day, (currentDay) => {
          const sourceTask = currentDay.tasks.find((task) => task.id === taskId);
          if (!sourceTask) return currentDay;

          if (
            targetGroupId !== null &&
            !currentDay.groups.some((group) => group.id === targetGroupId)
          ) {
            return currentDay;
          }

          const remainingTasks = currentDay.tasks.filter((task) => task.id !== taskId);
          if (
            targetGroupId !== null &&
            remainingTasks.filter((task) => task.groupId === targetGroupId).length >=
              MAX_TASKS_PER_GROUP
          ) {
            return currentDay;
          }

          const movedTask = { ...sourceTask, groupId: targetGroupId };
          const updatedTasks = [...remainingTasks];
          const targetTasks = updatedTasks.filter((task) => task.groupId === targetGroupId);
          const safeIndex = Math.max(0, Math.min(targetIndex, targetTasks.length));

          let insertIndex = updatedTasks.length;
          const targetTask = targetTasks[safeIndex];

          if (targetTask) {
            insertIndex = updatedTasks.findIndex((task) => task.id === targetTask.id);
          } else {
            const lastTask = targetTasks[targetTasks.length - 1];
            if (lastTask) {
              insertIndex = updatedTasks.findIndex((task) => task.id === lastTask.id) + 1;
            }
          }

          updatedTasks.splice(insertIndex, 0, movedTask);

          let contentOrder = [...(currentDay.contentOrder ?? [])];
          contentOrder = contentOrder.filter(
            (item) => !(item.type === 'task' && item.id === taskId),
          );

          if (targetGroupId === null) {
            contentOrder.push({ type: 'task', id: taskId });
          }

          return { ...currentDay, tasks: updatedTasks, contentOrder };
        }),
      );
    },

    moveContent: (
      day: number,
      active: PlanContentOrderItem,
      over: PlanContentOrderItem,
    ) => {
      set((state) =>
        updateOneDay(state, day, (currentDay) => {
          const contentOrder = [...(currentDay.contentOrder ?? [])];
          const activeIndex = contentOrder.findIndex(
            (item) => item.type === active.type && item.id === active.id,
          );
          const overIndex = contentOrder.findIndex(
            (item) => item.type === over.type && item.id === over.id,
          );

          if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
            return currentDay;
          }

          const movedItem = contentOrder[activeIndex];
          if (!movedItem) return currentDay;

          contentOrder.splice(activeIndex, 1);
          contentOrder.splice(overIndex, 0, movedItem);

          return { ...currentDay, contentOrder };
        }),
      );
    },
  };
}
