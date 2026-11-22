import type { PlanContentOrderItem, PlanWidgetType, UserPlanData, PlanTask, PlanWidget } from './planSchema';

export type EditScope = 'all' | 'day';

export type TaskInput = {
  title: string;
  durationMin?: number;
  xp?: number;
  required?: boolean;
  scheduledTime?: string;
};

export type TaskUpdate = Partial<
  Pick<PlanTask, 'title' | 'durationMin' | 'xp' | 'required' | 'scheduledTime'>
>;

export type WidgetUpdate = Partial<Pick<PlanWidget, 'enabled'>>;

export interface PlanActions {
  addDay: () => void;
  removeLastDay: () => void;
  updatePlanInfo: (title: string, description: string) => void;

  addGroup: (day: number, title: string, scope: EditScope) => string;
  updateGroup: (day: number, groupId: string, title: string, scope: EditScope) => void;
  deleteGroup: (day: number, groupId: string, scope: EditScope) => void;

  addTask: (day: number, groupId: string | null, input: TaskInput, scope: EditScope) => string | null;
  addTaskToAllDaysWithGroup: (day: number, groupId: string, input: TaskInput) => string | null;
  updateTask: (day: number, taskId: string, updates: TaskUpdate, scope: EditScope) => void;
  deleteTask: (day: number, taskId: string, scope: EditScope) => void;
  moveTask: (day: number, taskId: string, targetGroupId: string | null, targetIndex: number) => void;
  moveContent: (day: number, active: PlanContentOrderItem, over: PlanContentOrderItem) => void;

  addWidget: (day: number, type: PlanWidgetType, scope: EditScope) => string | null;
  updateWidget: (day: number, widgetId: string, updates: WidgetUpdate, scope: EditScope) => void;
  updateWidgetNotes: (day: number, widgetId: string, notes: string) => void;
  deleteWidget: (day: number, widgetId: string, scope: EditScope) => void;

  replaceAll: (data: UserPlanData) => void;
  reset: () => void;
}

export type PlanState = UserPlanData & PlanActions;

/** Narrow set/get types shared by the action factories. */
export type PlanSetState = (
  partial: Partial<PlanState> | ((state: PlanState) => Partial<PlanState>),
) => void;

export type PlanGetState = () => PlanState;
