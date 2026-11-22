import { createContext } from 'react';
import type { PlanTask } from '@/entities/plan';

export const TaskFocusContext = createContext<((day: number, task: PlanTask) => void) | null>(null);
