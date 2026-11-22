import { useState } from 'react';

import type { PlanDay, PlanWidgetType } from '@/entities/plan';

import { Button, Modal, Select } from '@/shared/ui';

import { GroupEditor } from './GroupEditor';
import { TaskEditor } from './TaskEditor';
import { FaPlus } from 'react-icons/fa6';

interface AddContentMenuProps {
  day: number;
  planDay: PlanDay;
  onAddWidget: (type: PlanWidgetType, scope: 'day' | 'all') => void;
}

export function AddContentMenu({ day, planDay, onAddWidget }: AddContentMenuProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isTaskTargetOpen, setIsTaskTargetOpen] = useState(false);
  const [isWidgetTypeOpen, setIsWidgetTypeOpen] = useState(false);
  const [isWidgetScopeOpen, setIsWidgetScopeOpen] = useState(false);
  const [isGroupEditorOpen, setIsGroupEditorOpen] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedWidgetType, setSelectedWidgetType] = useState<PlanWidgetType | null>(null);
  const [taskGroupId, setTaskGroupId] = useState<string | undefined>(undefined);

  const openTaskTarget = () => {
    setSelectedGroupId(planDay.groups[0]?.id ?? '');
    setIsAddMenuOpen(false);
    setIsTaskTargetOpen(true);
  };

  const openStandaloneTask = () => {
    setTaskGroupId(undefined);
    setIsTaskTargetOpen(false);
    setIsTaskEditorOpen(true);
  };

  const openGroupTask = () => {
    if (!selectedGroupId) return;

    setTaskGroupId(selectedGroupId);
    setIsTaskTargetOpen(false);
    setIsTaskEditorOpen(true);
  };

  const openWidgetType = () => {
    setIsAddMenuOpen(false);
    setIsWidgetTypeOpen(true);
  };

  const selectWidgetType = (type: PlanWidgetType) => {
    setSelectedWidgetType(type);
    setIsWidgetTypeOpen(false);
    setIsWidgetScopeOpen(true);
  };

  const handleAddWidget = (scope: 'day' | 'all') => {
    if (!selectedWidgetType) return;

    onAddWidget(selectedWidgetType, scope);

    setSelectedWidgetType(null);
    setIsWidgetScopeOpen(false);
  };

  const closeWidgetScope = () => {
    setIsWidgetScopeOpen(false);
    setSelectedWidgetType(null);
  };

  return (
    <>
      <Button
        size="md"
        variant="outline"
        icon={<FaPlus />}
        fullWidth
        aria-label="Добавить карточку, виджет, задачу"
        onClick={() => setIsAddMenuOpen(true)}
      >
        <span>Добавить<span className="hidden sm:inline"> карточку, виджет, задачу</span></span>
      </Button>

      <Modal open={isAddMenuOpen} onClose={() => setIsAddMenuOpen(false)} title="Что добавить?">
        <div className="flex flex-col gap-2">
          <Button
            fullWidth
            variant="outline"
            onClick={() => {
              setIsAddMenuOpen(false);
              setIsGroupEditorOpen(true);
            }}
          >
            Карточку
          </Button>

          <Button fullWidth variant="outline" onClick={openTaskTarget}>
            Задачу
          </Button>

          <Button fullWidth variant="outline" onClick={openWidgetType}>
            Виджет
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsAddMenuOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal
        open={isWidgetTypeOpen}
        onClose={() => setIsWidgetTypeOpen(false)}
        title="Выбери виджет"
      >
        <div className="flex flex-col gap-2">
          <Button fullWidth variant="outline" onClick={() => selectWidgetType('micro-breaks')}>
            Микро-паузы
          </Button>

          <Button fullWidth variant="outline" onClick={() => selectWidgetType('xp-by-days')}>
            XP по дням
          </Button>

          <Button fullWidth variant="outline" onClick={() => selectWidgetType('day-notes')}>
            Заметки дня
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsWidgetTypeOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal open={isWidgetScopeOpen} onClose={closeWidgetScope} title="Где отображать виджет?">
        <div className="flex flex-col gap-2">
          <Button fullWidth variant="primary" onClick={() => handleAddWidget('day')}>
            Только день {day}
          </Button>

          <Button fullWidth variant="outline" onClick={() => handleAddWidget('all')}>
            Во всех днях
          </Button>

          <Button variant="ghost" fullWidth onClick={closeWidgetScope}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal
        open={isTaskTargetOpen}
        onClose={() => setIsTaskTargetOpen(false)}
        title="Где создать задачу?"
      >
        <div className="flex flex-col gap-3">
          <Button fullWidth variant="outline" onClick={openStandaloneTask}>
            Самостоятельная задача
          </Button>

          <div className="flex flex-col gap-2">
            <Select
              label="Выбери карточку"
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              options={planDay.groups.map((group) => ({
                value: group.id,
                label: group.title,
              }))}
              placeholder="Выбрать карточку"
            />

            <Button
              fullWidth
              variant="primary"
              disabled={!selectedGroupId || planDay.groups.length === 0}
              onClick={openGroupTask}
            >
              Добавить в карточку
            </Button>
          </div>

          {planDay.groups.length === 0 && (
            <p className="text-sm text-gray-400">
              Сначала создай карточку, если хочешь добавить задачу внутрь неё.
            </p>
          )}

          <Button variant="ghost" fullWidth onClick={() => setIsTaskTargetOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <GroupEditor
        day={day}
        open={isGroupEditorOpen}
        onOpenChange={setIsGroupEditorOpen}
        hideTrigger
      />

      <TaskEditor
        day={day}
        groupId={taskGroupId}
        open={isTaskEditorOpen}
        onOpenChange={setIsTaskEditorOpen}
        hideTrigger
      />
    </>
  );
}
