import { SLOT_ORDER } from '../config/slots';
import type { Slot, Task } from '../model/types';

export interface SlotGroup {
  slot: Slot;
  tasks: Task[];
}

/** Группирует задачи дня по времени суток в правильном порядке. Пустые группы не возвращаются. */
export function groupTasksBySlot(tasks: Task[]): SlotGroup[] {
  return SLOT_ORDER.map((slot) => ({
    slot,
    tasks: tasks.filter((task) => (task.slot ?? 'workday') === slot),
  })).filter((group) => group.tasks.length > 0);
}
