import { expect, it } from 'vitest';
import type { PlanTask } from '@/entities/plan';
import { getGroupTasks } from './getGroupTasks';

it('сортирует только задачи выбранной карточки, в том числе после изменения времени', () => {
  const task = (id: string, groupId: string | null, scheduledTime?: string): PlanTask => ({
    id,
    groupId,
    scheduledTime,
    title: id,
    durationMin: 1,
    required: true,
    xp: 5,
  });
  const tasks = [
    task('без времени', 'утро'),
    task('первая', 'утро', '09:00'),
    task('отдельная', null, '06:00'),
    task('другая', 'обед', '07:00'),
    task('вторая', 'утро', '09:00'),
    task('отжимания', 'утро', '10:00'),
  ];
  const order = (items: PlanTask[]) => getGroupTasks(items, 'утро').map((item) => item.id);
  expect(order(tasks)).toEqual(['первая', 'вторая', 'отжимания', 'без времени']);
  const updated = tasks.map((item) =>
    item.id === 'отжимания' ? { ...item, scheduledTime: '08:00' } : item,
  );
  expect(order(updated)).toEqual(['отжимания', 'первая', 'вторая', 'без времени']);
  expect(updated[0]?.id).toBe('без времени');
});
